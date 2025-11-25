import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { COFATranslationGuidelines } from './cultural-templates';

/**
 * Translation Service
 * 
 * Handles language detection and translation for multilingual support.
 * Uses LLM for language detection and translation to ensure medical accuracy.
 */
@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  constructor(private config: ConfigService) {}

  /**
   * Detect the language of a given text
   * Returns ISO language code (e.g., 'en', 'es', 'ja', 'zh', 'tl', 'sm')
   */
  async detectLanguage(text: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      return 'en'; // Default to English for empty text
    }

    try {
      // Use LLM for language detection
      // This is a placeholder - replace with actual LLM API call
      const detectedLang = await this.detectLanguageWithLLM(text);
      return detectedLang || 'en';
    } catch (error) {
      this.logger.error('Failed to detect language, defaulting to English', error);
      return 'en';
    }
  }

  /**
   * Translate text to target language
   * If text is already in target language, returns as-is
   * Focuses on meaning-preserving, medically cautious translation
   * @param severity Optional severity level for culturally safe templates (COFA languages)
   */
  async translateText(text: string, targetLang: string, severity?: 'EMERGENT' | 'URGENT' | 'ROUTINE'): Promise<string> {
    if (!text || text.trim().length === 0) {
      return text;
    }

    // If target is English and text appears to be English, return as-is
    if (targetLang === 'en') {
      const detected = await this.detectLanguage(text);
      if (detected === 'en') {
        return text;
      }
    }

    try {
      // Use LLM for translation with medical context and cultural safety
      const translated = await this.translateWithLLM(text, targetLang, severity);
      return translated || text; // Fallback to original if translation fails
    } catch (error) {
      this.logger.error(`Failed to translate to ${targetLang}, returning original`, error);
      return text;
    }
  }

  /**
   * Normalize text to English for internal processing
   * Returns both English text and detected original language
   */
  async normalizeToEnglish(text: string): Promise<{ english: string; detectedLang: string }> {
    if (!text || text.trim().length === 0) {
      return { english: text, detectedLang: 'en' };
    }

    try {
      const detectedLang = await this.detectLanguage(text);
      
      if (detectedLang === 'en') {
        return { english: text, detectedLang: 'en' };
      }

      // Translate to English
      const english = await this.translateText(text, 'en');
      return { english, detectedLang };
    } catch (error) {
      this.logger.error('Failed to normalize to English, returning original', error);
      return { english: text, detectedLang: 'en' };
    }
  }

  /**
   * Normalize clinician dictation to English for charting
   * Returns original text, original language, and English canonical version
   */
  async normalizeClinicianDictation(
    text: string,
    options?: { targetLang?: string },
  ): Promise<{ originalText: string; originalLang: string; englishText: string }> {
    const targetLang = options?.targetLang || 'en';
    
    if (!text || text.trim().length === 0) {
      return { originalText: text, originalLang: 'en', englishText: text };
    }

    try {
      const detectedLang = await this.detectLanguage(text);
      
      if (targetLang === 'en') {
        if (detectedLang === 'en') {
          return { originalText: text, originalLang: 'en', englishText: text };
        }
        const englishText = await this.translateText(text, 'en');
        return { originalText: text, originalLang: detectedLang, englishText };
      } else {
        // If target is not English, translate to target but also provide English
        const targetText = await this.translateText(text, targetLang);
        const englishText = await this.translateText(text, 'en');
        return { originalText: text, originalLang: detectedLang, englishText };
      }
    } catch (error) {
      this.logger.error('Failed to normalize clinician dictation', error);
      return { originalText: text, originalLang: 'en', englishText: text };
    }
  }

  /**
   * Private: Detect language using LLM
   * TODO: Replace with actual LLM API integration (OpenAI, Anthropic, etc.)
   */
  private async detectLanguageWithLLM(text: string): Promise<string> {
    // Placeholder implementation
    // In production, this should call an LLM API with a prompt like:
    // "Detect the language of this text and return only the ISO 639-3 language code.
    // Supported codes include: en, es, ja, zh, tl, sm, chk (Chuukese), pon (Pohnpeian), 
    // kos (Kosraean), yap (Yapese), mh (Marshallese), pau (Palauan), ch (Chamorro), to (Tongan).
    // If a Micronesian dialect is detected, map to closest supported code: [text]"
    
    // For now, use a simple heuristic-based detection
    // This is a fallback - should be replaced with actual LLM call
    
    const lowerText = text.toLowerCase();
    
    // Spanish indicators
    if (/\b(que|de|la|el|es|en|un|una|con|por|para|del|los|las|está|estoy|tengo|dolor|dolor|pecho|corazón)\b/i.test(text)) {
      return 'es';
    }
    
    // Japanese indicators (hiragana/katakana/kanji)
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
      return 'ja';
    }
    
    // Chinese indicators
    if (/[\u4E00-\u9FFF]/.test(text) && !/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      return 'zh';
    }
    
    // Tagalog indicators
    if (/\b(ako|ikaw|siya|kami|kayo|sila|ng|sa|ang|mga|na|ay|ito|iyan|iyon|may|wala|hindi|oo|opo|salamat|kumusta|paalam)\b/i.test(text)) {
      return 'tl';
    }
    
    // Samoan indicators
    if (/\b(ou|oe|ia|tatou|outou|latou|o|le|se|i|ma|pe|ae|aua|loa|tele|tama|teine|fale|mea|ai|inu|moa|puaa)\b/i.test(text)) {
      return 'sm';
    }
    
    // COFA / Micronesian Languages
    // Note: In production, LLM should handle detection. These are basic fallback heuristics.
    // Chuukese indicators (common words: kaselehlia, kalahngan, pwata, sou, met, mwichen)
    if (/\b(kaselehlia|kalahngan|pwata|sou|met|mwichen|pwatauk|pwatauki|ngang|sapw|pwan|kana)\b/i.test(text)) {
      return 'chk';
    }
    
    // Pohnpeian indicators (common words: kaselehlia, kalahngan, pwihn, sou, met, kapingamarangi)
    if (/\b(pwihn|kapingamarangi|kaselehlia|kalahngan|sou|met|pohnpei|pohnpeian)\b/i.test(text)) {
      return 'pon';
    }
    
    // Kosraean indicators (common words: kaselehlia, kalahngan, kosrae)
    if (/\b(kosrae|kosraean|kaselehlia|kalahngan)\b/i.test(text)) {
      return 'kos';
    }
    
    // Yapese indicators (common words: kaselehlia, kalahngan, yap)
    if (/\b(yapese|yap|kaselehlia|kalahngan)\b/i.test(text) && !/\b(yapese language|yapese translation)\b/i.test(text)) {
      return 'yap';
    }
    
    // Marshallese indicators (common words: iakwe, kommol, kwe, jukjuk, jab)
    if (/\b(iakwe|kommol|kwe|jukjuk|jab|marshallese|marshall)\b/i.test(text)) {
      return 'mh';
    }
    
    // Palauan indicators (common words: alii, melekei, ke mlechell, suleb, palauan)
    if (/\b(alii|melekei|mlechell|suleb|palauan|palau)\b/i.test(text)) {
      return 'pau';
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Private: Translate text using LLM
   * TODO: Replace with actual LLM API integration
   * 
   * Important: Translation must:
   * - Preserve medical terminology accurately
   * - Not add diagnoses not present in original
   * - Not remove red-flag symptoms
   * - Preserve clinical nuance
   * - Use culturally safe templates for COFA languages
   */
  private async translateWithLLM(text: string, targetLang: string, severity?: 'EMERGENT' | 'URGENT' | 'ROUTINE'): Promise<string> {
    // Placeholder implementation
    // In production, this should call an LLM API with a prompt that includes:
    // - Cultural safety guidelines for COFA languages
    // - Plain-language requirements
    // - Medical accuracy requirements
    // - No diagnosis addition
    // - Red-flag preservation
    
    // For COFA languages, use culturally safe templates
    const cofaLanguages = ['chk', 'pon', 'kos', 'yap', 'mh', 'pau'];
    if (cofaLanguages.includes(targetLang)) {
      // In production, use COFATranslationGuidelines.getTranslationPrompt() to generate LLM prompt
      // This ensures culturally safe, plain-language translation
      const prompt = COFATranslationGuidelines.getTranslationPrompt(targetLang, text, severity);
      this.logger.warn(`Translation to ${targetLang} (COFA language) - use culturally safe templates`);
      this.logger.debug(`Translation prompt: ${prompt.substring(0, 200)}...`);
    }
    
    // For now, return original text as placeholder
    // This MUST be replaced with actual LLM translation in production
    this.logger.warn(`Translation to ${targetLang} not yet implemented, returning original text`);
    return text;
  }

  /**
   * Get language name from ISO code for display
   */
  getLanguageName(code: string): string {
    const languageNames: Record<string, string> = {
      en: 'English',
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
      ja: 'Japanese',
      zh: 'Chinese',
      tl: 'Tagalog',
      fr: 'French',
      de: 'German',
      pt: 'Portuguese',
      vi: 'Vietnamese',
      ko: 'Korean',
      hi: 'Hindi',
      ar: 'Arabic',
    };
    return languageNames[code] || code.toUpperCase();
  }
}

