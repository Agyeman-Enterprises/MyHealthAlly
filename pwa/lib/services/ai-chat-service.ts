/**
 * AI Chat Service - WebMD-style Interactive Assistant
 * Provides conversational AI health assistance with rate limiting and caching
 * Similar to WebMD's HealthInteractive assistant - provides general health information
 */

import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';
import * as redis from '@/lib/redis/client';
import { recordAIUsage } from './ai-usage-tracking';
import { throttleAIUsage } from './usage-throttle';
import { getOveragePolicy } from './usage-policies';

const anthropic = env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    })
  : null;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  userId?: string; // For user-scoped caching and usage tracking
  subscriptionId?: string; // For user subscription usage tracking
  practiceSubscriptionId?: string; // For practice subscription usage tracking
  isAdmin?: boolean; // For admin bypass
}

export interface ChatResponse {
  response: string;
  suggestedQuestions?: string[];
}

/**
 * Rate limiting and caching configuration
 * 
 * Uses Redis (Upstash) for production with automatic fallback to in-memory storage.
 * This provides distributed caching and rate limiting across multiple instances.
 * 
 * Development mode: Stricter limits to conserve tokens
 */
const isDevelopment = process.env.NODE_ENV === 'development';

// Cache TTL: Longer in dev to reduce API calls
const CACHE_TTL_SECONDS = isDevelopment ? 10 * 60 : 3 * 60; // 10 min in dev, 3 min in prod

// Rate limiting: Stricter in dev to prevent excessive token usage
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute in seconds
const MAX_REQUESTS_PER_WINDOW = isDevelopment ? 5 : 15; // 5 msgs/min in dev, 15 in prod

// Token limits: Lower in dev to conserve tokens
const MAX_TOKENS = isDevelopment ? 500 : 1000; // 500 tokens in dev, 1000 in prod

/**
 * WebMD-style Health Information Assistant
 * Provides general health information similar to WebMD's interactive assistant
 */
const CHAT_SYSTEM_PROMPT = `You are a helpful health information assistant, similar to WebMD's interactive assistant. Your role is to provide general health information and help users understand health topics.

IMPORTANT BOUNDARIES:
1. Do not diagnose specific conditions for the user or provide personalized diagnoses
2. Do not prescribe specific medications, treatments, or dosages for the user
3. Do not provide personalized medical advice tailored to the user's specific case
4. Always include a disclaimer that this is general information, not medical advice

Your role is to:
- Provide general health information and education about conditions, symptoms, and treatments
- Explain health topics in clear, understandable language
- Discuss conditions, symptoms, and treatments in general/educational terms
- Help users understand when to seek professional medical care
- Answer general health questions with informative responses
- Provide educational content about medications, treatments, and health conditions

You CAN:
- Discuss conditions, symptoms, and treatments in general terms
- Provide educational information about medications and treatments
- Explain what certain symptoms might indicate (in general terms)
- Discuss common causes of symptoms
- Provide general health education

You CANNOT:
- Diagnose the user's specific condition
- Prescribe specific medications or treatments for the user
- Provide personalized medical advice based on the user's specific case

Be conversational, friendly, and informative - like WebMD's assistant. Provide helpful, detailed health information while always reminding users to consult their healthcare provider for personalized care.`;

/**
 * Generate cache key from user, message, and recent history
 * Commercial best practice: Cache scope = user + conversation
 */
function generateCacheKey(userId: string, message: string, history?: ChatMessage[]): string {
  const recentHistory = history?.slice(-3).map(m => m.content).join('|') || '';
  // Include user ID in cache key for user-scoped caching
  const key = `${userId}|${message.toLowerCase().trim()}|${recentHistory}`;
  return key.substring(0, 250); // Increased limit to accommodate user ID
}

/**
 * Check rate limiting with admin bypass
 * Commercial best practice: Admin bypass enabled
 * Uses Redis for distributed rate limiting
 */
async function checkRateLimit(identifier: string, isAdmin: boolean = false): Promise<{ allowed: boolean; remaining?: number; resetAt?: number }> {
  // Admin bypass - admins are not rate limited
  if (isAdmin) {
    return { allowed: true };
  }

  const rateLimitKey = `ratelimit:ai-chat:${identifier}`;
  const { count, resetAt } = await redis.incrementRateLimit(rateLimitKey, RATE_LIMIT_WINDOW_SECONDS);

  if (count > MAX_REQUESTS_PER_WINDOW) {
    return { 
      allowed: false, 
      remaining: 0,
      resetAt
    };
  }

  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_WINDOW - count,
    resetAt
  };
}

