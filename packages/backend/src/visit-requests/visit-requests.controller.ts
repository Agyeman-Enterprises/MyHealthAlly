import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VisitRequestsService } from './visit-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestType, VisitMode, SeverityLevel, RequestStatus } from '@prisma/client';

@Controller('visit-requests')
@UseGuards(JwtAuthGuard)
export class VisitRequestsController {
  constructor(private visitRequestsService: VisitRequestsService) {}

  @Post('walk-in')
  createWalkIn(
    @Body()
    data: {
      patientId: string;
      visitMode: VisitMode;
      reasonText: string;
      reasonCategory?: string;
      severity?: SeverityLevel;
    },
  ) {
    return this.visitRequestsService.createWalkInRequest(data.patientId, data);
  }

  @Post('scheduled')
  createScheduled(
    @Body()
    data: {
      patientId: string;
      visitMode: VisitMode;
      requestedDate?: Date;
      windowStart?: Date;
      windowEnd?: Date;
      reasonText: string;
      reasonCategory?: string;
      severity?: SeverityLevel;
    },
  ) {
    return this.visitRequestsService.createScheduledRequest(data.patientId, data);
  }

  @Put(':id/triage')
  triage(@Param('id') id: string) {
    return this.visitRequestsService.triageRequest(id);
  }

  @Put(':id/offer-slots')
  offerSlots(
    @Param('id') id: string,
    @Body() body: { slotIds: string[] },
  ) {
    return this.visitRequestsService.offerSlots(id, body.slotIds);
  }

  @Post(':id/assign-immediate')
  assignImmediate(
    @Param('id') id: string,
    @Body() body: { providerId: string; slotId: string },
  ) {
    return this.visitRequestsService.assignImmediateVisit(id, body.providerId, body.slotId);
  }

  @Put(':id/convert-to-visit')
  convertToVisit(
    @Param('id') id: string,
    @Body() body: { providerId: string },
  ) {
    return this.visitRequestsService.convertToVisit(id, body.providerId);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.visitRequestsService.cancelRequest(id);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.visitRequestsService.findByPatient(patientId);
  }

  @Get()
  findAll(
    @Query('status') status?: RequestStatus,
    @Query('requestType') requestType?: RequestType,
    @Query('severity') severity?: SeverityLevel,
  ) {
    return this.visitRequestsService.findAll({ status, requestType, severity });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.visitRequestsService.findById(id);
  }
}
