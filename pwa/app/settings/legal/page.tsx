'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

const documents = [
  { name: 'Terms of Service', updated: 'December 1, 2024', href: '/legal/terms' },
  { name: 'Privacy Policy', updated: 'December 1, 2024', href: '/legal/privacy' },
  { name: 'HIPAA Notice of Privacy Practices', updated: 'November 15, 2024', href: '/legal/hipaa' },
  { name: 'Financial Privacy Policy', updated: 'December 1, 2024', href: '/legal/financial-privacy' },
  { name: 'Consent Forms', updated: 'December 1, 2024', href: '/legal/consent', highlight: true },
];

export default function LegalPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Terms & Privacy</h1>
        <p className="text-gray-600 mb-6">Legal documents and policies</p>

        <Card className="divide-y divide-gray-100 p-0">
          {documents.map((doc) => (
            <a 
              key={doc.name} 
              href={doc.href} 
              className={`block p-4 hover:bg-primary-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                (doc as any).highlight ? 'bg-primary-50 border-l-4 border-primary-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-navy-600">{doc.name}</h3>
                  <p className="text-sm text-gray-500">Last updated: {doc.updated}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </Card>

        <Card className="mt-6 bg-primary-50 border-primary-200">
          <p className="text-sm text-navy-600">
            By using MyHealth Ally, you agree to these terms and acknowledge our privacy practices. 
            For questions about these policies, please <a href="/settings/contact" className="text-primary-600 hover:underline">contact us</a>.
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
