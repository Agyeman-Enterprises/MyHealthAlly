import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisitMode, SlotStatus } from '@prisma/client';

@Injectable()
export class SlotService {
  private readonly logger = new Logger(SlotService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find available slots matching criteria
   */
  async findAvailableSlots(filters: {
    providerId?: string;
    visitMode?: VisitMode;
    startDate?: Date;
    endDate?: Date;
    minDurationMinutes?: number;
  }) {
    const where: any = {
      status: SlotStatus.FREE,
    };

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    if (filters.visitMode) {
      where.visitMode = filters.visitMode;
    }

    if (filters.startDate || filters.endDate) {
      where.AND = [];
      if (filters.startDate) {
        where.AND.push({
          startTime: { gte: filters.startDate },
        });
      }
      if (filters.endDate) {
        where.AND.push({
          endTime: { lte: filters.endDate },
        });
      }
    }

    const slots = await this.prisma.visitSlot.findMany({
      where,
      include: {
        provider: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Filter by minimum duration if specified
    if (filters.minDurationMinutes) {
      return slots.filter(slot => {
        const durationMs = slot.endTime.getTime() - slot.startTime.getTime();
        const durationMinutes = durationMs / (1000 * 60);
        return durationMinutes >= filters.minDurationMinutes!;
      });
    }

    return slots;
  }

  /**
   * Auto-generate slots from provider availability
   */
  async autoGenerateSlotsFromAvailability(
    providerId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const availability = await this.prisma.providerAvailability.findMany({
      where: {
        providerId,
        status: 'ACTIVE',
      },
    });

    const slots: any[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      for (const avail of availability) {
        // Check if this availability applies to this date
        if (avail.date) {
          // Specific date availability
          if (avail.date.toDateString() !== currentDate.toDateString()) {
            continue;
          }
        } else if (avail.dayOfWeek !== null) {
          // Recurring day-of-week availability
          if (avail.dayOfWeek !== dayOfWeek) {
            continue;
          }
        } else {
          continue;
        }

        // Generate slot for this availability
        const slotStart = new Date(currentDate);
        slotStart.setHours(avail.startTime.getHours(), avail.startTime.getMinutes(), 0, 0);

        const slotEnd = new Date(currentDate);
        slotEnd.setHours(avail.endTime.getHours(), avail.endTime.getMinutes(), 0, 0);

        // Check if slot already exists
        const existing = await this.prisma.visitSlot.findFirst({
          where: {
            providerId,
            startTime: slotStart,
            endTime: slotEnd,
          },
        });

        if (!existing) {
          slots.push({
            providerId,
            startTime: slotStart,
            endTime: slotEnd,
            visitMode: avail.visitMode,
            status: SlotStatus.FREE,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create all slots
    if (slots.length > 0) {
      await this.prisma.visitSlot.createMany({
        data: slots,
        skipDuplicates: true,
      });
    }

    this.logger.log(`Generated ${slots.length} slots for provider ${providerId}`);
    return slots.length;
  }

  /**
   * Hold a slot (reserve it temporarily)
   * FREE → HELD
   */
  async holdSlot(slotId: string, expiry: Date) {
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }

    if (slot.status !== SlotStatus.FREE) {
      throw new BadRequestException(`Cannot hold slot in status ${slot.status}`);
    }

    return this.prisma.visitSlot.update({
      where: { id: slotId },
      data: {
        status: SlotStatus.HELD,
        heldUntil: expiry,
      },
    });
  }

  /**
   * Book a slot (permanently reserve it)
   * FREE or HELD → BOOKED
   */
  async bookSlot(slotId: string) {
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }

    if (slot.status !== SlotStatus.FREE && slot.status !== SlotStatus.HELD) {
      throw new BadRequestException(`Cannot book slot in status ${slot.status}`);
    }

    return this.prisma.visitSlot.update({
      where: { id: slotId },
      data: {
        status: SlotStatus.BOOKED,
        heldUntil: null,
      },
    });
  }

  /**
   * Release a slot (make it available again)
   * HELD → FREE
   */
  async releaseSlot(slotId: string) {
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }

    if (slot.status !== SlotStatus.HELD) {
      // Already released or booked, no-op
      return slot;
    }

    return this.prisma.visitSlot.update({
      where: { id: slotId },
      data: {
        status: SlotStatus.FREE,
        heldUntil: null,
      },
    });
  }

  /**
   * Block a slot (mark as unavailable)
   */
  async blockSlot(slotId: string) {
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }

    return this.prisma.visitSlot.update({
      where: { id: slotId },
      data: {
        status: SlotStatus.BLOCKED,
        heldUntil: null,
      },
    });
  }

  /**
   * Get slots by provider
   */
  async findByProvider(providerId: string, filters?: {
    status?: SlotStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { providerId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.AND = [];
      if (filters.startDate) {
        where.AND.push({
          startTime: { gte: filters.startDate },
        });
      }
      if (filters.endDate) {
        where.AND.push({
          endTime: { lte: filters.endDate },
        });
      }
    }

    return this.prisma.visitSlot.findMany({
      where,
      include: {
        provider: true,
        visit: {
          include: {
            virtualSession: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }
}