// Cache cleanup is handled automatically by Redis TTL
// No manual cleanup needed for Redis-based caching

/**
 * Sanitize response - minimal restrictions like WebMD
 * Only blocks direct personal diagnoses and prescriptions
 */
function sanitizeResponse(text: string): string {
  // Only block direct personal diagnoses and prescriptions
  const forbidden = [
    // Direct personal diagnosis: "You have X" or "This means you have X"
    /\b(you (have|definitely have|absolutely have)|this means you have|you are diagnosed with|you definitely have)\b.*\b(infection|pneumonia|appendicitis|flu|covid|stroke|heart attack|uti|migraine|cancer|disease|condition)\b/gi,
    // Direct prescription: "You should take X mg of Y"
    /\b(you should take|you need to take|you must take|I prescribe|take this medication)\b.*\b\d+\s?(mg|mcg|g|ml|tablet|capsule)\b/gi,
    // Direct personal treatment recommendation
    /\b(I am diagnosing you|I diagnose you with|your diagnosis is|you are diagnosed)\b/gi,
  ];

  let cleaned = text;
  forbidden.forEach((re) => {
    cleaned = cleaned.replace(
      re,
      "I can't provide personalized diagnoses or prescriptions. This is general health information. Please consult your healthcare provider for personalized care."
    );
  });

  // Add a simple disclaimer if not present (but don't force it on every response)
  const hasDisclaimer = cleaned.toLowerCase().includes('not medical advice') || 
                       cleaned.toLowerCase().includes('consult') || 
                       cleaned.toLowerCase().includes('healthcare provider') ||
                       cleaned.toLowerCase().includes('general information');
  
  if (!hasDisclaimer && cleaned.length > 100) {
    cleaned += '\n\n*This is general health information, not medical advice. Please consult your healthcare provider for personalized care.*';
  }

  return cleaned;
}

/**
 * Generate suggested follow-up questions
 */
function generateSuggestedQuestions(message: string): string[] {
  const suggestions: string[] = [];
  const lowerMessage = message.toLowerCase();

  // Symptom-related questions
  if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || lowerMessage.includes('ache')) {
    suggestions.push('How should I track my symptoms?');
    suggestions.push('When should I contact my care team?');
  }

  // Medication questions
  if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('drug')) {
    suggestions.push('How do I request a medication refill?');
    suggestions.push('What should I know about medication side effects?');
  }

  // General health questions
  if (lowerMessage.includes('health') || lowerMessage.includes('wellness')) {
    suggestions.push('What preventive care should I consider?');
    suggestions.push('How can I improve my overall health?');
  }

  // Always include a general option
  if (suggestions.length < 3) {
    suggestions.push('How can I contact my care team?');
    suggestions.push('What health information is available?');
  }

  return suggestions.slice(0, 3);
}

/**
 * Chat with AI assistant (WebMD-style)
 * Includes rate limiting and caching to prevent throttling
 * 
 * Commercial best practices implemented:
 * - Cache TTL: 2-5 minutes (using 3 minutes)
 * - Cache Scope: user + conversation
 * - Rate limit: 10-20 msgs/min/user (using 15)
 * - Admin bypass: Yes
 * - Error UX: Friendly + explicit
 */
