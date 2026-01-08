/**
 * Voice Date Parser
 * 
 * Parses dates from voice input in various formats:
 * - mmddyyyy: "01011990", "1/1/1990", "1-1-1990"
 * - Natural language: "January 1st 1990", "Jan 1 1990"
 * - Spoken numbers: "zero one zero one one nine nine zero"
 * - Mixed formats: "January first nineteen ninety"
 * 
 * Returns ISO format date string (YYYY-MM-DD) or null if parsing fails
 */

export function parseDateFromVoice(text: string): string | null {
  if (!text || typeof text !== 'string') return null;

  const normalized = text.trim().toLowerCase();

  // Remove common words that don't affect date parsing
  const cleaned = normalized
    .replace(/\b(birth|date|born|dob)\b/gi, '')
    .replace(/\b(on|the|of|day)\b/gi, '')
    .trim();

  // Pattern 1: mmddyyyy format (8 digits: 01011990, 1/1/1990, 1-1-1990)
  const mmddyyyyPattern = /(\d{1,2})[\/\-]?(\d{1,2})[\/\-]?(\d{2,4})/;
  const mmddyyyyMatch = cleaned.match(mmddyyyyPattern);
    if (mmddyyyyMatch && mmddyyyyMatch[1] && mmddyyyyMatch[2] && mmddyyyyMatch[3]) {
      const monthInput = parseInt(mmddyyyyMatch[1], 10);
      const dayInput = parseInt(mmddyyyyMatch[2], 10);
      const yearInput = parseInt(mmddyyyyMatch[3], 10);

      // Handle 2-digit years
      const year = yearInput < 100 
        ? (yearInput < 50 ? 2000 + yearInput : 1900 + yearInput)
        : yearInput;

      // Validate and format
      if (monthInput >= 1 && monthInput <= 12 && dayInput >= 1 && dayInput <= 31 && year >= 1900 && year <= 2100) {
        // Check if it's mm/dd or dd/mm format (common ambiguity)
        // If month > 12, it must be dd/mm format
        const finalMonth = (monthInput > 12 && dayInput <= 12) ? dayInput : monthInput;
        const finalDay = (monthInput > 12 && dayInput <= 12) ? monthInput : dayInput;

        return `${year}-${finalMonth.toString().padStart(2, '0')}-${finalDay.toString().padStart(2, '0')}`;
      }
  }

  // Pattern 2: 8 consecutive digits (mmddyyyy)
  const eightDigitsPattern = /(\d{8})/;
  const eightDigitsMatch = cleaned.match(eightDigitsPattern);
  if (eightDigitsMatch && eightDigitsMatch[1]) {
    const digits = eightDigitsMatch[1];
    const month = parseInt(digits.substring(0, 2), 10);
    const day = parseInt(digits.substring(2, 4), 10);
    const year = parseInt(digits.substring(4, 8), 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }

  // Pattern 3: Natural language dates (January 1st 1990, Jan 1 1990)
  const monthNames: Record<string, number> = {
    january: 1, jan: 1,
    february: 2, feb: 2,
    march: 3, mar: 3,
    april: 4, apr: 4,
    may: 5,
    june: 6, jun: 6,
    july: 7, jul: 7,
    august: 8, aug: 8,
    september: 9, sept: 9, sep: 9,
    october: 10, oct: 10,
    november: 11, nov: 11,
    december: 12, dec: 12,
  };

  // Match month name, day, year
  const naturalPattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sept|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})\b/i;
  const naturalMatch = cleaned.match(naturalPattern);
  if (naturalMatch && naturalMatch[1] && naturalMatch[2] && naturalMatch[3]) {
    const monthName = naturalMatch[1].toLowerCase();
    const month = monthNames[monthName];
    const day = parseInt(naturalMatch[2], 10);
    const year = parseInt(naturalMatch[3], 10);

    if (month && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }

  // Pattern 4: Spoken numbers (zero one zero one one nine nine zero)
  const numberWords: Record<string, string> = {
    zero: '0', one: '1', two: '2', three: '3', four: '4',
    five: '5', six: '6', seven: '7', eight: '8', nine: '9',
    oh: '0', o: '0',
  };

  const spokenPattern = /\b(zero|one|two|three|four|five|six|seven|eight|nine|oh|o)\b/gi;
  const spokenMatches = cleaned.match(spokenPattern);
  if (spokenMatches && spokenMatches.length >= 6) {
    // Convert spoken numbers to digits
    const digits = spokenMatches.slice(0, 8).map(word => numberWords[word.toLowerCase()] || '').join('');
    
    if (digits.length === 8) {
      const month = parseInt(digits.substring(0, 2), 10);
      const day = parseInt(digits.substring(2, 4), 10);
      const year = parseInt(digits.substring(4, 8), 10);

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
  }

  // Pattern 5: ISO format (YYYY-MM-DD) - already in correct format
  const isoPattern = /(\d{4})-(\d{1,2})-(\d{1,2})/;
  const isoMatch = cleaned.match(isoPattern);
  if (isoMatch && isoMatch[1] && isoMatch[2] && isoMatch[3]) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Smart field parser - extracts structured data based on field type
 */
export function parseFieldValue(text: string, fieldType: 'date' | 'phone' | 'email' | 'number' | 'text'): string {
  if (!text || typeof text !== 'string') return '';

  const normalized = text.trim();

  switch (fieldType) {
    case 'date':
      return parseDateFromVoice(normalized) || normalized;
    
    case 'phone':
      // Extract phone number (remove words, keep digits and formatting)
      const phoneDigits = normalized.replace(/\D/g, '');
      if (phoneDigits.length === 10) {
        return `(${phoneDigits.substring(0, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6)}`;
      }
      return normalized;
    
    case 'email':
      // Extract email pattern
      const emailMatch = normalized.match(/\b[\w\.-]+@[\w\.-]+\.\w+\b/i);
      return emailMatch ? emailMatch[0] : normalized;
    
    case 'number':
      // Extract numbers only
      return normalized.replace(/\D/g, '');
    
    case 'text':
    default:
      return normalized;
  }
}
