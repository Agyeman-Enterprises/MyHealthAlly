'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    alert('Message sent! We will respond within 1-2 business days.');
    setForm({ subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Contact Us</h1>
        <p className="text-gray-600 mb-6">Get in touch with our support team</p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-3xl mb-2">📞</div>
            <h3 className="font-semibold text-navy-600">Phone</h3>
            <a href="tel:+16715550123" className="text-primary-600 hover:underline">(671) 555-0123</a>
            <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9AM-5PM ChST</p>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">🚨</div>
            <h3 className="font-semibold text-navy-600">Emergency</h3>
            <a href="tel:911" className="text-red-600 font-bold hover:underline">Call 911</a>
            <p className="text-xs text-gray-500 mt-1">For medical emergencies</p>
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold text-navy-600 mb-4">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" required>
                <option value="">Select a topic</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Question</option>
                <option value="account">Account Help</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="How can we help you?" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" required />
            </div>
            <Button type="submit" variant="primary" className="w-full" isLoading={sending}>Send Message</Button>
          </form>
        </Card>

        <Card className="mt-6">
          <h3 className="font-semibold text-navy-600 mb-2">📍 Office Location</h3>
          <p className="text-gray-600">Ohimaa GU Functional Medicine</p>
          <p className="text-gray-600">123 Health Center Drive</p>
          <p className="text-gray-600">Tamuning, GU 96913</p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
