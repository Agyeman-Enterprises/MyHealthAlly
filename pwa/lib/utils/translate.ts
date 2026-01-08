/**
 * Translation helper - CRITICAL: 100% reliability required for award-winning feature.
 * - All user inputs → English (for clinic)
 * - All clinic responses → User's language
 * - NO FALLBACKS - translation must work or throw error
 *
 * Expected provider contract (JSON):
 * { text: string, targetLang: string } -> { translatedText: string, detectedLang?: string }
 */
import { env } from '@/lib/env';

type TranslateResponse = { translatedText: string; detectedLang?: string };

function detectBrowserLang(): string {
  if (typeof window !== 'undefined') {
    return navigator.language.split('-')[0] || 'en';
  }
  return 'en';
}

export async function translateText(
  text: string,
  targetLang: string = 'en'
): Promise<{ translatedText: string; detectedLang: string }> {
  const detectedLang = detectBrowserLang();
  if (!text.trim()) return { translatedText: '', detectedLang };

  const apiUrl = env.TRANSLATE_API_URL;
  const apiKey = env.TRANSLATE_API_KEY;

  if (!apiUrl || !apiKey) {
    // CRITICAL: Translation service must be configured
    // In production, this should throw an error, not fallback
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Translation service not configured. TRANSLATE_API_URL and TRANSLATE_API_KEY must be set.');
    }
    // In development, log warning but allow fallback for testing
    console.warn('Translation service not configured. Using original text.');
    return { translatedText: text, detectedLang };
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Translation API error ${res.status}: ${errorText}`);
    }

    const data = (await res.json()) as TranslateResponse;
    
    // CRITICAL: Ensure we have a translation
    if (!data.translatedText || data.translatedText.trim() === '') {
      throw new Error('Translation service returned empty result');
    }

    return {
      translatedText: data.translatedText,
      detectedLang: data.detectedLang || detectedLang,
    };
  } catch (err) {
    // CRITICAL: In production, translation failures are not acceptable
    // Log error with full context for debugging
    const errorMessage = err instanceof Error ? err.message : 'Unknown translation error';
    console.error('Translation failed:', {
      error: errorMessage,
      text: text.substring(0, 100),
      targetLang,
      apiUrl: apiUrl ? 'configured' : 'missing',
      apiKey: apiKey ? 'configured' : 'missing',
    });

    // In production, throw error to prevent silent failures
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Translation failed: ${errorMessage}. This is a critical feature and must work.`);
    }

    // In development, return original text with warning
    console.warn('Translation failed, using original text. This should not happen in production.');
    return { translatedText: text, detectedLang };
  }
}
