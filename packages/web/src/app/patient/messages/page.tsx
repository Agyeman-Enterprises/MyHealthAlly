'use client';

import { useState } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import FloatingNav from '@/components/patient/FloatingNav';
import { Send, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function PatientMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your MyHealthAlly Assistant. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string, isAI: boolean = false) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: isAI ? 'assistant' : 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput('');

    if (!isAI) {
      setLoading(true);
      // Simulate AI response
      setTimeout(() => {
        const prompt = `You are MyHealthAlly, a supportive, clinically grounded health assistant. The user asks: '${text}'. Reply in a calm, professional tone, under 80 words. Use plain language. Be reassuring and practical. If the question is urgent-sounding (chest pain, trouble breathing, stroke symptoms), include this line at the end: 'If this feels severe or sudden, please seek urgent care or call emergency services.'`;
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I understand your question. Let me provide you with helpful information. If you have specific concerns about your health, I recommend discussing them with your care team during your next visit. If this feels severe or sudden, please seek urgent care or call emergency services.",
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-myh-bg pb-24 flex flex-col">
      <div className="max-w-4xl mx-auto w-full p-6 space-y-4 flex-1 flex flex-col">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Messages</h1>
          <div className="flex items-center gap-2 text-sm text-myh-textSoft">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Secure connection</span>
          </div>
        </div>

        <GlowCard className="p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-myh-primarySoft rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-myh-primary" />
            </div>
            <div>
              <p className="font-medium text-myh-text">MyHealthAlly Assistant</p>
              <p className="text-xs text-myh-textSoft">Online</p>
            </div>
          </div>
        </GlowCard>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  msg.sender === 'user'
                    ? 'bg-myh-primary text-white'
                    : 'bg-myh-surface border border-myh-border text-myh-text'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-white/70' : 'text-myh-textSoft'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-myh-surface border border-myh-border rounded-xl p-4">
                <p className="text-sm text-myh-textSoft">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask a health question…"
            className="flex-1 bg-myh-surface border border-myh-border rounded-xl px-4 py-3 text-myh-text placeholder:text-myh-textSoft focus:outline-none focus:ring-2 focus:ring-myh-primary"
          />
          <PrimaryButton onClick={() => sendMessage(input)} className="px-6">
            <Send className="w-5 h-5" />
          </PrimaryButton>
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}

