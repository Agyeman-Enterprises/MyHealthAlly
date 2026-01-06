'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

const quickActions = [
  { name: 'Messages', description: 'Contact care team', href: '/messages', icon: '💬', color: 'from-primary-400 to-primary-500' },
  { name: 'Vitals', description: 'Record health data', href: '/vitals', icon: '📊', color: 'from-sky-400 to-sky-500' },
  { name: 'Medications', description: 'View prescriptions', href: '/medications', icon: '💊', color: 'from-pink-400 to-pink-500' },
  { name: 'Appointments', description: 'Schedule & view', href: '/appointments', icon: '📅', color: 'from-amber-400 to-amber-500' },
  { name: 'Lab Results', description: 'View test results', href: '/labs', icon: '🔬', color: 'from-green-400 to-green-500' },
  { name: 'Care Plan', description: 'Goals & activities', href: '/care-plan', icon: '📋', color: 'from-purple-400 to-purple-500' },
  { name: 'Symptom Check', description: 'AI-assisted symptom intake', href: '/symptom-check', icon: '🩺', color: 'from-emerald-400 to-emerald-600' },
  { name: 'Documents', description: 'Upload & view', href: '/documents', icon: '📄', color: 'from-blue-400 to-blue-500' },
  { name: 'Referrals', description: 'Request specialist', href: '/referrals', icon: '🏥', color: 'from-red-400 to-red-500' },
  { name: 'Billing', description: 'Invoices & payments', href: '/billing', icon: '💳', color: 'from-emerald-400 to-emerald-500' },
  { name: 'Intake Forms', description: 'Complete paperwork', href: '/intake', icon: '📝', color: 'from-orange-400 to-orange-500' },
  { name: 'Education', description: 'Health resources', href: '/education', icon: '📚', color: 'from-indigo-400 to-indigo-500' },
  { name: 'Pricing', description: 'Membership pricing & terms', href: '/pricing', icon: '💲', color: 'from-amber-400 to-amber-600' },
  { name: 'Settings', description: 'Preferences', href: '/settings', icon: '⚙️', color: 'from-gray-400 to-gray-500' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-600">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">What would you like to do today?</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card
              key={action.name}
              hover
              className="text-center p-4 cursor-pointer"
              onClick={() => router.push(action.href)}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-navy-600">{action.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
            </Card>
          ))}
        </div>

        {/* Emergency Banner */}
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-800">Need Emergency Help?</h3>
              <p className="text-sm text-red-600">For medical emergencies, call 911 immediately</p>
            </div>
            <a
              href="tel:911"
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call 911
            </a>
          </div>
        </Card>

        {/* Office Hours */}
        <Card className="mt-4 bg-primary-50 border-primary-200">
          <div className="flex items-start gap-3">
            <div className="text-xl">🕐</div>
            <div>
              <h3 className="font-semibold text-navy-600">Office Hours: Mon-Fri 9AM-5PM (ChST)</h3>
              <p className="text-sm text-gray-600">Messages sent outside office hours will be responded to on the next business day.</p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
