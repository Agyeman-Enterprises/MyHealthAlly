import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from '../translation/translation.service';
import { PatientsLanguagePromptService } from './patients-language-prompt.service';

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private languagePromptService: PatientsLanguagePromptService,
  ) {}

  async findAll(clinicId?: string) {
    return this.prisma.patient.findMany({
      where: clinicId ? { clinicId } : undefined,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        clinic: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getVitalsSummary(patientId: string) {
    // Get latest readings from both Measurement and device-specific models
    const [latestVital, latestHRV, latestBMI, latestMeasurements] = await Promise.all([
      (this.prisma as any).vitalReading.findFirst({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
      }),
      (this.prisma as any).hRVReading.findFirst({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
      }),
      (this.prisma as any).bMIReading.findFirst({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.measurement.findMany({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
        take: 20, // Get recent measurements
      }),
    ]);

    // Aggregate vitals from all sources
    const vitals: any = {};

    // From VitalReading
    if (latestVital) {
      if (latestVital.heartRate) vitals.heartRate = latestVital.heartRate;
      if (latestVital.spo2) vitals.spo2 = latestVital.spo2;
      if (latestVital.respiration) vitals.respiration = latestVital.respiration;
      if (latestVital.systolicBP) vitals.systolicBP = latestVital.systolicBP;
      if (latestVital.diastolicBP) vitals.diastolicBP = latestVital.diastolicBP;
    }

    // From HRVReading
    if (latestHRV) {
      vitals.hrv = latestHRV.rmssdMs;
    }

    // From BMIReading
    if (latestBMI) {
      vitals.bmi = latestBMI.bmi;
      vitals.weight = latestBMI.weightKg;
    }

    // From Measurements (flexible type system)
    for (const measurement of latestMeasurements) {
      const type = measurement.type.toLowerCase();
      if (typeof measurement.value === 'number') {
        if (type === 'weight' && !vitals.weight) vitals.weight = measurement.value;
        if (type === 'glucose') vitals.glucose = measurement.value;
        if (type === 'heart_rate' && !vitals.heartRate) vitals.heartRate = measurement.value;
        if (type === 'systolic_bp' && !vitals.systolicBP) vitals.systolicBP = measurement.value;
        if (type === 'diastolic_bp' && !vitals.diastolicBP) vitals.diastolicBP = measurement.value;
        if (type === 'hrv' && !vitals.hrv) vitals.hrv = measurement.value;
        if (type === 'spo2' && !vitals.spo2) vitals.spo2 = measurement.value;
        if (type === 'respiration' && !vitals.respiration) vitals.respiration = measurement.value;
      } else if (typeof measurement.value === 'object' && measurement.value !== null) {
        // Handle object values (e.g., blood pressure {systolic: 120, diastolic: 80})
        const value = measurement.value as any;
        if (type === 'blood_pressure') {
          if (value.systolic && !vitals.systolicBP) vitals.systolicBP = value.systolic;
          if (value.diastolic && !vitals.diastolicBP) vitals.diastolicBP = value.diastolic;
        }
      }
    }

    return vitals;
  }

  async recordVital(patientId: string, data: { type: string; value: number | string; timestamp?: string; source?: string }) {
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    const source = data.source || 'MANUAL';

    // Convert value to appropriate format
    let value: any = data.value;
    if (typeof data.value === 'string' && !isNaN(Number(data.value))) {
      value = Number(data.value);
    }

    // Handle special cases (e.g., BMI calculation if weight/height provided)
    if (data.type === 'bmi' && typeof value === 'number') {
      // BMI is typically calculated, but we can store it if provided
      // In a real implementation, we might want to calculate it from weight/height
    }

    return this.prisma.measurement.create({
      data: {
        patientId,
        type: data.type,
        value,
        timestamp,
        source,
      },
    });
  }

  async getLabOrders(patientId: string) {
    return (this.prisma as any).labOrder.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        visit: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getLabResults(patientId: string) {
    return (this.prisma as any).labOrder.findMany({
      where: {
        patientId,
        status: {
          in: ['COMPLETED', 'REVIEWED'],
        },
      },
      orderBy: { completedAt: 'desc' },
      include: {
        visit: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getReferrals(patientId: string) {
    return (this.prisma as any).referral.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        visit: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getDocuments(patientId: string) {
    // Get both excuse notes and referrals as documents
    const [excuseNotes, referrals] = await Promise.all([
      (this.prisma as any).excuseNote.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          visit: {
            include: {
              provider: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      (this.prisma as any).referral.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          visit: {
            include: {
              provider: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Combine and format as documents
    return {
      excuseNotes,
      referrals,
    };
  }

  async getLanguagePreferences(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        preferredLanguage: true,
        lastDetectedLanguage: true,
      },
    });

    const availableLanguages = [
      { code: 'en', name: 'English' },
      // COFA / Micronesian Languages (prominently listed)
      { code: 'chk', name: 'Chuukese' },
      { code: 'pon', name: 'Pohnpeian' },
      { code: 'kos', name: 'Kosraean' },
      { code: 'yap', name: 'Yapese' },
      { code: 'mh', name: 'Marshallese' },
      { code: 'pau', name: 'Palauan' },
      // Pacific Islands
      { code: 'ch', name: 'Chamorro' },
      { code: 'sm', name: 'Samoan' },
      { code: 'to', name: 'Tongan' },
      // Other languages
      { code: 'es', name: 'Spanish' },
      { code: 'tl', name: 'Tagalog' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'hi', name: 'Hindi' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'pt', name: 'Portuguese' },
    ];

    return {
      preferredLanguage: patient?.preferredLanguage || null,
      lastDetectedLanguage: patient?.lastDetectedLanguage || null,
      availableLanguages,
    };
  }

  async setPreferredLanguage(patientId: string, preferredLanguage: string) {
    return this.prisma.patient.update({
      where: { id: patientId },
      data: { preferredLanguage },
      select: {
        id: true,
        preferredLanguage: true,
        lastDetectedLanguage: true,
      },
    });
  }

  async checkLanguagePrompt(patientId: string) {
    return this.languagePromptService.shouldPromptLanguagePreference(patientId);
  }

  async getAppointments(patientId: string, upcomingOnly: boolean = false) {
    const visits = await (this.prisma as any).visit.findMany({
      where: {
        patientId,
        ...(upcomingOnly && {
          slot: {
            startTime: {
              gte: new Date(),
            },
          },
        }),
      },
      include: {
        slot: true,
        provider: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        slot: {
          startTime: upcomingOnly ? 'asc' : 'desc',
        },
      },
    });

    return visits.map((visit: any) => ({
      id: visit.id,
      startTime: visit.slot?.startTime,
      endTime: visit.slot?.endTime,
      status: visit.status,
      visitType: visit.visitType,
      visitMode: visit.visitMode,
      reason: visit.reasonText,
      provider: visit.provider ? {
        id: visit.provider.id,
        name: visit.provider.name || 'Provider',
      } : null,
    }));
  }

  async getRecentMessages(patientId: string, limit?: number) {
    const threads = await this.prisma.messageThread.findMany({
      where: { patientId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: limit || 10,
          include: {
            thread: {
              select: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Flatten messages from all threads
    const allMessages = threads.flatMap(thread =>
      thread.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content || msg.translatedBody || msg.englishBody,
        from: {
          name: msg.senderId === thread.patientId ? 'You' : 'Care Team',
          role: msg.senderId === thread.patientId ? 'PATIENT' : 'CLINICIAN',
        },
        to: {
          name: msg.senderId === thread.patientId ? 'Care Team' : 'You',
          role: msg.senderId === thread.patientId ? 'CLINICIAN' : 'PATIENT',
        },
        createdAt: msg.createdAt,
        threadId: thread.id,
        threadSubject: thread.subject,
        originalText: msg.originalText,
        originalLanguage: msg.originalLanguage,
        englishText: msg.englishText,
        translatedTitle: msg.translatedTitle,
        translatedBody: msg.translatedBody,
        patientLanguageUsedForReply: msg.patientLanguageUsedForReply,
      }))
    );

    // Sort by creation date and limit
    return allMessages
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit || 10);
  }

  async getMeasurements(patientId: string, type?: string, limit?: number) {
    const where: any = { patientId };
    if (type) {
      where.type = type;
    }

    return this.prisma.measurement.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit || 100,
    });
  }
}
