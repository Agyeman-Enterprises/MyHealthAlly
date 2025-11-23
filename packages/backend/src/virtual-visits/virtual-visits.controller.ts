import { Controller, Get, Post, Put, Param, Query, UseGuards } from '@nestjs/common';
import { VirtualVisitService } from './virtual-visits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('virtual-visits')
@UseGuards(JwtAuthGuard)
export class VirtualVisitsController {
  constructor(private virtualVisitService: VirtualVisitService) {}

  @Post('visit/:visitId/session')
  createSession(@Param('visitId') visitId: string) {
    return this.virtualVisitService.createSession(visitId);
  }

  @Put('visit/:visitId/join-patient')
  joinAsPatient(@Param('visitId') visitId: string) {
    return this.virtualVisitService.joinSessionAsPatient(visitId);
  }

  @Put('visit/:visitId/join-provider')
  joinAsProvider(@Param('visitId') visitId: string) {
    return this.virtualVisitService.joinSessionAsProvider(visitId);
  }

  @Put('visit/:visitId/end')
  endSession(@Param('visitId') visitId: string) {
    return this.virtualVisitService.endSession(visitId);
  }

  @Get('visit/:visitId/session')
  getSession(@Param('visitId') visitId: string) {
    return this.virtualVisitService.getSessionByVisitId(visitId);
  }

  @Get('active')
  getActiveSessions(@Query('providerId') providerId?: string) {
    return this.virtualVisitService.getActiveSessions(providerId);
  }
}

