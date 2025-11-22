import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CarePlansService } from './care-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CarePlanPhase } from '@myhealthally/shared';

@Controller('patients/:patientId/care-plans')
@UseGuards(JwtAuthGuard)
export class CarePlansController {
  constructor(private carePlansService: CarePlansService) {}

  @Get()
  findByPatient(@Param('patientId') patientId: string) {
    return this.carePlansService.findByPatient(patientId);
  }

  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body('phases') phases: CarePlanPhase[],
  ) {
    return this.carePlansService.create(patientId, phases);
  }

  @Put()
  update(
    @Param('patientId') patientId: string,
    @Body('phases') phases: CarePlanPhase[],
  ) {
    return this.carePlansService.update(patientId, phases);
  }
}

