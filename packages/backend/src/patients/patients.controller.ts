import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get()
  findAll(@Request() req) {
    // If user is clinic staff, filter by clinicId
    const clinicId = req.user.clinicId;
    return this.patientsService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }
}

