/**
 * API Route: AI Chat Assistant
 * WebMD-style interactive health assistant
 * Provides general health information similar to WebMD's HealthInteractive assistant
 * Supports persistent conversation history and multi-language translation
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatWithAssistant, type ChatRequest } from '@/lib/services/ai-chat-service';
import { 
  getOrCreateConversation, 
  saveMessage, 
  loadConversation,
  type ConversationMessage 
} from '@/lib/services/ai-conversation-service';
import { translateText } from '@/lib/utils/translate';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Use service role key for server-side operations
const supabase = env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * Get user ID from request (from header)
 * In a real implementation, you'd get this from the auth session
 */
async function getUserId(req: NextRequest): Promise<string | null> {
  // Get from header (set by client)
  const userIdHeader = req.headers.get('x-user-id');
  return userIdHeader || null;
}

/**
 * Check if user is admin
 */
async function isUserAdmin(userId: string): Promise<boolean> {
  if (!supabase || !userId) return false;
  
  try {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    return data?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Get user's preferred language
 */
async function getUserLanguage(userId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', userId)
      .single();

    return data?.preferred_language || 'en';
  } catch {
    return 'en';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, language } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user ID and check admin status
    const userId = await getUserId(req);
    const isAdmin = userId ? await isUserAdmin(userId) : false;
    const userLanguage = userId ? await getUserLanguage(userId) : (language || 'en');

    // Translate user message to English for AI (AI works best in English)
    const { translatedText: englishMessage, detectedLang } = await translateText(
      message.trim(),
      'en'
    );

    // Get or create conversation
    let currentConversationId: string | null = conversationId || null;
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (userId) {
      if (!currentConversationId) {
        // Get patient ID if available
        let patientId: string | null = null;
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
          .single();
        patientId = patient?.id || null;

        currentConversationId = await getOrCreateConversation(userId, patientId, userLanguage);
      }

      // Load conversation history
      const conversation = await loadConversation(currentConversationId);
      if (conversation) {
        // Convert to chat format (use original content if available, otherwise translated)
        conversationHistory = conversation.messages.map((msg) => ({
          role: msg.role,
          content: msg.role === 'user' 
            ? (msg.originalContent || msg.content) // Use original user message for context
            : msg.content, // AI responses are already in English
        }));
      }
    }

    // Get user identifier for rate limiting
    const userIdentifier = userId || 
                          req.headers.get('x-forwarded-for')?.split(',')[0] || 
                          'anonymous';

    // Prepare request for AI (use English message)
    const request: ChatRequest = {
      message: englishMessage,
      conversationHistory: conversationHistory || [],
      userId: userId || undefined, // For user-scoped caching
      isAdmin: isAdmin, // For admin bypass
    };

    // Get AI response
    const aiResponse = await chatWithAssistant(request, userIdentifier);

    // Translate AI response back to user's language
    let translatedResponse = aiResponse.response;
    if (userLanguage !== 'en' && userId) {
      const { translatedText } = await translateText(aiResponse.response, userLanguage);
      translatedResponse = translatedText || aiResponse.response;
    }

    // Save messages to database if user is authenticated
    if (userId && currentConversationId) {
      try {
        // Save user message
        await saveMessage(currentConversationId, {
          role: 'user',
          content: message.trim(), // Original user message in their language
          originalContent: englishMessage, // English translation
          contentLanguage: detectedLang || userLanguage,
        });

        // Save AI response
        await saveMessage(currentConversationId, {
          role: 'assistant',
          content: translatedResponse, // Response in user's language
          originalContent: aiResponse.response, // Original English response
          contentLanguage: userLanguage,
          suggestedQuestions: aiResponse.suggestedQuestions,
        });
      } catch (error) {
        console.error('Error saving messages:', error);
        // Continue even if save fails
      }
    }

    return NextResponse.json({
      response: translatedResponse,
      suggestedQuestions: aiResponse.suggestedQuestions,
      conversationId: currentConversationId,
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    const message = error instanceof Error ? error.message : 'Failed to get AI response';
    
    // Handle rate limiting specifically with friendly error
    if (message.includes('Rate limit') || message.includes('rate limit') || message.includes('reached the rate limit')) {
      return NextResponse.json(
        { 
          error: message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: 60 // seconds
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '15',
            'X-RateLimit-Window': '60'
          }
        }
      );
    }
    
    // Handle API errors with friendly messages
    if (message.includes('temporarily busy') || message.includes('unavailable')) {
      return NextResponse.json(
        { 
          error: message,
          code: 'SERVICE_UNAVAILABLE',
          retryAfter: 30
        },
        { 
          status: 503,
          headers: {
            'Retry-After': '30'
          }
        }
      );
    }
    
    // Generic error with friendly message
    return NextResponse.json(
      { 
        error: message || 'We encountered an issue processing your request. Please try again in a moment.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Load conversation history
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const conversation = await loadConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify user owns this conversation
    if (conversation.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error loading conversation:', error);
    return NextResponse.json(
      { error: 'Failed to load conversation' },
      { status: 500 }
    );
  }
}
