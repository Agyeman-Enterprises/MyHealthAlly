'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

const settingsGroups = [
  {
    title: 'PREFERENCES',
    items: [
      { name: 'Language', desc: 'Choose your preferred language', href: '/settings/language', icon: '🌐', bg: 'bg-primary-400' },
      { name: 'Notifications', desc: 'Manage push and email notifications', href: '/settings/notifications', icon: '🔔', bg: 'bg-amber-400' },
      { name: 'Appearance', desc: 'Dark mode and display settings', href: '/settings/appearance', icon: '🎨', bg: 'bg-pink-400' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'Profile', desc: 'Update your personal information', href: '/settings/profile', icon: '👤', bg: 'bg-primary-500' },
      { name: 'Security', desc: 'Password, PIN, and biometrics', href: '/settings/security', icon: '🔒', bg: 'bg-amber-500' },
      { name: 'Connected Devices', desc: 'Manage health devices and apps', href: '/settings/devices', icon: '📱', bg: 'bg-sky-500' },
    ],
  },
  {
    title: 'LEGAL',
    items: [
      { name: 'Terms & Privacy', desc: 'Legal documents and policies', href: '/settings/legal', icon: '📄', bg: 'bg-primary-400' },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { name: 'Help & FAQ', desc: 'Get help and find answers', href: '/settings/help', icon: '❓', bg: 'bg-primary-500' },
      { name: 'Contact Us', desc: 'Reach out to our support team', href: '/settings/contact', icon: '✉️', bg: 'bg-primary-600' },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Settings</h1>
        <p className="text-gray-600 mb-6">Manage your preferences and account</p>

        {settingsGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">{group.title}</h2>
            <Card className="divide-y divide-gray-100 p-0">
              {group.items.map((item) => (
                <button key={item.name} onClick={() => router.push(item.href)} className="w-full flex items-center gap-4 p-4 hover:bg-primary-50 transition-colors first:rounded-t-xl last:rounded-b-xl text-left">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center text-xl`}>{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-navy-600">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </Card>
          </div>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
