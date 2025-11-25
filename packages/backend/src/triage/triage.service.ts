import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TriageService {
  private readonly logger = new Logger(TriageService.name);

  constructor(private prisma: PrismaService) {}

  async getTasks(filters?: {
    status?: string;
    severity?: string;
    intentType?: string;
    patientId?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.severity) {
      where.severity = filters.severity;
    }
    if (filters?.intentType) {
      where.intentType = filters.intentType;
    }
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    const tasks = await this.prisma.triageTask.findMany({
      where,
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
      },
      orderBy: [
        { severity: 'asc' }, // EMERGENT, URGENT, ROUTINE
        { createdAt: 'desc' },
      ],
    });

    return tasks.map((task) => ({
      ...task,
      patientName: task.patient
        ? `${task.patient.firstName || ''} ${task.patient.lastName || ''}`.trim() || 'Unknown Patient'
        : 'Unknown Patient',
    }));
  }

  async getTaskById(taskId: string) {
    const task = await this.prisma.triageTask.findUnique({
      where: { id: taskId },
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
      },
    });

    if (!task) {
      throw new NotFoundException(`Triage task ${taskId} not found`);
    }

    return {
      ...task,
      patientName: task.patient
        ? `${task.patient.firstName || ''} ${task.patient.lastName || ''}`.trim() || 'Unknown Patient'
        : 'Unknown Patient',
    };
  }

  async updateTask(
    taskId: string,
    updates: {
      status?: string;
      severity?: string;
      notes?: string;
      assignedMAId?: string;
      actionNote?: string;
      handledByUserId?: string;
      handledByRole?: string;
      firstActionAt?: string;
    },
  ) {
    const updateData: any = { ...updates };
    if (updates.firstActionAt) {
      updateData.firstActionAt = new Date(updates.firstActionAt);
    }
    updateData.lastActionAt = new Date();

    const task = await this.prisma.triageTask.update({
      where: { id: taskId },
      data: updateData,
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
      },
    });

    return {
      ...task,
      patientName: task.patient
        ? `${task.patient.firstName || ''} ${task.patient.lastName || ''}`.trim() || 'Unknown Patient'
        : 'Unknown Patient',
    };
  }

  async closeTask(
    taskId: string,
    data: {
      actionNote: string;
      handledByUserId: string;
      handledByRole: string;
    },
  ) {
    const task = await this.prisma.triageTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        actionNote: data.actionNote,
        handledByUserId: data.handledByUserId,
        handledByRole: data.handledByRole,
        closedAt: new Date(),
        lastActionAt: new Date(),
      },
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
      },
    });

    // Create log entry
    await this.prisma.triageTaskLog.create({
      data: {
        taskId: task.id,
        actorId: data.handledByUserId,
        actorRole: data.handledByRole,
        actionType: 'CLOSED',
        details: {
          actionNote: data.actionNote,
        },
      },
    });

    return {
      ...task,
      patientName: task.patient
        ? `${task.patient.firstName || ''} ${task.patient.lastName || ''}`.trim() || 'Unknown Patient'
        : 'Unknown Patient',
    };
  }

  async getTaskLogs(taskId: string) {
    return this.prisma.triageTaskLog.findMany({
      where: { taskId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async addTaskLog(
    taskId: string,
    log: {
      actorId?: string;
      actorRole: string;
      actionType: string;
      details?: any;
    },
  ) {
    return this.prisma.triageTaskLog.create({
      data: {
        taskId,
        actorId: log.actorId,
        actorRole: log.actorRole,
        actionType: log.actionType,
        details: log.details || {},
      },
    });
  }

  async markOverdueTasks() {
    // Mark tasks as overdue if they've been open for more than 24 hours and are URGENT or EMERGENT
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const overdueTasks = await this.prisma.triageTask.updateMany({
      where: {
        status: 'OPEN',
        severity: { in: ['URGENT', 'EMERGENT'] },
        createdAt: { lt: oneDayAgo },
        isOverdue: false,
      },
      data: {
        isOverdue: true,
      },
    });

    return {
      count: overdueTasks.count,
      tasks: await this.getTasks({ status: 'OPEN' }),
    };
  }
}

