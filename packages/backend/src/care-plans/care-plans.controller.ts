import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CarePlansService } from './care-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CarePlanPhase } from '@myhealthally/shared';

@Controller('patients/:patientId/care-plans')
@UseGuards(JwtAuthGuard)
export class CarePlansController {
  constructor(private carePlansService: CarePlansService) {}

  @Get()
  findByPatient(
    @Param('patientId') patientId: string,
    @Request() req: any,
    @Query('forPatient') forPatient?: string,
  ) {
    // If requesting user is the patient, return translated version
    const isPatient = req.user.role === 'PATIENT';
    const shouldReturnForPatient = forPatient === 'true' || isPatient;
    
    return this.carePlansService.findByPatient(patientId, shouldReturnForPatient);
  }

  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body() body: { phases: CarePlanPhase[]; title?: string },
  ) {
    return this.carePlansService.create(patientId, body.phases, body.title);
  }

  @Put()
  update(
    @Param('patientId') patientId: string,
    @Body() body: { phases: CarePlanPhase[]; title?: string },
  ) {
    return this.carePlansService.update(patientId, body.phases, body.title);
  }
}
