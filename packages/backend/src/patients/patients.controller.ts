import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
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

  @Get('me/language')
  async getMyLanguage(@Request() req) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.getLanguagePreferences(patient.id);
  }

  @Post('me/language')
  async setMyLanguage(@Request() req, @Body() data: { preferredLanguage: string }) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.setPreferredLanguage(patient.id, data.preferredLanguage);
  }

  @Get('me/language/prompt')
  async checkLanguagePrompt(@Request() req) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.checkLanguagePrompt(patient.id);
  }

  @Get('me/appointments')
  async getMyAppointments(@Request() req, @Query('upcoming') upcoming?: string) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    return this.patientsService.getAppointments(patient.id, upcoming === 'true');
  }

  @Get('me/messages')
  async getMyMessages(@Request() req, @Query('limit') limit?: string) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.patientsService.getRecentMessages(patient.id, limitNum);
  }

  @Get('me/measurements')
  async getMyMeasurements(@Request() req, @Query('type') type?: string, @Query('limit') limit?: string) {
    if (req.user.role !== 'PATIENT') {
      throw new Error('Unauthorized');
    }
    const patient = await this.patientsService.findByUserId(req.user.id);
    if (!patient) {
      throw new Error('Patient record not found');
    }
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.patientsService.getMeasurements(patient.id, type, limitNum);
  }
}
