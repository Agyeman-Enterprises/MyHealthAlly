import { getPublishedContent, getHiddenModules, findRelevantContent, type ContentModule } from './loadContent';

/**
 * AI Citation Helper
 * 
 * When AI explains health concepts, it should reference existing library modules.
 * This helper finds relevant content and formats citations for AI responses.
 */

export async function getRelevantLibraryCitations(
  userQuery: string,
  maxResults: number = 3
): Promise<Array<{ title: string; url: string; category: string }>> {
  // Only use published modules for citations
  const publishedModules = await getPublishedContent();
  
  // Extract keywords from user query
  const keywords = extractKeywords(userQuery);
  
  // Find relevant modules
  const relevant = findRelevantContent(publishedModules, keywords);
  
  // Return top results with formatted citations
  return relevant
    .slice(0, maxResults)
    .map((module) => ({
      title: module.title,
      url: `/library/${module.category}/${module.slug}`,
      category: module.category,
    }));
}

/**
 * Get hidden module titles for AI teaser references (title only, no body)
 * AI may reference these titles but must not quote body text
 */
export async function getHiddenModuleTitles(): Promise<Array<{ title: string; category: string }>> {
  const hidden = await getHiddenModules();
  return hidden.map((m) => ({
    title: m.title,
    category: m.category,
  }));
}

function extractKeywords(text: string): string[] {
  // Common health-related keywords to match against
  const healthKeywords = [
    'symptom', 'fatigue', 'pain', 'sleep', 'nutrition', 'diet', 'exercise',
    'movement', 'stress', 'anxiety', 'depression', 'fever', 'headache',
    'nausea', 'digestive', 'respiratory', 'cardiac', 'chest', 'breathing',
    'urgent', 'emergency', 'chronic', 'acute', 'inflammation', 'protein',
    'hydration', 'mobility', 'flexibility', 'wellness', 'health', 'care',
    'concierge', 'clinician', 'doctor', 'treatment', 'medication', 'condition',
  ];
  
  const lowerText = text.toLowerCase();
  const found = healthKeywords.filter((keyword) => lowerText.includes(keyword));
  
  // Also extract any words longer than 4 characters as potential keywords
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
  
  return [...found, ...words].slice(0, 10);
}

/**
 * Format citation for AI response
 */
export function formatCitation(module: { title: string; url: string; category: string }): string {
  return `[${module.title}](/library/${module.category}/${module.url.split('/').pop()})`;
}

/**
 * AI System Prompt Addition
 * 
 * Add this to your AI prompt system rules:
 * 
 * "When explaining health concepts, preferentially reference or link to existing MyHealthAlly library modules.
 * If a relevant module exists, cite it by title and provide a link.
 * Do not invent medical advice.
 * Always frame responses as health navigation, not diagnosis.
 * 
 * Available library modules cover: health navigation, nutrition, movement, lifestyle, and concierge care.
 * When a user asks about topics covered in the library, reference the relevant module(s) with a link.
 * 
 * AI MAY reference:
 * - Published modules (full citation with link)
 * - Hidden module titles only (teaser, no body text)
 * 
 * AI MUST NOT:
 * - Quote hidden module body text
 * - Reference draft modules
 */
export const AI_CITATION_SYSTEM_RULE = `When explaining health concepts, preferentially reference or link to existing MyHealthAlly library modules.
If a relevant module exists, cite it by title and provide a link.
Do not invent medical advice.
Always frame responses as health navigation, not diagnosis.

AI MAY reference:
- Published modules (full citation with link)
- Hidden module titles only (teaser, no body text)

AI MUST NOT:
- Quote hidden module body text
- Reference draft modules`;

