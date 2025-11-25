import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ClinicalNotesService } from './clinical-notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clinician/patients/:patientId/chart/notes')
@UseGuards(JwtAuthGuard)
export class ClinicalNotesController {
  constructor(private clinicalNotesService: ClinicalNotesService) {}

  @Get()
  async getNotes(
    @Param('patientId') patientId: string,
    @Request() req: any,
    @Body() query?: { encounterId?: string },
  ) {
    return this.clinicalNotesService.getNotes(patientId, query?.encounterId);
  }

  @Post()
  async createNote(
    @Param('patientId') patientId: string,
    @Request() req: any,
    @Body() dto: {
      encounterId?: string;
      type: string;
      title: string;
      content: string;
      source?: 'voice' | 'text' | 'check-in';
      originalText?: string;
      originalLanguage?: string;
      targetLang?: string;
    },
  ) {
    // Get providerId from user if they are a provider
    const providerId = req.user.providerId || undefined;
    
    return this.clinicalNotesService.createNote(patientId, providerId, dto);
  }

  @Get(':noteId')
  async getNote(@Param('noteId') noteId: string) {
    return this.clinicalNotesService.getNote(noteId);
  }
}

