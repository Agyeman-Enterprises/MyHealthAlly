import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SlotService } from './slots.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VisitMode, SlotStatus } from '@prisma/client';

@Controller('slots')
@UseGuards(JwtAuthGuard)
export class SlotsController {
  constructor(private slotService: SlotService) {}

  @Get('available')
  findAvailable(
    @Query('providerId') providerId?: string,
    @Query('visitMode') visitMode?: VisitMode,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minDurationMinutes') minDurationMinutes?: string,
  ) {
    return this.slotService.findAvailableSlots({
      providerId,
      visitMode,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minDurationMinutes: minDurationMinutes ? parseInt(minDurationMinutes, 10) : undefined,
    });
  }

  @Post('generate')
  generateSlots(
    @Body() body: { providerId: string; startDate: string; endDate: string },
  ) {
    return this.slotService.autoGenerateSlotsFromAvailability(
      body.providerId,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Put(':id/hold')
  holdSlot(
    @Param('id') id: string,
    @Body() body: { expiry: string },
  ) {
    return this.slotService.holdSlot(id, new Date(body.expiry));
  }

  @Put(':id/book')
  bookSlot(@Param('id') id: string) {
    return this.slotService.bookSlot(id);
  }

  @Put(':id/release')
  releaseSlot(@Param('id') id: string) {
    return this.slotService.releaseSlot(id);
  }

  @Put(':id/block')
  blockSlot(@Param('id') id: string) {
    return this.slotService.blockSlot(id);
  }

  @Get('provider/:providerId')
  findByProvider(
    @Param('providerId') providerId: string,
    @Query('status') status?: SlotStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.slotService.findByProvider(providerId, {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}

