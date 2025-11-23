'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send, FileText } from 'lucide-react';
import { getMessages, getPatientById } from '@/lib/clinician-demo-data';
import type { MessageSummary } from '@/lib/clinician-demo-data';
import Link from 'next/link';

export default function ClinicianMessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const messages = getMessages();
  const filteredMessages = messages.filter(
    (m) =>
      m.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lastMessageSnippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThread = activeThreadId
    ? messages.find((m) => m.id === activeThreadId)
    : filteredMessages[0];

  const patient = activeThread ? getPatientById(activeThread.patientId) : null;

  // Mock message history
  const messageHistory = activeThread
    ? [
        { id: '1', sender: 'patient', text: 'Hello doctor, I have a question about my medication.', time: '2024-01-20T10:00:00Z' },
        { id: '2', sender: 'clinician', text: 'Hi, I can help with that. What would you like to know?', time: '2024-01-20T10:15:00Z' },
        { id: '3', sender: 'patient', text: 'Should I take it with food?', time: '2024-01-20T10:20:00Z' },
        { id: '4', sender: 'clinician', text: 'Yes, please take it with a meal to reduce stomach upset.', time: '2024-01-20T10:25:00Z' },
        { id: '5', sender: 'patient', text: 'Thank you!', time: '2024-01-20T10:30:00Z' },
      ]
    : [];

  const quickResponses = [
    'Please schedule a follow-up visit',
    'Your labs look good',
    'Let me review your chart',
    'I will get back to you shortly',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left: Conversation List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-textSecondary)' }} />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ backgroundColor: 'var(--color-surface)' }}
          />
        </div>
        <Card style={{ backgroundColor: 'var(--color-surface)' }}>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {filteredMessages.map((message: MessageSummary) => (
                  <div
                    key={message.id}
                    onClick={() => setActiveThreadId(message.id)}
                    className="p-4 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: activeThreadId === message.id ? 'var(--color-primaryLight)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (activeThreadId !== message.id) {
                        e.currentTarget.style.backgroundColor = 'var(--color-background)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeThreadId !== message.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primaryLight)' }}>
                        <span className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>
                          {message.patientName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-small truncate" style={{ color: 'var(--color-textPrimary)' }}>
                            {message.patientName}
                          </p>
                          {message.unreadCount > 0 && (
                            <Badge style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }} className="text-xs">
                              {message.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm truncate" style={{ color: 'var(--color-textSecondary)' }}>
                          {message.lastMessageSnippet}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                          {new Date(message.lastMessageTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right: Active Thread */}
      <div className="lg:col-span-2 space-y-4">
        {activeThread && patient ? (
          <>
            <Card style={{ backgroundColor: 'var(--color-surface)' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primaryLight)' }}>
                      <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                        {patient.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-body" style={{ color: 'var(--color-textPrimary)' }}>{patient.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          style={{
                            backgroundColor: patient.riskLevel === 'high' ? 'var(--color-danger)' : 'var(--color-warning)',
                            color: '#FFFFFF',
                          }}
                        >
                          {patient.riskLevel} risk
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          RPM enrolled
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/clinician/patients/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Open Chart
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">Create Task</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1" style={{ backgroundColor: 'var(--color-surface)' }}>
              <CardContent className="p-0 flex flex-col h-[calc(100vh-400px)]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messageHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === 'clinician' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className="max-w-[70%] rounded-lg p-3"
                          style={{
                            backgroundColor: msg.sender === 'clinician' ? 'var(--color-primary)' : 'var(--color-background)',
                            color: msg.sender === 'clinician' ? '#FFFFFF' : 'var(--color-textPrimary)',
                            borderRadius: 'var(--radius)',
                          }}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className="text-xs mt-1"
                            style={{
                              color: msg.sender === 'clinician' ? 'rgba(255,255,255,0.7)' : 'var(--color-textSecondary)',
                            }}
                          >
                            {new Date(msg.time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t p-4 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex gap-2 flex-wrap">
                    {quickResponses.map((response, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setMessageInput(response)}
                        className="text-xs"
                      >
                        {response}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                      }}
                      rows={2}
                    />
                    <Button
                      variant="primary"
                      onClick={() => {
                        // Handle send
                        setMessageInput('');
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardContent className="p-12 text-center">
              <p style={{ color: 'var(--color-textSecondary)' }}>Select a conversation to view messages</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

