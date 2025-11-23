import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisitType, VisitMode, VisitStatus, SlotStatus } from '@prisma/client';
import { SlotService } from '../slots/slots.service';

@Injectable()
export class VisitService {
  private readonly logger = new Logger(VisitService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => SlotService))
    private slotService: SlotService,
  ) {}

  /**
   * Create a visit from a visit request
   */
  async createVisitFromRequest(requestId: string, providerId: string, slotId: string) {
    const request = await this.prisma.visitRequest.findUnique({
      where: { id: requestId },
      include: { patient: true },
    });

    if (!request) {
      throw new NotFoundException(`Visit request ${requestId} not found`);
    }

    // Verify slot is available
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }

    if (slot.status !== SlotStatus.FREE && slot.status !== SlotStatus.HELD) {
      throw new BadRequestException(`Slot ${slotId} is not available`);
    }

    // Book the slot
    await this.slotService.bookSlot(slotId);

    // Determine visit type
    const visitType = request.requestType === 'WALK_IN' ? VisitType.WALK_IN : VisitType.SCHEDULED;

    // Create visit
    const visit = await this.prisma.visit.create({
      data: {
        patientId: request.patientId,
        providerId,
        slotId,
        visitType,
        visitMode: request.visitMode,
        reasonText: request.reasonText,
        status: VisitStatus.PLANNED,
      },
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
        provider: true,
        slot: true,
      },
    });

    this.logger.log(`Created visit ${visit.id} from request ${requestId}`);
    return visit;
  }

  /**
   * Get visits for a patient
   */
  async getVisitsForPatient(patientId: string, filters?: {
    status?: VisitStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { patientId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.slot = {
        AND: [],
      };
      if (filters.startDate) {
        where.slot.AND.push({
          startTime: { gte: filters.startDate },
        });
      }
      if (filters.endDate) {
        where.slot.AND.push({
          endTime: { lte: filters.endDate },
        });
      }
    }

    return this.prisma.visit.findMany({
      where,
      include: {
        provider: true,
        slot: true,
        virtualSession: true,
      },
      orderBy: {
        slot: {
          startTime: 'desc',
        },
      },
    });
  }

  /**
   * Get visits for a provider
   */
  async getVisitsForProvider(providerId: string, filters?: {
    status?: VisitStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { providerId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.slot = {
        AND: [],
      };
      if (filters.startDate) {
        where.slot.AND.push({
          startTime: { gte: filters.startDate },
        });
      }
      if (filters.endDate) {
        where.slot.AND.push({
          endTime: { lte: filters.endDate },
        });
      }
    }

    return this.prisma.visit.findMany({
      where,
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
        slot: true,
        virtualSession: true,
      },
      orderBy: {
        slot: {
          startTime: 'asc',
        },
      },
    });
  }

  /**
   * Update visit status
   * State machine: PLANNED → CHECKED_IN → IN_PROGRESS → COMPLETED
   */
  async updateVisitStatus(visitId: string, status: VisitStatus) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException(`Visit ${visitId} not found`);
    }

    // Validate state transitions
    const validTransitions: Record<VisitStatus, VisitStatus[]> = {
      [VisitStatus.PLANNED]: [VisitStatus.CHECKED_IN, VisitStatus.CANCELLED],
      [VisitStatus.CHECKED_IN]: [VisitStatus.IN_PROGRESS, VisitStatus.NO_SHOW, VisitStatus.CANCELLED],
      [VisitStatus.IN_PROGRESS]: [VisitStatus.COMPLETED, VisitStatus.CANCELLED],
      [VisitStatus.COMPLETED]: [],
      [VisitStatus.CANCELLED]: [],
      [VisitStatus.NO_SHOW]: [],
    };

    const allowedStatuses = validTransitions[visit.status];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `Cannot transition visit from ${visit.status} to ${status}. Valid transitions: ${allowedStatuses.join(', ')}`,
      );
    }

    return this.prisma.visit.update({
      where: { id: visitId },
      data: { status },
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
        provider: true,
        slot: true,
        virtualSession: true,
      },
    });
  }

  /**
   * Get visit by ID
   */
  async findById(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
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
        provider: true,
        slot: true,
        virtualSession: true,
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit ${id} not found`);
    }

    return visit;
  }
}

