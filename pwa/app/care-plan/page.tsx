'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

const goals = [
  { id: '1', name: 'Lower A1C to under 7%', target: '< 7%', current: '6.8%', progress: 85, status: 'on-track' },
  { id: '2', name: 'Reduce blood pressure', target: '< 130/80', current: '128/82', progress: 70, status: 'on-track' },
  { id: '3', name: 'Lose 10 lbs', target: '155 lbs', current: '162 lbs', progress: 30, status: 'in-progress' },
  { id: '4', name: 'Exercise 150 min/week', target: '150 min', current: '90 min', progress: 60, status: 'needs-attention' },
];

const activities = [
  { id: '1', name: 'Take Metformin as prescribed', frequency: 'Twice daily', streak: 14, completed: true },
  { id: '2', name: '30-minute walk', frequency: 'Daily', streak: 5, completed: false },
  { id: '3', name: 'Check fasting glucose', frequency: 'Every morning', streak: 21, completed: true },
  { id: '4', name: 'Log meals in food diary', frequency: 'After each meal', streak: 7, completed: true },
  { id: '5', name: 'Take statin medication', frequency: 'Once daily at bedtime', streak: 10, completed: false },
];

export default function CarePlanPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [tab, setTab] = useState<'overview' | 'goals' | 'activities'>('overview');
  const [checkedActivities, setCheckedActivities] = useState<string[]>(activities.filter(a => a.completed).map(a => a.id));

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const toggleActivity = (id: string) => {
    setCheckedActivities(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Care Plan</h1>
          <p className="text-gray-600">Track your health goals and activities</p>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-primary-100 to-sky-100 border-primary-200">
          <p className="text-xs text-primary-700 uppercase tracking-wide mb-1">ACTIVE PLAN</p>
          <h2 className="text-lg font-bold text-navy-600">Diabetes Management Plan</h2>
          <p className="text-gray-600 text-sm">Comprehensive plan to manage Type 2 Diabetes through medication, diet, and exercise.</p>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div><p className="text-2xl font-bold text-primary-600">{goals.filter(g => g.progress >= 70).length}/{goals.length}</p><p className="text-xs text-gray-500">Goals achieved</p></div>
            <div><p className="text-2xl font-bold text-primary-600">{checkedActivities.length}/{activities.length}</p><p className="text-xs text-gray-500">Done today</p></div>
            <div><p className="text-2xl font-bold text-primary-600">Feb 1</p><p className="text-xs text-gray-500">Next review</p></div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'goals', 'activities'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl font-medium transition-all ${tab === t ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-navy-600 mb-3">Goals Progress</h3>
              {goals.slice(0, 2).map((g) => (
                <div key={g.id} className="mb-3">
                  <div className="flex justify-between text-sm mb-1"><span>{g.name}</span><span className="font-medium">{g.progress}%</span></div>
                  <div className="h-2 bg-gray-200 rounded-full"><div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" style={{ width: `${g.progress}%` }} /></div>
                </div>
              ))}
            </Card>
            <Card>
              <h3 className="font-semibold text-navy-600 mb-3">Today's Activities</h3>
              {activities.slice(0, 3).map((a) => (
                <label key={a.id} className="flex items-center gap-3 py-2 cursor-pointer">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checkedActivities.includes(a.id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                    {checkedActivities.includes(a.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={checkedActivities.includes(a.id) ? 'line-through text-gray-400' : 'text-gray-700'}>{a.name}</span>
                </label>
              ))}
            </Card>
          </div>
        )}

        {tab === 'goals' && (
          <div className="space-y-3">
            {goals.map((g) => (
              <Card key={g.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-navy-600">{g.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${g.status === 'on-track' ? 'bg-green-100 text-green-700' : g.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {g.status === 'on-track' ? '✓ On Track' : g.status === 'in-progress' ? '● In Progress' : '⚠ Needs Attention'}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-2"><span>Current: {g.current}</span><span>Target: {g.target}</span></div>
                <div className="h-3 bg-gray-200 rounded-full"><div className="h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all" style={{ width: `${g.progress}%` }} /></div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'activities' && (
          <div className="space-y-3">
            {activities.map((a) => (
              <Card key={a.id} className={`cursor-pointer transition-all ${checkedActivities.includes(a.id) ? 'bg-primary-50 border-primary-200' : ''}`} onClick={() => toggleActivity(a.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${checkedActivities.includes(a.id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                      {checkedActivities.includes(a.id) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div>
                      <h3 className={`font-medium ${checkedActivities.includes(a.id) ? 'line-through text-gray-400' : 'text-navy-600'}`}>{a.name}</h3>
                      <p className="text-sm text-gray-500">{a.frequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-500">🔥 {a.streak}</span>
                    <p className="text-xs text-gray-500">day streak</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
