'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { type ChatMessage } from '@/lib/services/ai-chat-service';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/i18n/language-store';
import { supabase } from '@/lib/supabase/client';
import { sendMessageToSolopractice, handleMessageStatus } from '@/lib/api/message-helpers';
import { translateText } from '@/lib/utils/translate';

interface AIChatAssistantProps {
  className?: string;
  onClose?: () => void;
}

export function AIChatAssistant({ className = '', onClose }: AIChatAssistantProps) {
  const { user } = useAuthStore();
  const { preferredLanguage } = useLanguageStore();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your health information assistant. I can help answer general health questions, explain health topics, and help you organize information for your care team. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isSendingToCareTeam, setIsSendingToCareTeam] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        // Get user's internal ID from Supabase
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setIsLoadingHistory(false);
          return;
        }

        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('supabase_auth_id', authUser.id)
          .single();

        if (!userRecord) {
          setIsLoadingHistory(false);
          return;
        }

        // Try to load most recent conversation if we have a conversationId
        // Otherwise, we'll create one on first message
        if (conversationId) {
          const response = await fetch(`/api/ai-chat?conversationId=${conversationId}`, {
            method: 'GET',
            headers: {
              'x-user-id': userRecord.id,
            },
          });

          if (response.ok) {
            const conversation = await response.json();
            if (conversation && conversation.messages && conversation.messages.length > 0) {
              // Convert to chat format
              const chatMessages: ChatMessage[] = conversation.messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content, // Already in user's language
                timestamp: new Date(msg.createdAt),
              }));
              
              setMessages(chatMessages);
            }
          }
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
        // Continue without history
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [user?.id, conversationId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setSuggestedQuestions([]);

    try {
      // Get user's internal ID for API
      let userId: string | undefined;
      if (user?.id) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('supabase_auth_id', authUser.id)
            .single();
          userId = userRecord?.id;
        }
      }

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: conversationId,
          language: preferredLanguage || 'en',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        
        // Handle rate limit errors with friendly message
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || data.retryAfter || 60;
          const friendlyMessage = data.error || 
            `You've sent too many messages. Please wait ${retryAfter} seconds before trying again. This helps us provide reliable service to all users.`;
          
          setError(friendlyMessage);
          
          const errorMessageObj: ChatMessage = {
            role: 'assistant',
            content: `⏱️ ${friendlyMessage}\n\nYou can continue our conversation once the rate limit resets.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessageObj]);
          return;
        }
        
        // Handle service unavailable errors
        if (response.status === 503) {
          const friendlyMessage = data.error || 
            'The AI service is temporarily unavailable. Please try again in a moment.';
          
          setError(friendlyMessage);
          
          const errorMessageObj: ChatMessage = {
            role: 'assistant',
            content: `🔧 ${friendlyMessage}\n\nWe're working to restore service as quickly as possible.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessageObj]);
          return;
        }
        
        // Generic error
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await response.json();

      // Update conversation ID if returned
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response, // Already translated to user's language
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSuggestedQuestions(data.suggestedQuestions || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      
      // Friendly error message
      const friendlyError = errorMessage.includes('Rate limit') || errorMessage.includes('rate limit')
        ? errorMessage // Already friendly from API
        : "I'm sorry, I encountered an issue processing your request. Please try again in a moment.";
      
      const errorMessageObj: ChatMessage = {
        role: 'assistant',
        content: `⚠️ ${friendlyError}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendToCareTeam = async () => {
    if (messages.length <= 1 || isSendingToCareTeam) return; // Only welcome message

    setIsSendingToCareTeam(true);
    setError(null);
    setSendSuccess(null);

    try {
      // Format conversation for care team
      const conversationText = messages
        .filter(msg => msg.role !== 'assistant' || !msg.content.includes("Hi! I'm your health information assistant")) // Skip welcome message
        .map(msg => {
          const role = msg.role === 'user' ? 'Patient' : 'AI Assistant';
          const timestamp = msg.timestamp 
            ? new Date(msg.timestamp).toLocaleString() 
            : new Date().toLocaleString();
          return `[${role} - ${timestamp}]\n${msg.content}`;
        })
        .join('\n\n');

      // Translate to English for care team
      const { translatedText: englishConversation } = await translateText(
        conversationText,
        'en'
      );

      // Send to care team
      const subject = `AI Assistant Conversation - ${new Date().toLocaleDateString()}`;
      const response = await sendMessageToSolopractice(
        `The following is a conversation I had with the AI health assistant:\n\n${englishConversation}\n\n---\n\nPlease review this conversation and let me know if you have any questions or recommendations.`,
        subject,
        undefined,
        preferredLanguage || 'en',
        'care-team'
      );

      const status = handleMessageStatus(response);
      if (status.success) {
        setSendSuccess(status.message);
      } else {
        setError(status.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send conversation to care team';
      setError(errorMessage);
    } finally {
      setIsSendingToCareTeam(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
            AI
          </div>
          <div>
            <h3 className="font-semibold text-navy-600">Health Assistant</h3>
            <p className="text-xs text-gray-500">General health information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendToCareTeam}
              isLoading={isSendingToCareTeam}
              disabled={isSendingToCareTeam}
            >
              {isSendingToCareTeam ? 'Sending...' : 'Send to Care Team'}
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLoadingHistory && (
          <div className="flex justify-center py-4">
            <div className="text-sm text-gray-500">Loading conversation history...</div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              {msg.timestamp && (
                <div
                  className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-white border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Thinking...
              </div>
            </Card>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <Card className="bg-red-50 border-red-200">
              <div className="text-sm text-red-600">{error}</div>
            </Card>
          </div>
        )}

        {sendSuccess && (
          <div className="flex justify-start">
            <Card className="bg-green-50 border-green-200">
              <div className="text-sm text-green-700">{sendSuccess}</div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="px-4 pt-2 pb-2 border-t border-gray-200 bg-white">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(question)}
                className="px-3 py-1.5 text-xs bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors border border-primary-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a health question..."
              rows={2}
              className="w-full px-4 py-3 pr-12 pb-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2">
              <VoiceInput
                onTranscript={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))}
                size="sm"
              />
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
          >
            Send
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This assistant provides general health information, not medical advice. For personalized care, contact your care team.
        </p>
      </div>
    </div>
  );
}
