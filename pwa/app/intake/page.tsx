'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const forms = [
  { id: '1', name: 'Patient Registration', description: 'Basic demographic and contact information', status: 'completed', required: true },
  { id: '2', name: 'Medical History', description: 'Past medical conditions, surgeries, allergies', status: 'completed', required: true },
  { id: '3', name: 'Medication List', description: 'Current medications and supplements', status: 'incomplete', required: true },
  { id: '4', name: 'Insurance Information', description: 'Insurance cards and policy details', status: 'incomplete', required: true },
  { id: '5', name: 'HIPAA Consent', description: 'Privacy practices acknowledgment', status: 'completed', required: true },
  { id: '6', name: 'Financial Agreement', description: 'Payment policies and authorization', status: 'not-started', required: true },
];

export default function IntakePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [formList] = useState(forms);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const completed = formList.filter(f => f.status === 'completed').length;
  const total = formList.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Intake Forms</h1>
          <p className="text-gray-600">Complete your registration paperwork</p>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-primary-100 to-sky-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700">Progress</p>
              <p className="text-2xl font-bold text-navy-600">{completed} of {total} forms completed</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-primary-300 flex items-center justify-center">
              <span className="text-lg font-bold text-primary-600">{Math.round((completed / total) * 100)}%</span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-white rounded-full">
            <div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" style={{ width: `${(completed / total) * 100}%` }} />
          </div>
        </Card>

        <div className="space-y-3">
          {formList.map((form) => (
            <Card key={form.id} hover className="cursor-pointer" onClick={() => alert(`Open ${form.name} form`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    form.status === 'completed' ? 'bg-green-100 text-green-600' :
                    form.status === 'incomplete' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {form.status === 'completed' ? '✓' : form.status === 'incomplete' ? '⋯' : '○'}
                  </div>
                  <div>
                    <h3 className="font-medium text-navy-600">{form.name}</h3>
                    <p className="text-sm text-gray-500">{form.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    form.status === 'completed' ? 'bg-green-100 text-green-700' :
                    form.status === 'incomplete' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {form.status === 'completed' ? 'Completed' : form.status === 'incomplete' ? 'In Progress' : 'Not Started'}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-primary-50 border-primary-200">
          <p className="text-sm text-navy-600">
            💡 <strong>Tip:</strong> Complete all forms before your first appointment to save time. You can save your progress and return later.
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
