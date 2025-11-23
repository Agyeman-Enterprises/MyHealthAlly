import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createThread(patientId: string, clinicId: string, subject?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    return this.prisma.messageThread.create({
      data: {
        patientId,
        clinicId,
        subject,
        participants: [patient.userId],
      },
    });
  }

  async getThreadsForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient) return [];

      return this.prisma.messageThread.findMany({
        where: { patientId: patient.id },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });
    } else {
      // Clinic staff can see all threads in their clinic
      return this.prisma.messageThread.findMany({
        where: { clinicId: user.clinicId },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });
    }
  }

  async getThread(threadId: string, userId: string) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            thread: false,
          },
        },
      },
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    // Verify user has access
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });
      if (patient?.id !== thread.patientId) {
        throw new Error('Unauthorized');
      }
    } else if (user?.clinicId !== thread.clinicId) {
      throw new Error('Unauthorized');
    }

    return thread;
  }

  async sendMessage(
    threadId: string,
    senderId: string,
    content: string,
    attachments?: any[],
  ) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    const message = await this.prisma.message.create({
      data: {
        threadId,
        senderId,
        content,
        attachments: attachments || null,
      },
    });

    // Update thread last message time
    await this.prisma.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId === userId) {
      return; // Can't mark own messages as read
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markThreadAsRead(threadId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return 0;

    if (user.role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient) return 0;

      return this.prisma.message.count({
        where: {
          thread: {
            patientId: patient.id,
          },
          senderId: { not: userId },
          read: false,
        },
      });
    } else {
      return this.prisma.message.count({
        where: {
          thread: {
            clinicId: user.clinicId,
          },
          senderId: { not: userId },
          read: false,
        },
      });
    }
  }
}
