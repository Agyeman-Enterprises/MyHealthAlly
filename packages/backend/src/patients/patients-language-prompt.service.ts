import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsLanguagePromptService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if we should prompt the patient to set their language preference
   * Returns prompt info if conditions are met, null otherwise
   */
  async shouldPromptLanguagePreference(patientId: string): Promise<{
    shouldPrompt: boolean;
    detectedLanguage: string;
    languageName: string;
  } | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        preferredLanguage: true,
        lastDetectedLanguage: true,
      },
    });

    if (!patient) {
      return null;
    }

    // Don't prompt if they already have a preferred language
    if (patient.preferredLanguage) {
      return null;
    }

    // Don't prompt if last detected language is English
    if (!patient.lastDetectedLanguage || patient.lastDetectedLanguage === 'en') {
      return null;
    }

    // Count recent non-English messages (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMessages = await this.prisma.message.findMany({
      where: {
        thread: {
          patientId,
        },
        originalLanguage: patient.lastDetectedLanguage,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      take: 3, // Only need to check if we have 2-3
    });

    // Prompt if we have 2 or more messages in the detected language
    if (recentMessages.length >= 2) {
      const languageNames: Record<string, string> = {
        // COFA / Micronesian Languages
        chk: 'Chuukese',
        pon: 'Pohnpeian',
        kos: 'Kosraean',
        yap: 'Yapese',
        mh: 'Marshallese',
        pau: 'Palauan',
        // Pacific Islands
        ch: 'Chamorro',
        sm: 'Samoan',
        to: 'Tongan',
        // Other languages
        es: 'Spanish',
        tl: 'Tagalog',
        zh: 'Chinese',
        ja: 'Japanese',
        ko: 'Korean',
        vi: 'Vietnamese',
        hi: 'Hindi',
        fr: 'French',
        de: 'German',
        pt: 'Portuguese',
      };

      return {
        shouldPrompt: true,
        detectedLanguage: patient.lastDetectedLanguage,
        languageName: languageNames[patient.lastDetectedLanguage] || patient.lastDetectedLanguage.toUpperCase(),
      };
    }

    return null;
  }
}

