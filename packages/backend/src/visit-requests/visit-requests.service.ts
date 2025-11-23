import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestType, VisitMode, SeverityLevel, RequestStatus, SlotStatus } from '@prisma/client';
import { SlotService } from '../slots/slots.service';
import { VisitService } from '../visits/visits.service';

@Injectable()
export class VisitRequestsService {
  private readonly logger = new Logger(VisitRequestsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => SlotService))
    private slotService: SlotService,
    @Inject(forwardRef(() => VisitService))
    private visitService: VisitService,
  ) {}

  /**
   * Create a walk-in visit request
   */
  async createWalkInRequest(
    patientId: string,
    data: {
      visitMode: VisitMode;
      reasonText: string;
      reasonCategory?: string;
      severity?: SeverityLevel;
    },
  ) {
    // Check for RED severity - block scheduling
    if (data.severity === 'RED') {
      throw new BadRequestException('Emergency Protocol Required. Please contact emergency services or your clinic immediately.');
    }

    return this.prisma.visitRequest.create({
      data: {
        patientId,
        requestType: RequestType.WALK_IN,
        visitMode: data.visitMode,
        reasonText: data.reasonText,
        reasonCategory: data.reasonCategory,
        severity: data.severity || SeverityLevel.GREEN,
        status: RequestStatus.NEW,
      },
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
      },
    });
  }

  /**
   * Create a scheduled visit request
   */
  async createScheduledRequest(
    patientId: string,
    data: {
      visitMode: VisitMode;
      requestedDate?: Date;
      windowStart?: Date;
      windowEnd?: Date;
      reasonText: string;
      reasonCategory?: string;
      severity?: SeverityLevel;
    },
  ) {
    // Check for RED severity - block scheduling
    if (data.severity === 'RED') {
      throw new BadRequestException('Emergency Protocol Required. Please contact emergency services or your clinic immediately.');
    }

    return this.prisma.visitRequest.create({
      data: {
        patientId,
        requestType: RequestType.SCHEDULED,
        visitMode: data.visitMode,
        requestedDate: data.requestedDate,
        windowStart: data.windowStart,
        windowEnd: data.windowEnd,
        reasonText: data.reasonText,
        reasonCategory: data.reasonCategory,
        severity: data.severity || SeverityLevel.GREEN,
        status: RequestStatus.NEW,
      },
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
      },
    });
  }

  /**
   * Triage a request (MA opens and reviews)
   * NEW → TRIAGED
   */
  async triageRequest(requestId: string) {
    const request = await this.prisma.visitRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Visit request ${requestId} not found`);
    }

    if (request.status !== RequestStatus.NEW) {
      throw new BadRequestException(`Cannot triage request in status ${request.status}`);
    }

    return this.prisma.visitRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.TRIAGED,
      },
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
      },
    });
  }

  /**
   * Offer available slots to patient
   * TRIAGED → AWAITING_PATIENT_CONFIRMATION
   */
  async offerSlots(requestId: string, slotIds: string[]) {
    const request = await this.prisma.visitRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Visit request ${requestId} not found`);
    }

    if (request.status !== RequestStatus.TRIAGED) {
      throw new BadRequestException(`Cannot offer slots for request in status ${request.status}`);
    }

    // Verify slots are available and match request criteria
    const slots = await this.prisma.visitSlot.findMany({
      where: {
        id: { in: slotIds },
        status: SlotStatus.FREE,
        visitMode: request.visitMode,
      },
    });

    if (slots.length !== slotIds.length) {
      throw new BadRequestException('One or more slots are not available');
    }

    // Hold the first slot as proposed
    const proposedSlotId = slotIds[0];
    await this.slotService.holdSlot(proposedSlotId, new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours

    return this.prisma.visitRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.AWAITING_PATIENT_CONFIRMATION,
        proposedSlotId,
      },
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
      },
    });
  }

  /**
   * Assign immediate visit for walk-in
   * Creates visit directly from request
   */
  async assignImmediateVisit(requestId: string, providerId: string, slotId: string) {
    const request = await this.prisma.visitRequest.findUnique({
      where: { id: requestId },
      include: { patient: true },
    });

    if (!request) {
      throw new NotFoundException(`Visit request ${requestId} not found`);
    }

    if (request.requestType !== RequestType.WALK_IN) {
      throw new BadRequestException('Can only assign immediate visits for walk-in requests');
    }

    if (request.status !== RequestStatus.NEW && request.status !== RequestStatus.TRIAGED) {
      throw new BadRequestException(`Cannot assign immediate visit for request in status ${request.status}`);
    }

    // Create visit from request
    const visit = await this.visitService.createVisitFromRequest(requestId, providerId, slotId);

    // Update request status
    await this.prisma.visitRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.CONVERTED_TO_VISIT,
      },
    });

    return visit;
  }

  /**
   * Hold a slot for a request
   */
  async holdSlot(slotId: string, expiry: Date) {
    return this.slotService.holdSlot(slotId, expiry);
  }

  /**
   * Release held slots that have expired
   */
  async releaseHeldSlots() {
    const now = new Date();
    const expiredSlots = await this.prisma.visitSlot.findMany({
      where: {
        status: SlotStatus.HELD,
        heldUntil: {
          lt: now,
        },
      },
    });

    for (const slot of expiredSlots) {
      await this.slotService.releaseSlot(slot.id);
    }

    // Reset requests that were awaiting confirmation but slot expired
    await this.prisma.visitRequest.updateMany({
      where: {
        status: RequestStatus.AWAITING_PATIENT_CONFIRMATION,
        proposedSlotId: {
          in: expiredSlots.map(s => s.id),
        },
      },
      data: {
        status: RequestStatus.TRIAGED,
        proposedSlotId: null,
      },
    });

    this.logger.log(`Released ${expiredSlots.length} expired held slots`);
    return expiredSlots.length;
  }

  /**
   * Convert request to visit (patient accepted slot)
   * AWAITING_PATIENT_CONFIRMATION → CONVERTED_TO_VISIT
   */
  async convertToVisit(requestId: string, providerId: string) {
    const request = await this.prisma.visitRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Visit request ${requestId} not found`);
    }

    if (request.status !== RequestStatus.AWAITING_PATIENT_CONFIRMATION) {
      throw new BadRequestException(`Cannot convert request in status ${request.status} to visit`);
    }

    if (!request.proposedSlotId) {
      throw new BadRequestException('No proposed slot found for this request');
    }

    // Create visit
    const visit = await this.visitService.createVisitFromRequest(requestId, providerId, request.proposedSlotId);

    // Update request status
    await this.prisma.visitRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.CONVERTED_TO_VISIT,
      },
    });

    return visit;
  }

  /**
   * Cancel a request
   */
  async cancelRequest(requestId: string) {
    const request = await this.prisma.visitRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Visit request ${requestId} not found`);
    }

    // Release held slot if any
    if (request.proposedSlotId) {
      await this.slotService.releaseSlot(request.proposedSlotId);
    }

    return this.prisma.visitRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.CANCELLED,
        proposedSlotId: null,
      },
    });
  }

  /**
   * Find requests by patient
   */
  async findByPatient(patientId: string) {
    return this.prisma.visitRequest.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
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
      },
    });
  }

  /**
   * Find all requests with optional filters
   */
  async findAll(filters?: {
    status?: RequestStatus;
    requestType?: RequestType;
    severity?: SeverityLevel;
  }) {
    return this.prisma.visitRequest.findMany({
      where: filters,
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get request by ID
   */
  async findById(id: string) {
    const request = await this.prisma.visitRequest.findUnique({
      where: { id },
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
      },
    });

    if (!request) {
      throw new NotFoundException(`Visit request ${id} not found`);
    }

    return request;
  }
}
