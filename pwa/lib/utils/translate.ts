/**
 * Translation helper with pluggable provider (stub-friendly).
 * - Detects source language from browser when available.
 * - If TRANSLATE_API_URL/TRANSLATE_API_KEY are set, posts to that service.
 * - Otherwise, falls back to returning the original text.
 *
 * Expected provider contract (JSON):
 * { text: string, targetLang: string } -> { translatedText: string, detectedLang?: string }
 */
type TranslateResponse = { translatedText: string; detectedLang?: string };

function detectBrowserLang(): string {
  return 'en'; // fallback; replace with real detector if needed
}

export async function translateText(
  text: string,
  targetLang: string = 'en'
): Promise<{ translatedText: string; detectedLang: string }> {
  const detectedLang = detectBrowserLang();
  if (!text.trim()) return { translatedText: '', detectedLang };

  const apiUrl = process.env['TRANSLATE_API_URL'];
  const apiKey = process.env['TRANSLATE_API_KEY'];

  if (apiUrl && apiKey) {
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
        throw new Error(`Translate API error ${res.status}`);
      }
      const data = (await res.json()) as TranslateResponse;
      return {
        translatedText: data.translatedText || text,
        detectedLang: data.detectedLang || detectedLang,
      };
    } catch (err) {
      console.warn('Translation failed, falling back to source text', err);
      return { translatedText: text, detectedLang };
    }
  }

  // Fallback: return original text and detected language
  return {
    translatedText: targetLang === detectedLang ? text : text,
    detectedLang,
  };
}
