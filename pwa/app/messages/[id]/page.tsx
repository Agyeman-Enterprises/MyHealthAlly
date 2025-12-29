'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const mockThread = [
  { id: '1', from: 'You', date: '2024-12-24T10:00:00', content: 'Hi, I have a question about my recent lab results. My glucose level seems higher than usual.' },
  { id: '2', from: 'Dr. Smith', date: '2024-12-24T14:30:00', content: 'Thank you for reaching out. I reviewed your lab results and while your glucose is slightly elevated at 112 mg/dL, this is only marginally above the normal range. I would recommend monitoring your carbohydrate intake and we can recheck in 3 months. Would you like to schedule a follow-up appointment to discuss this further?' },
  { id: '3', from: 'You', date: '2024-12-25T09:00:00', content: 'Yes, I would like to schedule a follow-up. What times are available next week?' },
];

export default function MessageDetailPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    alert('Reply sent!');
    setReply('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-4">
          <h1 className="text-lg font-bold text-navy-600 mb-1">Lab Results Question</h1>
          <p className="text-sm text-gray-500">Conversation with Dr. Smith</p>
        </Card>

        <div className="space-y-4 mb-6">
          {mockThread.map((msg) => (
            <Card key={msg.id} className={msg.from === 'You' ? 'ml-8 bg-primary-50 border-primary-200' : 'mr-8'}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-navy-600">{msg.from}</span>
                <span className="text-xs text-gray-500">{new Date(msg.date).toLocaleString()}</span>
              </div>
              <p className="text-gray-700">{msg.content}</p>
            </Card>
          ))}
        </div>

        <Card>
          <form onSubmit={handleReply}>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder="Type your reply..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none mb-3" />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push('/messages')}>Back to Messages</Button>
              <Button type="submit" variant="primary" isLoading={sending} disabled={!reply.trim()}>Send Reply</Button>
            </div>
          </form>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
