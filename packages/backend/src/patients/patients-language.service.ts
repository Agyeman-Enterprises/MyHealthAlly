import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Patient Language Service
 * 
 * Helper functions for managing patient language preferences
 */
@Injectable()
export class PatientsLanguageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get patient language preferences
   * Returns preferredLanguage, lastDetectedLanguage, and fallback to 'en'
   */
  async getPatientLanguage(patientId: string): Promise<{
    preferredLanguage?: string;
    lastDetectedLanguage?: string;
    fallback: string;
  }> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        preferredLanguage: true,
        lastDetectedLanguage: true,
      },
    });

    if (!patient) {
      return { fallback: 'en' };
    }

    return {
      preferredLanguage: patient.preferredLanguage || undefined,
      lastDetectedLanguage: patient.lastDetectedLanguage || undefined,
      fallback: patient.preferredLanguage || patient.lastDetectedLanguage || 'en',
    };
  }

  /**
   * Set last detected language for a patient
   */
  async setLastDetectedLanguage(patientId: string, langCode: string): Promise<void> {
    await this.prisma.patient.update({
      where: { id: patientId },
      data: { lastDetectedLanguage: langCode },
    });
  }

  /**
   * Set preferred language for a patient
   */
  async setPreferredLanguage(patientId: string, langCode: string): Promise<void> {
    await this.prisma.patient.update({
      where: { id: patientId },
      data: { preferredLanguage: langCode },
    });
  }

  /**
   * Get the language to use for patient replies
   * Priority: preferredLanguage > lastDetectedLanguage > 'en'
   */
  async getReplyLanguage(patientId: string): Promise<string> {
    const { preferredLanguage, lastDetectedLanguage, fallback } =
      await this.getPatientLanguage(patientId);
    return preferredLanguage || lastDetectedLanguage || fallback;
  }
}

