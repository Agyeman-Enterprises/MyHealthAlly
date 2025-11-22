import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MeasurementType } from '@myhealthally/shared';

@Controller('patients/:patientId/measurements')
@UseGuards(JwtAuthGuard)
export class MeasurementsController {
  constructor(private measurementsService: MeasurementsService) {}

  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body() data: {
      type: MeasurementType;
      value: number | Record<string, any>;
      timestamp: Date;
      source: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.measurementsService.create(patientId, data);
  }

  @Get()
  findAll(
    @Param('patientId') patientId: string,
    @Request() req: any,
  ) {
    // Patients can only see their own measurements
    if (req.user.role === 'PATIENT' && req.user.patientId !== patientId) {
      throw new Error('Unauthorized');
    }
    return this.measurementsService.findByPatient(patientId);
  }

  @Get('recent')
  getRecent(
    @Param('patientId') patientId: string,
    @Body('type') type: MeasurementType,
    @Body('days') days: number = 7,
  ) {
    return this.measurementsService.getRecentByType(patientId, type, days);
  }
}

