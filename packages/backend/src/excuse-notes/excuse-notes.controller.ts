import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ExcuseNotesService } from './excuse-notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('excuse-notes')
@UseGuards(JwtAuthGuard)
export class ExcuseNotesController {
  constructor(private excuseNotesService: ExcuseNotesService) {}

  @Post()
  create(@Body() data: {
    patientId: string;
    visitId?: string;
    providerId: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    restrictions?: string;
  }) {
    return this.excuseNotesService.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  }

  @Post(':id/send')
  send(@Param('id') id: string) {
    return this.excuseNotesService.send(id);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.excuseNotesService.findByPatient(patientId);
  }

  @Get('provider/:providerId')
  findByProvider(@Param('providerId') providerId: string) {
    return this.excuseNotesService.findByProvider(providerId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.excuseNotesService.findById(id);
  }
}

