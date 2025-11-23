import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { LabOrdersService } from './lab-orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lab-orders')
@UseGuards(JwtAuthGuard)
export class LabOrdersController {
  constructor(private labOrdersService: LabOrdersService) {}

  @Post()
  create(@Body() data: {
    patientId: string;
    visitId?: string;
    providerId: string;
    tests: string[];
    notes?: string;
  }) {
    return this.labOrdersService.create(data);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.labOrdersService.findByPatient(patientId);
  }

  @Get('provider/:providerId')
  findByProvider(@Param('providerId') providerId: string) {
    return this.labOrdersService.findByProvider(providerId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.labOrdersService.findById(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; results?: any },
  ) {
    return this.labOrdersService.updateStatus(id, body.status, body.results);
  }
}

