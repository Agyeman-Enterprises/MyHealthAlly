import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { VisitRequestsService } from './visit-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patients/:patientId/visit-requests')
@UseGuards(JwtAuthGuard)
export class VisitRequestsController {
  constructor(private visitRequestsService: VisitRequestsService) {}

  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body() data: {
      type: 'MA_CHECK' | 'PROVIDER';
      notes?: string;
    },
  ) {
    return this.visitRequestsService.create(patientId, data);
  }

  @Get()
  findByPatient(@Param('patientId') patientId: string) {
    return this.visitRequestsService.findByPatient(patientId);
  }
}

