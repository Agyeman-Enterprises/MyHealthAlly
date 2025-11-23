import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelemedStatus, VisitStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VirtualVisitService {
  private readonly logger = new Logger(VirtualVisitService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a virtual visit session
   */
  async createSession(visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { virtualSession: true },
    });

    if (!visit) {
      throw new NotFoundException(`Visit ${visitId} not found`);
    }

    if (visit.visitMode !== 'VIRTUAL') {
      throw new BadRequestException('Visit is not a virtual visit');
    }

    if (visit.virtualSession) {
      // Session already exists, return it
      return visit.virtualSession;
    }

    // Generate unique room ID
    const roomId = `room_${uuidv4()}`;

    const session = await this.prisma.virtualVisitSession.create({
      data: {
        visitId,
        roomId,
        status: TelemedStatus.NOT_STARTED,
      },
      include: {
        visit: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            provider: true,
            slot: true,
          },
        },
      },
    });

    this.logger.log(`Created virtual visit session ${session.id} for visit ${visitId} with room ${roomId}`);
    return session;
  }

  /**
   * Patient joins the session
   */
  async joinSessionAsPatient(visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { virtualSession: true },
    });

    if (!visit) {
      throw new NotFoundException(`Visit ${visitId} not found`);
    }

    if (!visit.virtualSession) {
      // Create session if it doesn't exist
      await this.createSession(visitId);
      // Reload visit
      const reloaded = await this.prisma.visit.findUnique({
        where: { id: visitId },
        include: { virtualSession: true },
      });
      if (!reloaded || !reloaded.virtualSession) {
        throw new NotFoundException('Failed to create session');
      }
      visit.virtualSession = reloaded.virtualSession;
    }

    const session = visit.virtualSession;
    const now = new Date();

    // Update session status
    let newStatus = session.status;
    if (session.status === TelemedStatus.NOT_STARTED) {
      newStatus = TelemedStatus.WAITING;
    } else if (session.status === TelemedStatus.WAITING && session.providerJoinedAt) {
      newStatus = TelemedStatus.ACTIVE;
    }

    const updated = await this.prisma.virtualVisitSession.update({
      where: { id: session.id },
      data: {
        patientJoinedAt: now,
        status: newStatus,
      },
      include: {
        visit: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            provider: true,
            slot: true,
          },
        },
      },
    });

    // Update visit status if needed
    if (visit.status === VisitStatus.PLANNED) {
      await this.prisma.visit.update({
        where: { id: visitId },
        data: { status: VisitStatus.CHECKED_IN },
      });
    }

    if (newStatus === TelemedStatus.ACTIVE && visit.status === VisitStatus.CHECKED_IN) {
      await this.prisma.visit.update({
        where: { id: visitId },
        data: { status: VisitStatus.IN_PROGRESS },
      });
    }

    this.logger.log(`Patient joined session ${session.id} for visit ${visitId}`);
    return updated;
  }

  /**
   * Provider joins the session
   */
  async joinSessionAsProvider(visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { virtualSession: true },
    });

    if (!visit) {
      throw new NotFoundException(`Visit ${visitId} not found`);
    }

    if (!visit.virtualSession) {
      // Create session if it doesn't exist
      await this.createSession(visitId);
      // Reload visit
      const reloaded = await this.prisma.visit.findUnique({
        where: { id: visitId },
        include: { virtualSession: true },
      });
      if (!reloaded || !reloaded.virtualSession) {
        throw new NotFoundException('Failed to create session');
      }
      visit.virtualSession = reloaded.virtualSession;
    }

    const session = visit.virtualSession;
    const now = new Date();

    // Update session status
    let newStatus = session.status;
    if (session.status === TelemedStatus.NOT_STARTED) {
      newStatus = TelemedStatus.WAITING;
    } else if (session.status === TelemedStatus.WAITING && session.patientJoinedAt) {
      newStatus = TelemedStatus.ACTIVE;
    }

    const updated = await this.prisma.virtualVisitSession.update({
      where: { id: session.id },
      data: {
        providerJoinedAt: now,
        status: newStatus,
      },
      include: {
        visit: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            provider: true,
            slot: true,
          },
        },
      },
    });

    // Update visit status if needed
    if (visit.status === VisitStatus.PLANNED || visit.status === VisitStatus.CHECKED_IN) {
      if (newStatus === TelemedStatus.ACTIVE) {
        await this.prisma.visit.update({
          where: { id: visitId },
          data: { status: VisitStatus.IN_PROGRESS },
        });
      } else {
        await this.prisma.visit.update({
          where: { id: visitId },
          data: { status: VisitStatus.CHECKED_IN },
        });
      }
    }

    this.logger.log(`Provider joined session ${session.id} for visit ${visitId}`);
    return updated;
  }

  /**
   * End the session
   */
  async endSession(visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { virtualSession: true },
    });

    if (!visit) {
      throw new NotFoundException(`Visit ${visitId} not found`);
    }

    if (!visit.virtualSession) {
      throw new NotFoundException(`No session found for visit ${visitId}`);
    }

    const session = visit.virtualSession;

    if (session.status === TelemedStatus.ENDED) {
      return session;
    }

    const updated = await this.prisma.virtualVisitSession.update({
      where: { id: session.id },
      data: {
        status: TelemedStatus.ENDED,
        endedAt: new Date(),
      },
      include: {
        visit: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            provider: true,
            slot: true,
          },
        },
      },
    });

    // Update visit status if in progress
    if (visit.status === VisitStatus.IN_PROGRESS) {
      await this.prisma.visit.update({
        where: { id: visitId },
        data: { status: VisitStatus.COMPLETED },
      });
    }

    this.logger.log(`Ended session ${session.id} for visit ${visitId}`);
    return updated;
  }

  /**
   * Get session by visit ID
   */
  async getSessionByVisitId(visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        virtualSession: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        provider: true,
        slot: true,
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit ${visitId} not found`);
    }

    return visit.virtualSession || null;
  }

  /**
   * Get active sessions (waiting or in progress)
   */
  async getActiveSessions(providerId?: string) {
    const where: any = {
      status: {
        in: [TelemedStatus.WAITING, TelemedStatus.ACTIVE],
      },
    };

    if (providerId) {
      where.visit = {
        providerId,
      };
    }

    return this.prisma.virtualVisitSession.findMany({
      where,
      include: {
        visit: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            provider: true,
            slot: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

