import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from '../translation/translation.service';

export interface CreateClinicalNoteDto {
  encounterId?: string;
  type: string;
  title: string;
  content: string;
  source?: 'voice' | 'text' | 'check-in';
  // For multilingual dictation
  originalText?: string;
  originalLanguage?: string;
  targetLang?: string; // 'en' or original language
}

@Injectable()
export class ClinicalNotesService {
  private readonly logger = new Logger(ClinicalNotesService.name);

  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
  ) {}

  /**
   * Create a clinical note with multilingual support
   * If content is in a non-English language, normalizes to English for charting
   */
  async createNote(
    patientId: string,
    providerId: string | undefined,
    dto: CreateClinicalNoteDto,
  ) {
    let noteData: any = {
      patientId,
      providerId: providerId || null,
      encounterId: dto.encounterId || null,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      source: dto.source || 'text',
    };

    // If originalText is provided (from dictation), process multilingual
    if (dto.originalText) {
      try {
        const normalized = await this.translationService.normalizeClinicianDictation(
          dto.originalText,
          { targetLang: dto.targetLang || 'en' },
        );

        noteData = {
          ...noteData,
          noteOriginalText: normalized.originalText,
          noteOriginalLanguage: normalized.originalLang,
          noteCanonicalText: normalized.englishText,
          noteLanguageForDisplay: dto.targetLang === normalized.originalLang 
            ? normalized.originalLang 
            : 'en',
          // Use canonical English text as the main content for charting
          content: normalized.englishText,
          title: dto.title, // Title is typically in English or can be translated separately
        };
      } catch (error) {
        this.logger.error('Failed to normalize clinician dictation', error);
        // Continue with original content if normalization fails
      }
    } else {
      // Even if no originalText, check if content needs normalization
      try {
        const { english, detectedLang } = await this.translationService.normalizeToEnglish(
          dto.content,
        );

        if (detectedLang !== 'en') {
          noteData = {
            ...noteData,
            noteOriginalText: dto.content,
            noteOriginalLanguage: detectedLang,
            noteCanonicalText: english,
            noteLanguageForDisplay: 'en',
            content: english, // Use English for charting
          };
        }
      } catch (error) {
        this.logger.error('Failed to normalize note content', error);
      }
    }

    return this.prisma.clinicalNote.create({
      data: noteData,
    });
  }

  /**
   * Get clinical notes for a patient
   */
  async getNotes(patientId: string, encounterId?: string) {
    return this.prisma.clinicalNote.findMany({
      where: {
        patientId,
        ...(encounterId && { encounterId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single clinical note
   */
  async getNote(noteId: string) {
    return this.prisma.clinicalNote.findUnique({
      where: { id: noteId },
    });
  }
}

