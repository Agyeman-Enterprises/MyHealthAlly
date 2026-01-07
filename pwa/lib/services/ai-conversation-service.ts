/**
 * AI Conversation Persistence Service
 * Handles saving and loading AI chat conversations from database
 */

import { supabase } from '@/lib/supabase/client';

export interface ConversationMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  originalContent?: string; // Original text before translation
  contentLanguage?: string;
  suggestedQuestions?: string[];
  createdAt?: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  patientId?: string | null;
  title?: string | null;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  messages: ConversationMessage[];
}

/**
 * Get or create a conversation for the current user
 */
export async function getOrCreateConversation(
  userId: string,
  patientId?: string | null,
  language: string = 'en'
): Promise<string> {
  // Try to get the most recent active conversation
  const { data: existing, error: fetchError } = await supabase
    .from('ai_chat_conversations')
    .select('id')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })
    .limit(1)
    .single();

  if (existing && !fetchError) {
    return existing.id;
  }

  // Create a new conversation
  const { data: newConv, error: createError } = await supabase
    .from('ai_chat_conversations')
    .insert({
      user_id: userId,
      patient_id: patientId || null,
      language,
      title: null, // Will be set from first message
    })
    .select('id')
    .single();

  if (createError || !newConv) {
    throw new Error('Failed to create conversation');
  }

  return newConv.id;
}

/**
 * Load conversation history from database
 */
export async function loadConversation(
  conversationId: string
): Promise<Conversation | null> {
  // Load conversation
  const { data: conv, error: convError } = await supabase
    .from('ai_chat_conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (convError || !conv) {
    return null;
  }

  // Load messages
  const { data: messages, error: msgError } = await supabase
    .from('ai_chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgError) {
    console.error('Error loading messages:', msgError);
  }

  return {
    id: conv.id,
    userId: conv.user_id,
    patientId: conv.patient_id,
    title: conv.title,
    language: conv.language || 'en',
    createdAt: new Date(conv.created_at),
    updatedAt: new Date(conv.updated_at),
    lastMessageAt: new Date(conv.last_message_at),
    messages: (messages || []).map((msg) => {
      const message: ConversationMessage = {
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        ...(msg.original_content && { originalContent: msg.original_content }),
        ...(msg.content_language && { contentLanguage: msg.content_language }),
        ...(msg.suggested_questions && { suggestedQuestions: msg.suggested_questions as string[] }),
        createdAt: new Date(msg.created_at),
      };
      return message;
    }),
  };
}

/**
 * Load the most recent conversation for a user
 */
export async function loadMostRecentConversation(
  userId: string
): Promise<Conversation | null> {
  const { data: conv, error } = await supabase
    .from('ai_chat_conversations')
    .select('id')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !conv) {
    return null;
  }

  return loadConversation(conv.id);
}

/**
 * Save a message to the conversation
 */
export async function saveMessage(
  conversationId: string,
  message: ConversationMessage
): Promise<string> {
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .insert({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      original_content: message.originalContent || null,
      content_language: message.contentLanguage || 'en',
      suggested_questions: message.suggestedQuestions || [],
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('Failed to save message');
  }

  // Update conversation title if it's the first user message
  if (message.role === 'user' && message.content) {
    const { data: conv } = await supabase
      .from('ai_chat_conversations')
      .select('title')
      .eq('id', conversationId)
      .single();

    if (conv && !conv.title) {
      // Set title from first message (truncated to 50 chars)
      const title = message.content.substring(0, 50).trim();
      await supabase
        .from('ai_chat_conversations')
        .update({ title })
        .eq('id', conversationId);
    }
  }

  return data.id;
}

/**
 * Get all conversations for a user (for conversation list)
 */
export async function getUserConversations(
  userId: string,
  limit: number = 20
): Promise<Array<{ id: string; title: string | null; lastMessageAt: Date; messageCount: number }>> {
  const { data, error } = await supabase
    .from('ai_chat_conversations')
    .select('id, title, last_message_at')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  // Get message counts for each conversation
  const conversations = await Promise.all(
    data.map(async (conv) => {
      const { count } = await supabase
        .from('ai_chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id);

      return {
        id: conv.id,
        title: conv.title,
        lastMessageAt: new Date(conv.last_message_at),
        messageCount: count || 0,
      };
    })
  );

  return conversations;
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_chat_conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    throw new Error('Failed to delete conversation');
  }
}
