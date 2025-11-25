import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from '../translation/translation.service';
import { PatientsLanguageService } from '../patients/patients-language.service';

export interface TriageContext {
  severity: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  symptomType?: string;
  intentType?: string;
  patientMessage?: string;
  redFlags?: string[];
  regionCode?: string;
}

export interface PatientAdvice {
  title: string;
  body: string;
  severity: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  // Multilingual versions
  englishTitle: string;
  englishBody: string;
  translatedTitle?: string;
  translatedBody?: string;
  patientLanguageUsedForReply: string;
}

@Injectable()
export class AdviceService {
  private readonly logger = new Logger(AdviceService.name);

  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private patientsLanguageService: PatientsLanguageService,
  ) {}

  /**
   * Generate patient advice based on triage context
   * Returns advice in patient's language (with English version stored)
   */
  async generatePatientAdvice(
    patientId: string,
    triageContext: TriageContext,
  ): Promise<PatientAdvice> {
    // Generate English advice first
    const englishAdvice = this.generateEnglishAdvice(triageContext);

    // Get patient's reply language
    const replyLang = await this.patientsLanguageService.getReplyLanguage(patientId);

    let translatedTitle: string | undefined;
    let translatedBody: string | undefined;

    // If patient language is not English, translate
    if (replyLang !== 'en') {
      try {
        // Pass severity for culturally safe translation templates (especially for COFA languages)
        translatedTitle = await this.translationService.translateText(
          englishAdvice.title,
          replyLang,
          englishAdvice.severity,
        );
        translatedBody = await this.translationService.translateText(
          englishAdvice.body,
          replyLang,
          englishAdvice.severity,
        );
      } catch (error) {
        this.logger.error(`Failed to translate advice to ${replyLang}`, error);
        // Fallback to English if translation fails
        translatedTitle = englishAdvice.title;
        translatedBody = englishAdvice.body;
      }
    }

    return {
      title: translatedTitle || englishAdvice.title,
      body: translatedBody || englishAdvice.body,
      severity: englishAdvice.severity,
      englishTitle: englishAdvice.title,
      englishBody: englishAdvice.body,
      translatedTitle,
      translatedBody,
      patientLanguageUsedForReply: replyLang,
    };
  }

  /**
   * Generate English advice based on triage context
   * This is the canonical advice that gets translated
   */
  private generateEnglishAdvice(context: TriageContext): {
    title: string;
    body: string;
    severity: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  } {
    const { severity, symptomType, redFlags, regionCode } = context;

    // EMERGENT cases - chest pain, difficulty breathing, etc.
    if (severity === 'EMERGENT' || redFlags?.includes('CHEST_PAIN_EMERGENT')) {
      return {
        title: 'Seek Immediate Medical Attention',
        body: this.getEmergencyAdviceBody(regionCode),
        severity: 'EMERGENT',
      };
    }

    // URGENT cases
    if (severity === 'URGENT') {
      return {
        title: 'Contact Your Care Team Soon',
        body: this.getUrgentAdviceBody(symptomType, regionCode),
        severity: 'URGENT',
      };
    }

    // ROUTINE cases
    return {
      title: 'We Received Your Message',
      body: this.getRoutineAdviceBody(symptomType, regionCode),
      severity: 'ROUTINE',
    };
  }

  /**
   * Get emergency advice body with regional emergency disclaimers
   */
  private getEmergencyAdviceBody(regionCode?: string): string {
    const emergencyNumber = this.getEmergencyNumber(regionCode);
    
    return `Based on your symptoms, this may be a medical emergency. Please seek immediate medical attention.

${emergencyNumber}

If you are experiencing chest pain, difficulty breathing, severe abdominal pain, or any life-threatening symptoms, do not wait. Go to the nearest emergency room or call emergency services immediately.

Your care team has been notified and will follow up with you.

**Important Medical Disclaimer:**
This automated guidance is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor or emergency services immediately.`;
  }

  /**
   * Get urgent advice body
   */
  private getUrgentAdviceBody(symptomType?: string, regionCode?: string): string {
    const emergencyNumber = this.getEmergencyNumber(regionCode);
    
    return `Thank you for reaching out. Based on your message, we recommend contacting your care team soon.

Your care team has been notified and will review your message. They will respond as soon as possible.

If your symptoms worsen or you develop any of the following, seek immediate medical attention:
- Chest pain or pressure
- Difficulty breathing
- Severe pain
- Signs of infection (fever, chills)
- Any other concerning symptoms

${emergencyNumber}

**Important Medical Disclaimer:**
This automated guidance is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor or emergency services immediately.`;
  }

  /**
   * Get routine advice body
   */
  private getRoutineAdviceBody(symptomType?: string, regionCode?: string): string {
    const emergencyNumber = this.getEmergencyNumber(regionCode);
    
    return `Thank you for your message. We've received it and your care team will review it during regular business hours.

If your symptoms change or worsen, please don't hesitate to reach out again or contact your care team directly.

For medical emergencies, please call ${emergencyNumber} or go to the nearest emergency room.

**Important Medical Disclaimer:**
This automated guidance is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor or emergency services immediately.`;
  }

  /**
   * Get emergency number based on region
   */
  private getEmergencyNumber(regionCode?: string): string {
    switch (regionCode) {
      case 'GUAM':
        return '**For emergencies in Guam, call 911 or go to the nearest emergency room.**';
      case 'HI':
        return '**For emergencies in Hawaii, call 911 or go to the nearest emergency room.**';
      case 'US':
      default:
        return '**For emergencies, call 911 or go to the nearest emergency room.**';
    }
  }
}

