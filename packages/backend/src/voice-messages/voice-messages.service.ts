import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TriageTask, VoiceMessage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from '../translation/translation.service';
import { AdviceService } from '../advice/advice.service';
import { PatientsLanguageService } from '../patients/patients-language.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { promises as fs } from 'fs';

type SeverityLevel = 'ROUTINE' | 'URGENT' | 'EMERGENT';
type ActorType = 'PATIENT' | 'CLINICIAN' | 'MA' | 'SYSTEM';

interface CreateVoiceMessageResult {
  voiceMessage: VoiceMessage;
  triageTask: TriageTask;
  patientMessage: string;
}

@Injectable()
export class VoiceMessagesService {
  private readonly logger = new Logger(VoiceMessagesService.name);
  private readonly retentionDays: number;

  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private adviceService: AdviceService,
    private patientsLanguageService: PatientsLanguageService,
    private config: ConfigService,
  ) {
    this.retentionDays = Number(this.config.get('AUDIO_RETENTION_DAYS') || 60);
  }

  async createFromPatient(
    patientId: string,
    payload: {
      transcript: string;
      recordedAt?: string;
      audioFile?: Express.Multer.File;
      sourceLanguage?: string;
    },
  ): Promise<CreateVoiceMessageResult> {
    if (!payload.transcript || !payload.transcript.trim()) {
      throw new BadRequestException('Transcript is required');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        clinicId: true,
        regionCode: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    let originalLanguage = payload.sourceLanguage || 'en';
    let englishTranscript = payload.transcript.trim();

    try {
      const normalized = await this.translationService.normalizeToEnglish(payload.transcript);
      originalLanguage = normalized.detectedLang;
      englishTranscript = normalized.english;
    } catch (error) {
      this.logger.warn('Failed to normalize transcript, continuing with original text', error as Error);
    }

    await this.patientsLanguageService.setLastDetectedLanguage(patientId, originalLanguage);

    const classification = this.classifyIntent(englishTranscript);
    const redFlags = this.detectRedFlags(englishTranscript);
    const severity = this.deriveSeverity(classification.intentType, redFlags);
    const aiSummary = this.buildSummary(englishTranscript, classification.intentType);

    const triageTask = await this.createTriageTask(patientId, {
      intentType: classification.intentType,
      severity,
      englishTranscript,
      originalTranscript: payload.transcript.trim(),
      redFlags,
    });

    const audioUrl = payload.audioFile ? this.buildAudioUrl(payload.audioFile.filename) : null;
    const now = new Date();
    const retentionExpiry = audioUrl
      ? new Date(now.getTime() + this.retentionDays * 24 * 60 * 60 * 1000)
      : null;

    const voiceMessage = await this.prisma.voiceMessage.create({
      data: {
        patientId,
        triageTaskId: triageTask.id,
        intentType: classification.intentType,
        severity,
        aiSummary,
        originalTranscript: payload.transcript.trim(),
        originalLanguage,
        englishTranscript,
        audioUrl,
        audioRetentionExpiresAt: retentionExpiry,
        hasAudioAvailableToPatient: Boolean(audioUrl),
        isAccessibleToPatient: true,
        intentConfidence: classification.intentConfidence,
        riskFlags: redFlags.length ? redFlags : null,
        createdAt: payload.recordedAt ? new Date(payload.recordedAt) : undefined,
      },
    });

    const advice = await this.adviceService.generatePatientAdvice(patientId, {
      intentType: classification.intentType,
      severity,
      symptomType: classification.symptomType,
      redFlags,
      regionCode: patient.regionCode || undefined,
    });

    const patientMessage = `${advice.title}\n\n${advice.body}`;

    return {
      voiceMessage,
      triageTask,
      patientMessage,
    };
  }

  async listForPatient(patientId: string) {
    const items = await this.prisma.voiceMessage.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        severity: true,
        intentType: true,
        aiSummary: true,
        englishTranscript: true,
        hasAudioAvailableToPatient: true,
        audioRetentionExpiresAt: true,
        lastAudioDownloadAt: true,
        triageTask: {
          select: {
            status: true,
            createdAt: true,
          },
        },
        audioDownloadCount: true,
      },
    });

    return items.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      severity: item.severity,
      intentType: item.intentType,
      aiSummary: item.aiSummary,
      transcriptPreview: (item.englishTranscript || '').slice(0, 160),
      hasAudioAvailableToPatient: item.hasAudioAvailableToPatient,
      audioRetentionExpiresAt: item.audioRetentionExpiresAt,
      lastAudioDownloadAt: item.lastAudioDownloadAt,
      status: item.triageTask?.status || 'OPEN',
    }));
  }

  async listForStaff(patientId: string) {
    const items = await this.prisma.voiceMessage.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        severity: true,
        intentType: true,
        aiSummary: true,
        originalTranscript: true,
        englishTranscript: true,
        originalLanguage: true,
        hasAudioAvailableToPatient: true,
        audioRetentionExpiresAt: true,
        audioDownloadCount: true,
        lastAudioDownloadAt: true,
        triageTask: {
          select: {
            status: true,
          },
        },
      },
    });

    return items.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      severity: item.severity as SeverityLevel,
      intentType: item.intentType,
      aiSummary: item.aiSummary,
      originalTranscript: item.originalTranscript,
      englishTranscript: item.englishTranscript,
      originalLanguage: item.originalLanguage,
      hasAudioAvailableToPatient: item.hasAudioAvailableToPatient,
      audioRetentionExpiresAt: item.audioRetentionExpiresAt,
      audioDownloadCount: item.audioDownloadCount,
      lastAudioDownloadAt: item.lastAudioDownloadAt,
      status: item.triageTask?.status || 'OPEN',
    }));
  }

  async getForPatient(patientId: string, id: string) {
    const voiceMessage = await this.prisma.voiceMessage.findFirst({
      where: { id, patientId },
      include: {
        triageTask: true,
      },
    });

    if (!voiceMessage) {
      throw new NotFoundException('Voice message not found');
    }

    const replyLang = await this.patientsLanguageService.getReplyLanguage(patientId);
    const riskFlags = Array.isArray(voiceMessage.riskFlags)
      ? (voiceMessage.riskFlags as string[])
      : undefined;

    let translatedTranscript: string | undefined;
    if (replyLang && replyLang !== 'en') {
      try {
        translatedTranscript = await this.translationService.translateText(
          voiceMessage.englishTranscript || voiceMessage.originalTranscript,
          replyLang,
        );
      } catch (error) {
        this.logger.warn(`Failed to translate transcript to ${replyLang}`, error as Error);
      }
    }

    return {
      id: voiceMessage.id,
      createdAt: voiceMessage.createdAt,
      severity: voiceMessage.severity,
      intentType: voiceMessage.intentType,
      originalTranscript: voiceMessage.originalTranscript,
      englishTranscript: voiceMessage.englishTranscript,
      translatedTranscript,
      originalLanguage: voiceMessage.originalLanguage,
      aiSummary: voiceMessage.aiSummary,
      hasAudioAvailableToPatient: voiceMessage.hasAudioAvailableToPatient,
      audioRetentionExpiresAt: voiceMessage.audioRetentionExpiresAt,
      lastAudioDownloadAt: voiceMessage.lastAudioDownloadAt,
      triageTaskStatus: voiceMessage.triageTask?.status || 'OPEN',
      riskFlags,
    };
  }

  async getForClinician(id: string) {
    const voiceMessage = await this.prisma.voiceMessage.findUnique({
      where: { id },
      include: {
        triageTask: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!voiceMessage) {
      throw new NotFoundException('Voice message not found');
    }

    return this.mapClinicianDetail(voiceMessage);
  }

  async getByTriageTask(taskId: string) {
    const voiceMessage = await this.prisma.voiceMessage.findFirst({
      where: { triageTaskId: taskId },
      include: {
        triageTask: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!voiceMessage) {
      throw new NotFoundException('No voice recording linked to this triage task');
    }

    return this.mapClinicianDetail(voiceMessage);
  }

  async requestAudioForPatient(patientId: string, id: string) {
    const voiceMessage = await this.prisma.voiceMessage.findFirst({
      where: { id, patientId },
    });

    if (!voiceMessage) {
      throw new NotFoundException('Voice message not found');
    }

    return this.buildAudioAccessResponse(voiceMessage, 'PATIENT');
  }

  async requestAudioForStaff(id: string, actorType: 'CLINICIAN' | 'MA') {
    const voiceMessage = await this.prisma.voiceMessage.findUnique({
      where: { id },
    });

    if (!voiceMessage) {
      throw new NotFoundException('Voice message not found');
    }

    return this.buildAudioAccessResponse(voiceMessage, actorType);
  }

  async getAdminUsageSummary() {
    const [total, downloadable, expired, downloads] = await Promise.all([
      this.prisma.voiceMessage.count(),
      this.prisma.voiceMessage.count({
        where: { hasAudioAvailableToPatient: true },
      }),
      this.prisma.voiceMessage.count({
        where: {
          hasAudioAvailableToPatient: false,
          audioUrl: null,
        },
      }),
      this.prisma.voiceMessage.aggregate({
        _sum: {
          audioDownloadCount: true,
        },
      }),
    ]);

    return {
      totalVoiceMessages: total,
      availableRecordings: downloadable,
      expiredRecordings: expired,
      totalDownloads: downloads._sum.audioDownloadCount || 0,
    };
  }

  private async createTriageTask(
    patientId: string,
    data: {
      intentType: string;
      severity: SeverityLevel;
      englishTranscript: string;
      originalTranscript: string;
      redFlags: string[];
    },
  ) {
    const triageTask = await this.prisma.triageTask.create({
      data: {
        patientId,
        createdBy: 'SYSTEM',
        createdByRole: 'SYSTEM',
        intentType: data.intentType,
        severity: data.severity,
        status: 'OPEN',
        sourceMessage: data.englishTranscript,
        sourceOriginalText: data.originalTranscript,
        sourceType: 'voice',
        actionNote: data.redFlags.length ? `Flags: ${data.redFlags.join(', ')}` : null,
      },
    });

    await this.prisma.triageTaskLog.create({
      data: {
        taskId: triageTask.id,
        actorRole: 'SYSTEM',
        actionType: 'CREATED',
        details: {
          severity: data.severity,
          intentType: data.intentType,
          redFlags: data.redFlags,
        },
      },
    });

    return triageTask;
  }

  private classifyIntent(text: string) {
    const normalized = text.toLowerCase();
    const result = {
      intentType: 'SYMPTOM_REPORT',
      symptomType: 'general',
      intentConfidence: 0.6,
    };

    if (normalized.includes('refill') || normalized.includes('medication')) {
      result.intentType = 'REQUEST_REFILL';
      result.intentConfidence = 0.8;
    } else if (normalized.includes('same day') || normalized.includes('today') || normalized.includes('urgent visit')) {
      result.intentType = 'REQUEST_SAME_DAY_APPOINTMENT';
      result.intentConfidence = 0.75;
    } else if (normalized.includes('appointment') || normalized.includes('schedule')) {
      result.intentType = 'REQUEST_FUTURE_APPOINTMENT';
      result.intentConfidence = 0.7;
    } else if (normalized.includes('paperwork') || normalized.includes('form') || normalized.includes('billing')) {
      result.intentType = 'ADMIN_TASK';
      result.intentConfidence = 0.65;
    }

    return result;
  }

  private detectRedFlags(text: string): string[] {
    const lowered = text.toLowerCase();
    const flags: string[] = [];
    if (lowered.includes('chest pain') || lowered.includes('crushing pain')) {
      flags.push('CHEST_PAIN');
    }
    if (lowered.includes('trouble breathing') || lowered.includes('cannot breathe')) {
      flags.push('RESPIRATORY_DISTRESS');
    }
    if (lowered.includes('bleeding heavily')) {
      flags.push('HEAVY_BLEEDING');
    }
    if (lowered.includes('suicidal') || lowered.includes('self harm')) {
      flags.push('MENTAL_HEALTH_CRISIS');
    }
    return flags;
  }

  private deriveSeverity(intentType: string, redFlags: string[]): SeverityLevel {
    if (redFlags.length > 0) {
      return 'EMERGENT';
    }
    if (
      intentType === 'REQUEST_SAME_DAY_APPOINTMENT' ||
      intentType === 'ADMIN_TASK'
    ) {
      return 'URGENT';
    }
    return 'ROUTINE';
  }

  private buildSummary(text: string, intentType: string): string {
    const trimmed = text.length > 280 ? `${text.slice(0, 277)}…` : text;
    return `Intent: ${intentType.replace(/_/g, ' ')}. Summary: ${trimmed}`;
  }

  private buildAudioUrl(filename: string) {
    return `/uploads/voice/${filename}`;
  }

  private async recordAuditEvent(
    voiceMessageId: string,
    patientId: string,
    actorType: ActorType,
    action: 'AUDIO_DOWNLOADED' | 'AUDIO_PLAYED' | 'AUDIO_EXPIRED',
    details?: Record<string, any>,
  ) {
    await this.prisma.voiceMessageAuditLog.create({
      data: {
        voiceMessageId,
        patientId,
        actorType,
        actionType: action,
        details,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeExpiredAudio() {
    const now = new Date();
    const expiring = await this.prisma.voiceMessage.findMany({
      where: {
        audioRetentionExpiresAt: { lt: now },
        audioUrl: { not: null },
      },
      select: {
        id: true,
        patientId: true,
        audioUrl: true,
      },
    });

    for (const message of expiring) {
      if (message.audioUrl) {
        const physicalPath = this.resolveAudioPath(message.audioUrl);
        try {
          await fs.unlink(physicalPath);
        } catch (error) {
          this.logger.warn(`Unable to delete audio file ${physicalPath}`, error as Error);
        }
      }

      await this.prisma.voiceMessage.update({
        where: { id: message.id },
        data: {
          audioUrl: null,
          hasAudioAvailableToPatient: false,
        },
      });

      await this.recordAuditEvent(
        message.id,
        message.patientId,
        'SYSTEM',
        'AUDIO_EXPIRED',
        { reason: 'Retention window elapsed' },
      );
    }
  }

  private resolveAudioPath(audioUrl: string) {
    const relativePath = audioUrl.startsWith('/') ? audioUrl.slice(1) : audioUrl;
    return join(process.cwd(), relativePath);
  }

  private async buildAudioAccessResponse(
    voiceMessage: VoiceMessage,
    actorType: ActorType,
  ) {
    if (
      !voiceMessage.audioUrl ||
      !voiceMessage.hasAudioAvailableToPatient ||
      (voiceMessage.audioRetentionExpiresAt && voiceMessage.audioRetentionExpiresAt < new Date())
    ) {
      await this.recordAuditEvent(
        voiceMessage.id,
        voiceMessage.patientId,
        actorType,
        'AUDIO_EXPIRED',
      );
      throw new GoneException(
        'Audio is no longer available, but the transcript remains in the record.',
      );
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.voiceMessage.update({
      where: { id: voiceMessage.id },
      data: {
        audioDownloadCount: { increment: 1 },
        lastAudioDownloadAt: new Date(),
      },
    });

    await this.recordAuditEvent(
      voiceMessage.id,
      voiceMessage.patientId,
      actorType,
      'AUDIO_DOWNLOADED',
    );

    return {
      signedUrl: voiceMessage.audioUrl,
      expiresAt,
    };
  }

  private mapClinicianDetail(
    voiceMessage: VoiceMessage & {
      patient?: { firstName: string | null; lastName: string | null };
      triageTask?: TriageTask | null;
    },
  ) {
    return {
      id: voiceMessage.id,
      patientId: voiceMessage.patientId,
      patientName: voiceMessage.patient
        ? `${voiceMessage.patient.firstName || ''} ${voiceMessage.patient.lastName || ''}`.trim()
        : undefined,
      createdAt: voiceMessage.createdAt,
      severity: voiceMessage.severity,
      intentType: voiceMessage.intentType,
      aiSummary: voiceMessage.aiSummary,
      originalTranscript: voiceMessage.originalTranscript,
      englishTranscript: voiceMessage.englishTranscript,
      originalLanguage: voiceMessage.originalLanguage,
      hasAudioAvailableToPatient: voiceMessage.hasAudioAvailableToPatient,
      audioRetentionExpiresAt: voiceMessage.audioRetentionExpiresAt,
      audioDownloadCount: voiceMessage.audioDownloadCount,
      lastAudioDownloadAt: voiceMessage.lastAudioDownloadAt,
      triageTaskStatus: voiceMessage.triageTask?.status || 'OPEN',
      riskFlags: Array.isArray(voiceMessage.riskFlags)
        ? (voiceMessage.riskFlags as string[])
        : undefined,
      isAccessibleToPatient: voiceMessage.isAccessibleToPatient,
    };
  }
}

