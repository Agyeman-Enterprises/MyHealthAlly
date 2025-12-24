'use client';

import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function LegalSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Legal & Privacy" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Documents</h2>
          
          <div className="space-y-4">
            <Link href="/legal/hipaa">
              <Card hover className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">HIPAA Notice of Privacy Practices</h3>
                    <p className="text-sm text-gray-500 mt-1">How we protect and use your health information</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>

            <Link href="/legal/privacy">
              <Card hover className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
                    <p className="text-sm text-gray-500 mt-1">How we collect, use, and protect your information</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>

            <Link href="/legal/financial-privacy">
              <Card hover className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Financial Privacy Policy</h3>
                    <p className="text-sm text-gray-500 mt-1">How we handle your payment and billing information</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>

            <Link href="/legal/terms">
              <Card hover className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Terms of Service</h3>
                    <p className="text-sm text-gray-500 mt-1">Terms and conditions for using MyHealth Ally</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

