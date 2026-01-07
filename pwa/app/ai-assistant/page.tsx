'use client';

import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AIChatAssistant } from '@/components/ai/AIChatAssistant';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function AIAssistantPage() {
  const { isLoading } = useRequireAuth();
  
  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header title="AI Health Assistant" showBack />
      <DisclaimerBanner />
      
      <main className="max-w-4xl mx-auto px-4 py-4 h-[calc(100vh-180px)]">
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <AIChatAssistant />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
