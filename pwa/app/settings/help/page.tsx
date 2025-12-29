'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

const faqs = [
  { q: 'How do I send a message to my care team?', a: 'Go to Messages from the main menu or dashboard, then tap "New Message" to compose and send a secure message to your care team.' },
  { q: 'How long does it take to get a response?', a: 'Messages are typically answered within 24-48 business hours. For urgent matters, please call our office. For emergencies, call 911.' },
  { q: 'How do I record my vitals?', a: 'Navigate to Vitals from the menu, select the type of reading you want to record, enter your values, and tap Save.' },
  { q: 'Can I connect my health devices?', a: 'Yes! Go to Settings > Connected Devices to link Apple Health, Fitbit, Garmin, and other compatible devices.' },
  { q: 'How do I request a medication refill?', a: 'Go to Medications, find the medication you need refilled, and tap "Request Refill". Your care team will process the request.' },
  { q: 'Is my health information secure?', a: 'Yes, MyHealth Ally uses bank-level encryption and complies with HIPAA regulations to protect your health information.' },
];

export default function HelpPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Help & FAQ</h1>
        <p className="text-gray-600 mb-6">Find answers to common questions</p>

        <Card className="divide-y divide-gray-100 p-0 mb-6">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full p-4 text-left flex items-center justify-between hover:bg-primary-50 transition-colors">
                <span className="font-medium text-navy-600 pr-4">{faq.q}</span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expanded === i && (
                <div className="px-4 pb-4 text-gray-600">{faq.a}</div>
              )}
            </div>
          ))}
        </Card>

        <Card className="bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-navy-600 mb-2">Still need help?</h3>
          <p className="text-sm text-gray-600 mb-4">Our support team is here for you.</p>
          <div className="flex gap-3">
            <a href="/settings/contact" className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-xl text-center font-medium hover:bg-primary-600 transition-colors">Contact Support</a>
            <a href="tel:+16715550123" className="flex-1 px-4 py-2 border border-primary-500 text-primary-600 rounded-xl text-center font-medium hover:bg-primary-50 transition-colors">Call Us</a>
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
