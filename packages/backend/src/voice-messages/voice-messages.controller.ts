import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VoiceMessagesService } from './voice-messages.service';

const uploadsDir = join(process.cwd(), 'uploads', 'voice');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@Controller()
@UseGuards(JwtAuthGuard)
export class VoiceMessagesController {
  constructor(private voiceMessagesService: VoiceMessagesService) {}

  @Post('patients/me/voice-logs')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname || '.webm')}`);
        },
      }),
      limits: {
        fileSize: 15 * 1024 * 1024,
      },
    }),
  )
  async uploadVoiceLog(
    @Request() req: any,
    @Body('transcript') transcript: string,
    @Body('timestamp') timestamp?: string,
    @Body('language') language?: string,
    @UploadedFile() audio?: Express.Multer.File,
  ) {
    if (req.user.role !== 'PATIENT' || !req.user.patientId) {
      throw new Error('Only patients can upload voice messages');
    }

    const result = await this.voiceMessagesService.createFromPatient(req.user.patientId, {
      transcript,
      recordedAt: timestamp,
      audioFile: audio,
      sourceLanguage: language,
    });

    return {
      success: true,
      voiceMessageId: result.voiceMessage.id,
      triageTaskId: result.triageTask.id,
      severity: result.voiceMessage.severity,
      intentType: result.voiceMessage.intentType,
      aiSummary: result.voiceMessage.aiSummary,
      patientMessage: result.patientMessage,
    };
  }

  @Post('patients/me/voice-messages')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname || '.webm')}`);
        },
      }),
    }),
  )
  async uploadVoiceMessage(
    @Request() req: any,
    @Body('transcript') transcript: string,
    @Body('timestamp') timestamp?: string,
    @Body('language') language?: string,
    @UploadedFile() audio?: Express.Multer.File,
  ) {
    return this.uploadVoiceLog(req, transcript, timestamp, language, audio);
  }

  @Get('patients/me/voice-messages')
  async listVoiceMessages(@Request() req: any) {
    if (req.user.role !== 'PATIENT' || !req.user.patientId) {
      throw new Error('Only patients can access voice messages');
    }

    const items = await this.voiceMessagesService.listForPatient(req.user.patientId);
    return { items };
  }

  @Get('patients/me/voice-messages/:id')
  async getVoiceMessage(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'PATIENT' || !req.user.patientId) {
      throw new Error('Only patients can access voice messages');
    }

    return this.voiceMessagesService.getForPatient(req.user.patientId, id);
  }

  @Post('patients/me/voice-messages/:id/request-audio')
  async requestAudio(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'PATIENT' || !req.user.patientId) {
      throw new Error('Only patients can request audio access');
    }

    return this.voiceMessagesService.requestAudioForPatient(req.user.patientId, id);
  }

  @Get('clinician/patients/:patientId/voice-messages')
  async listVoiceMessagesForStaff(@Request() req: any, @Param('patientId') patientId: string) {
    if (req.user.role === 'PATIENT') {
      throw new ForbiddenException('Only staff can access voice histories.');
    }
    const items = await this.voiceMessagesService.listForStaff(patientId);
    return { items };
  }

  @Get('clinician/voice-messages/:id')
  async getVoiceMessageForStaff(@Request() req: any, @Param('id') id: string) {
    if (req.user.role === 'PATIENT') {
      throw new ForbiddenException('Only staff can access voice recordings.');
    }
    return this.voiceMessagesService.getForClinician(id);
  }

  @Get('clinician/voice-messages/by-task/:taskId')
  async getVoiceMessageByTask(@Request() req: any, @Param('taskId') taskId: string) {
    if (req.user.role === 'PATIENT') {
      throw new ForbiddenException('Only staff can access voice recordings.');
    }
    return this.voiceMessagesService.getByTriageTask(taskId);
  }

  @Post('clinician/voice-messages/:id/request-audio')
  async requestAudioForStaff(@Request() req: any, @Param('id') id: string) {
    if (req.user.role === 'PATIENT') {
      throw new ForbiddenException('Only staff can request audio access.');
    }
    const actorType = req.user.role === 'MA' ? 'MA' : 'CLINICIAN';
    return this.voiceMessagesService.requestAudioForStaff(id, actorType);
  }

  @Get('admin/voice-messages/audio-usage')
  async getAudioUsage(@Request() req: any) {
    if (req.user.role === 'PATIENT') {
      throw new ForbiddenException('Only staff can access this report');
    }
    return this.voiceMessagesService.getAdminUsageSummary();
  }
}

