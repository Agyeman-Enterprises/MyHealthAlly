import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Post()
  create(@Body() data: {
    patientId: string;
    visitId?: string;
    providerId: string;
    specialty: string;
    reason: string;
    priority?: string;
    referredTo?: string;
    notes?: string;
  }) {
    return this.referralsService.create(data);
  }

  @Post(':id/send')
  send(@Param('id') id: string) {
    return this.referralsService.send(id);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.referralsService.findByPatient(patientId);
  }

  @Get('provider/:providerId')
  findByProvider(@Param('providerId') providerId: string) {
    return this.referralsService.findByProvider(providerId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.referralsService.findById(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.referralsService.updateStatus(id, body.status);
  }
}

