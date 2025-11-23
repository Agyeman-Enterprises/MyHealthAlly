import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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

  @Get('me')
  async getMe(@Request() req) {
    // Get current patient based on authenticated user
    if (req.user.role === 'PATIENT') {
      const patient = await this.patientsService.findByUserId(req.user.id);
      if (!patient) {
        throw new Error('Patient record not found');
      }
      return patient;
    }
    throw new Error('Unauthorized');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Get('me/vitals')
  async getMyVitals(@Request() req) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.getVitalsSummary(patient.id);
  }

  @Post('me/vitals')
  async recordVital(@Request() req, @Body() data: { type: string; value: number | string; timestamp?: string; source?: string }) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.recordVital(patient.id, data);
  }

  @Get('me/lab-orders')
  async getMyLabOrders(@Request() req) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.getLabOrders(patient.id);
  }

  @Get('me/lab-results')
  async getMyLabResults(@Request() req) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.getLabResults(patient.id);
  }

  @Get('me/referrals')
  async getMyReferrals(@Request() req) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.getReferrals(patient.id);
  }

  @Get('me/documents')
  async getMyDocuments(@Request() req) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.getDocuments(patient.id);
  }
}
