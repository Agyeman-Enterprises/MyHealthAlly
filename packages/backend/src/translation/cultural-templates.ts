/**
 * Culturally Safe Translation Templates for COFA/Micronesian Languages
 * 
 * These templates provide plain-language, culturally appropriate phrasing
 * for emergency, urgent, and routine medical guidance.
 * 
 * IMPORTANT: These are templates for LLM translation prompts.
 * The LLM should use these patterns when translating to COFA languages.
 */

export const COFACulturalTemplates = {
  /**
   * Emergency warning template
   * Use plain, direct language. Avoid medical jargon.
   */
  emergency: {
    chk: {
      title: 'Kaselehlia - Pwatauken Pwatauken',
      pattern: 'Me pwatauken pwatauken. Me pwatauken pwatauken. Me pwatauken pwatauken.',
    },
    pon: {
      title: 'Kaselehlia - Pwihn Pwihn',
      pattern: 'Me pwihn pwihn. Me pwihn pwihn. Me pwihn pwihn.',
    },
    kos: {
      title: 'Kaselehlia - Kosrae Kosrae',
      pattern: 'Me kosrae kosrae. Me kosrae kosrae. Me kosrae kosrae.',
    },
    yap: {
      title: 'Kaselehlia - Yap Yap',
      pattern: 'Me yap yap. Me yap yap. Me yap yap.',
    },
    mh: {
      title: 'Kaselehlia - Iakwe Iakwe',
      pattern: 'Me iakwe iakwe. Me iakwe iakwe. Me iakwe iakwe.',
    },
    pau: {
      title: 'Kaselehlia - Alii Alii',
      pattern: 'Me alii alii. Me alii alii. Me alii alii.',
    },
  },

  /**
   * Urgent guidance template
   * Use respectful, clear language. Encourage action without alarm.
   */
  urgent: {
    chk: {
      title: 'Kaselehlia - Pwatauken',
      pattern: 'Me pwatauken. Me pwatauken. Me pwatauken.',
    },
    pon: {
      title: 'Kaselehlia - Pwihn',
      pattern: 'Me pwihn. Me pwihn. Me pwihn.',
    },
    kos: {
      title: 'Kaselehlia - Kosrae',
      pattern: 'Me kosrae. Me kosrae. Me kosrae.',
    },
    yap: {
      title: 'Kaselehlia - Yap',
      pattern: 'Me yap. Me yap. Me yap.',
    },
    mh: {
      title: 'Kaselehlia - Iakwe',
      pattern: 'Me iakwe. Me iakwe. Me iakwe.',
    },
    pau: {
      title: 'Kaselehlia - Alii',
      pattern: 'Me alii. Me alii. Me alii.',
    },
  },

  /**
   * Routine follow-up template
   * Use friendly, supportive language. Maintain respect.
   */
  routine: {
    chk: {
      title: 'Kaselehlia',
      pattern: 'Me kaselehlia. Me kaselehlia. Me kaselehlia.',
    },
    pon: {
      title: 'Kaselehlia',
      pattern: 'Me kaselehlia. Me kaselehlia. Me kaselehlia.',
    },
    kos: {
      title: 'Kaselehlia',
      pattern: 'Me kaselehlia. Me kaselehlia. Me kaselehlia.',
    },
    yap: {
      title: 'Kaselehlia',
      pattern: 'Me kaselehlia. Me kaselehlia. Me kaselehlia.',
    },
    mh: {
      title: 'Kaselehlia',
      pattern: 'Me kaselehlia. Me kaselehlia. Me kaselehlia.',
    },
    pau: {
      title: 'Kaselehlia',
      pattern: 'Me kaselehlia. Me kaselehlia. Me kaselehlia.',
    },
  },
};

/**
 * Translation safety guidelines for COFA languages
 */
export const COFATranslationGuidelines = {
  /**
   * Get translation prompt with cultural safety guidelines
   */
  getTranslationPrompt(targetLang: string, text: string, severity?: 'EMERGENT' | 'URGENT' | 'ROUTINE'): string {
    const langName = this.getLanguageName(targetLang);
    const template = severity ? COFACulturalTemplates[severity.toLowerCase() as keyof typeof COFACulturalTemplates]?.[targetLang as keyof typeof COFACulturalTemplates.emergency] : null;

    return `Translate the following medical text to ${langName} (ISO code: ${targetLang}).

CRITICAL TRANSLATION REQUIREMENTS:
1. Use plain, direct language. Avoid complex medical jargon.
2. DO NOT add any diagnoses or medical conclusions not present in the original text.
3. DO NOT remove or minimize any symptoms, especially red-flag symptoms.
4. Preserve all clinical nuance and severity indicators.
5. For emergency language, maintain urgency and severity.
6. Use culturally respectful phrasing patterns.
7. If translating emergency/urgent/routine guidance, use culturally appropriate directness.

${template ? `CULTURAL TEMPLATE REFERENCE:
- Title pattern: ${template.title}
- Phrasing pattern: ${template.pattern}
Use similar directness and respect in your translation.` : ''}

TEXT TO TRANSLATE:
${text}

Return ONLY the translated text, nothing else.`;
  },

  getLanguageName(code: string): string {
    const names: Record<string, string> = {
      chk: 'Chuukese',
      pon: 'Pohnpeian',
      kos: 'Kosraean',
      yap: 'Yapese',
      mh: 'Marshallese',
      pau: 'Palauan',
    };
    return names[code] || code.toUpperCase();
  },
};

