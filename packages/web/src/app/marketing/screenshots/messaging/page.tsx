'use client';

import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { Bot } from 'lucide-react';

const messages = [
  {
    id: '1',
    text: 'Hello! I wanted to check in about your recent blood pressure readings. How have you been feeling?',
    sender: 'provider',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    text: 'Hi! I\'ve been feeling good. The readings have been pretty consistent around 120/80.',
    sender: 'user',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '3',
    text: 'That\'s great to hear. Keep up the good work with your medication routine. Let me know if anything changes.',
    sender: 'provider',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
];

export default function MessagingScreenshot() {
  return (
    <div className="min-h-screen bg-myh-bg pb-24 flex flex-col" style={{ aspectRatio: '9/19.5', maxWidth: '430px', margin: '0 auto' }}>
      <div className="max-w-4xl mx-auto w-full p-6 space-y-4 flex-1 flex flex-col">
        {/* Text Overlay */}
        <div className="text-center mb-4 space-y-2">
          <h2 className="text-2xl font-semibold text-myh-text">Stay connected to your care team.</h2>
          <p className="text-myh-textSoft">Ask questions and share updates between visits.</p>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Messages</h1>
        </div>

        <GlowCard className="p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-myh-primarySoft rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-myh-primary" />
            </div>
            <div>
              <p className="font-medium text-myh-text">Dr. Sarah Johnson</p>
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
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}