export async function chatWithAssistant(
  request: ChatRequest,
  userIdentifier: string = 'anonymous'
): Promise<ChatResponse> {
  if (!anthropic) {
    throw new Error('AI service is currently unavailable. Please try again later.');
  }

  // Check rate limiting with admin bypass
  const rateLimitResult = await checkRateLimit(userIdentifier, request.isAdmin || false);
  if (!rateLimitResult.allowed) {
    const waitSeconds = rateLimitResult.resetAt 
      ? Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      : 60;
    
    throw new Error(
      `You've reached the rate limit of ${MAX_REQUESTS_PER_WINDOW} messages per minute. ` +
      `Please wait ${waitSeconds} second${waitSeconds !== 1 ? 's' : ''} before sending another message. ` +
      `This helps us provide reliable service to all users.`
    );
  }

  // Check usage limits (throttling) - only for non-admin users
  if (!request.isAdmin) {
    // Get plan policy for overage handling
    let planId: string | undefined;
    if (request.subscriptionId || request.practiceSubscriptionId || request.userId) {
      // We'll get the plan ID from the subscription, but for now use default policy
      planId = 'individual'; // Default, will be fetched from subscription in production
    }
    
    const policy = planId ? getOveragePolicy(planId) : 'allow_with_billing';
    const throttleResult = await throttleAIUsage(
      request.subscriptionId,
      request.practiceSubscriptionId,
      request.userId,
      policy
    );

    if (!throttleResult.allowed) {
      throw new Error(throttleResult.reason || 'Usage limit exceeded');
    }

    // If overage is allowed but we're over limit, log a warning
    if (throttleResult.overageAllowed && throttleResult.remaining === 0) {
      console.warn(`User exceeded usage limit but overage billing is enabled. Usage will be tracked for billing.`);
    }
  }

  // Check cache (user-scoped, Redis-backed)
  const userId = request.userId || userIdentifier;
  const cacheKey = `cache:ai-chat:${generateCacheKey(userId, request.message, request.conversationHistory)}`;
  const cached = await redis.getCache(cacheKey);
  if (cached) {
    return {
      response: cached,
      suggestedQuestions: generateSuggestedQuestions(request.message),
    };
  }

  try {
    // Build conversation history for context
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    // Add recent conversation history (last 5 messages for context)
    if (request.conversationHistory) {
      const recentHistory = request.conversationHistory.slice(-5);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: request.message,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: MAX_TOKENS,
      system: CHAT_SYSTEM_PROMPT,
      messages: messages as any,
    });

    const responseText =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : "I'm sorry, I couldn't generate a response. Please try again.";

    // Track AI usage for billing (non-blocking)
    try {
      const inputTokens = response.usage?.input_tokens || 0;
      const outputTokens = response.usage?.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;

      // Record usage (async, don't block response)
      const usageRecord: {
        userId?: string;
        subscriptionId?: string;
        practiceSubscriptionId?: string;
        interactionType: 'chat';
        tokensUsed: number;
        inputTokens: number;
        outputTokens: number;
        costCents: number;
        metadata: Record<string, unknown>;
      } = {
        interactionType: 'chat',
        tokensUsed: totalTokens,
        inputTokens,
        outputTokens,
        costCents: 0, // Will be calculated by service
        metadata: {
          cacheKey,
          model: 'claude-3-5-sonnet-20241022',
        },
      };
      
      if (request.userId) usageRecord.userId = request.userId;
      if (request.subscriptionId) usageRecord.subscriptionId = request.subscriptionId;
      if (request.practiceSubscriptionId) usageRecord.practiceSubscriptionId = request.practiceSubscriptionId;
      
      recordAIUsage(usageRecord).catch((err) => {
        console.error('Failed to record AI usage:', err);
      });
    } catch (usageError) {
      console.error('Error tracking AI usage:', usageError);
    }

    // Sanitize response
    const sanitized = sanitizeResponse(responseText);

    // Cache the response in Redis (with TTL)
    await redis.setCache(cacheKey, sanitized, CACHE_TTL_SECONDS);

    // Generate suggested questions
    const suggestedQuestions = generateSuggestedQuestions(request.message);

    return {
      response: sanitized,
      suggestedQuestions,
    };
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    
    // Check if it's a rate limit error from Anthropic
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      throw new Error('AI service is temporarily busy. Please try again in a moment.');
    }
    
    throw new Error('Failed to get AI response. Please try again.');
  }
}

/**
 * Clear cache (useful for testing or manual cache management)
 * Note: This only clears in-memory cache. Redis cache will expire naturally via TTL.
 */
export async function clearCache(): Promise<void> {
  // Redis cache expires automatically via TTL
  // In-memory fallback is handled by redis client
  console.log('[AI Chat] Cache clear requested (Redis cache expires via TTL)');
}

/**
 * Get cache stats (useful for monitoring)
 */
export function getCacheStats(): { redisAvailable: boolean; storage: string } {
  return {
    redisAvailable: redis.isRedisAvailable(),
    storage: redis.isRedisAvailable() ? 'Redis' : 'In-Memory',
  };
}
