import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CarePlanPhase } from '@myhealthally/shared';
import { TranslationService } from '../translation/translation.service';
import { PatientsLanguageService } from '../patients/patients-language.service';

@Injectable()
export class CarePlansService {
  private readonly logger = new Logger(CarePlansService.name);

  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private patientsLanguageService: PatientsLanguageService,
  ) {}

  async create(patientId: string, phases: CarePlanPhase[], title?: string) {
    // Store English canonical version
    const englishPhases = phases as any;
    const englishTitle = title || 'Care Plan';

    // Get patient's preferred language
    const { preferredLanguage } = await this.patientsLanguageService.getPatientLanguage(patientId);

    let translatedTitle: string | undefined;
    let translatedPhases: any | undefined;

    // If patient has preferred language and it's not English, translate
    if (preferredLanguage && preferredLanguage !== 'en') {
      try {
        translatedTitle = await this.translationService.translateText(englishTitle, preferredLanguage);
        
        // Translate phases (name, task titles, descriptions)
        translatedPhases = await this.translateCarePlanPhases(englishPhases, preferredLanguage);
      } catch (error) {
        this.logger.error(`Failed to translate care plan to ${preferredLanguage}`, error);
      }
    }

    return this.prisma.carePlan.create({
      data: {
        patientId,
        phases: englishPhases,
        planEnglishTitle: englishTitle,
        planEnglishBody: englishPhases,
        planTranslatedTitle: translatedTitle,
        planTranslatedBody: translatedPhases,
        planTranslatedLanguage: preferredLanguage && preferredLanguage !== 'en' ? preferredLanguage : null,
      },
    });
  }

  async findByPatient(patientId: string, forPatient: boolean = false) {
    const carePlan = await this.prisma.carePlan.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    if (!carePlan) {
      return null;
    }

    // If requesting for patient and translation exists, return translated version
    if (forPatient && carePlan.planTranslatedBody && carePlan.planTranslatedLanguage) {
      return {
        ...carePlan,
        phases: carePlan.planTranslatedBody,
        title: carePlan.planTranslatedTitle || carePlan.planEnglishTitle,
        displayLanguage: carePlan.planTranslatedLanguage,
      };
    }

    // Otherwise return English canonical version
    return {
      ...carePlan,
      phases: carePlan.planEnglishBody || carePlan.phases,
      title: carePlan.planEnglishTitle || 'Care Plan',
      displayLanguage: 'en',
    };
  }

  async update(patientId: string, phases: CarePlanPhase[], title?: string) {
    const existing = await this.findByPatient(patientId);
    
    // Store English canonical version
    const englishPhases = phases as any;
    const englishTitle = title || 'Care Plan';

    // Get patient's preferred language
    const { preferredLanguage } = await this.patientsLanguageService.getPatientLanguage(patientId);

    let translatedTitle: string | undefined;
    let translatedPhases: any | undefined;

    // If patient has preferred language and it's not English, translate
    if (preferredLanguage && preferredLanguage !== 'en') {
      try {
        translatedTitle = await this.translationService.translateText(englishTitle, preferredLanguage);
        translatedPhases = await this.translateCarePlanPhases(englishPhases, preferredLanguage);
      } catch (error) {
        this.logger.error(`Failed to translate care plan to ${preferredLanguage}`, error);
      }
    }

    if (existing) {
      return this.prisma.carePlan.update({
        where: { id: existing.id },
        data: {
          phases: englishPhases,
          planEnglishTitle: englishTitle,
          planEnglishBody: englishPhases,
          planTranslatedTitle: translatedTitle,
          planTranslatedBody: translatedPhases,
          planTranslatedLanguage: preferredLanguage && preferredLanguage !== 'en' ? preferredLanguage : null,
        },
      });
    }
    return this.create(patientId, phases, title);
  }

  /**
   * Translate care plan phases to target language
   */
  private async translateCarePlanPhases(phases: any[], targetLang: string): Promise<any[]> {
    const translatedPhases = [];

    for (const phase of phases) {
      const translatedPhase = { ...phase };

      // Translate phase name
      if (phase.name) {
        translatedPhase.name = await this.translationService.translateText(phase.name, targetLang);
      }

      // Translate tasks
      if (phase.tasks && Array.isArray(phase.tasks)) {
        translatedPhase.tasks = await Promise.all(
          phase.tasks.map(async (task: any) => {
            const translatedTask = { ...task };
            if (task.title) {
              translatedTask.title = await this.translationService.translateText(task.title, targetLang);
            }
            if (task.description) {
              translatedTask.description = await this.translationService.translateText(task.description, targetLang);
            }
            if (task.subtitle) {
              translatedTask.subtitle = await this.translationService.translateText(task.subtitle, targetLang);
            }
            return translatedTask;
          }),
        );
      }

      translatedPhases.push(translatedPhase);
    }

    return translatedPhases;
  }
}
