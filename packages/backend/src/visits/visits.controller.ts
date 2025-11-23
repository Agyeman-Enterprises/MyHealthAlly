import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VisitService } from './visits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VisitStatus } from '@prisma/client';

@Controller('visits')
@UseGuards(JwtAuthGuard)
export class VisitsController {
  constructor(private visitService: VisitService) {}

  @Get('patient/:patientId')
  getForPatient(
    @Param('patientId') patientId: string,
    @Query('status') status?: VisitStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.visitService.getVisitsForPatient(patientId, {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('provider/:providerId')
  getForProvider(
    @Param('providerId') providerId: string,
    @Query('status') status?: VisitStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.visitService.getVisitsForProvider(providerId, {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: VisitStatus },
  ) {
    return this.visitService.updateVisitStatus(id, body.status);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.visitService.findById(id);
  }
}

