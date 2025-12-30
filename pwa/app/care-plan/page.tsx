'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase/client';
import { getPatientCarePlans } from '@/lib/supabase/queries-careplans';

type Tab = 'overview' | 'goals' | 'activities';

type Activity = {
  id: string;
  name: string;
  frequency: string;
  completed: boolean;
};

type Goal = {
  id: string;
  name: string;
  target: string;
};

type CarePlanItem = {
  id: string;
  title: string;
  description?: string | null;
  frequency?: string | null;
};

type CarePlanSection = {
  type: string;
  care_plan_items?: CarePlanItem[];
};

type CarePlan = {
  title?: string | null;
  description?: string | null;
  review_date?: string | null;
  care_plan_sections?: CarePlanSection[];
} | null;

export default function CarePlanPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [carePlan, setCarePlan] = useState<CarePlan>(null);
  const [progressMap, setProgressMap] = useState<Record<string, string>>({}); // itemId -> progressId for today

  const setTransientSuccess = (msg: string | null) => {
    setSuccess(msg);
    if (msg) setTimeout(() => setSuccess(null), 2500);
  };

  const loadPatientId = useCallback(async () => {
    const store = useAuthStore.getState();
    let pid = store.patientId || store.user?.patientId;
    if (!pid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('patients(id)')
          .eq('supabase_auth_id', user.id)
          .single();
        const arr = Array.isArray(data?.patients) ? data?.patients : data?.patients ? [data?.patients] : [];
        pid = arr[0]?.id;
      }
    }
    if (pid && store.updateUser) store.updateUser({ patientId: pid });
    return pid || null;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pid = await loadPatientId();
      if (!pid) {
        setError('No patient record. Complete intake first.');
        setLoading(false);
        return;
      }
      setPatientId(pid);
      const plans = await getPatientCarePlans(pid);
      const activePlan = plans?.[0] || null;
      setCarePlan(activePlan);

      const today = new Date().toISOString().slice(0, 10);
      const { data: progress, error: progErr } = await supabase
        .from('care_plan_progress')
        .select('id, item_id, completed_at')
        .eq('patient_id', pid)
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`);
      if (progErr) throw progErr;
      const map: Record<string, string> = {};
      (progress || []).forEach((p: { id: string; item_id: string }) => { map[p.item_id] = p.id; });
      setProgressMap(map);
    } catch (err: unknown) {
      console.error('Error loading care plan', err);
      const message = err instanceof Error ? err.message : 'Unable to load care plan.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loadPatientId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    void loadData();
  }, [isAuthenticated, loadData, router]);

  const goals: Goal[] = useMemo(() => {
    if (!carePlan?.care_plan_sections) return [];
    return carePlan.care_plan_sections
      .filter((s) => s.type === 'goals')
      .flatMap((s) => s.care_plan_items || [])
      .map((item) => ({
        id: item.id,
        name: item.title,
        target: item.description || '',
      }));
  }, [carePlan]);

  const activities: Activity[] = useMemo(() => {
    if (!carePlan?.care_plan_sections) return [];
    return carePlan.care_plan_sections
      .filter((s) => s.type === 'tasks' || s.type === 'activities')
      .flatMap((s) => s.care_plan_items || [])
      .map((item) => ({
        id: item.id,
        name: item.title,
        frequency: item.frequency || 'As directed',
        completed: Boolean(progressMap[item.id]),
      }));
  }, [carePlan, progressMap]);

  const completedActivities = activities.filter((a) => a.completed).length;

  const toggleActivity = async (itemId: string) => {
    if (!patientId) return;
    setError(null);
    try {
      const existing = progressMap[itemId];
      if (existing) {
        const { error: delErr } = await supabase.from('care_plan_progress').delete().eq('id', existing);
        if (delErr) throw delErr;
        const updatedMap = { ...progressMap };
        delete updatedMap[itemId];
        setProgressMap(updatedMap);
        setTransientSuccess('Marked incomplete.');
      } else {
        const { data, error: insErr } = await supabase
          .from('care_plan_progress')
          .insert({ item_id: itemId, patient_id: patientId, completed_at: new Date().toISOString() })
          .select('id')
          .single();
        if (insErr) throw insErr;
        setProgressMap({ ...progressMap, [itemId]: data.id });
        setTransientSuccess('Marked complete.');
      }
    } catch (err: unknown) {
      console.error('Error updating activity', err);
      const message = err instanceof Error ? err.message : 'Unable to update activity.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Care Plan</h1>
          <p className="text-gray-600">Track your health goals and activities</p>
        </div>

        {loading && <p className="text-sm text-gray-500 mb-4">Loading care plan…</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

        <Card className="mb-6 bg-gradient-to-r from-primary-100 to-sky-100 border-primary-200">
          <p className="text-xs text-primary-700 uppercase tracking-wide mb-1">ACTIVE PLAN</p>
          <h2 className="text-lg font-bold text-navy-600">{carePlan?.title || 'No active plan'}</h2>
          <p className="text-gray-600 text-sm">{carePlan?.description || 'Work with your care team to set up your plan.'}</p>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div><p className="text-2xl font-bold text-primary-600">{goals.length}</p><p className="text-xs text-gray-500">Goals</p></div>
            <div><p className="text-2xl font-bold text-primary-600">{completedActivities}/{activities.length}</p><p className="text-xs text-gray-500">Done today</p></div>
            <div><p className="text-2xl font-bold text-primary-600">{carePlan?.review_date || '—'}</p><p className="text-xs text-gray-500">Next review</p></div>
          </div>
        </Card>

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
              <h3 className="font-semibold text-navy-600 mb-3">Goals</h3>
              {goals.length === 0 && <p className="text-sm text-gray-500">No goals defined.</p>}
              {goals.slice(0, 3).map((g) => (
                <div key={g.id} className="mb-3">
                  <div className="flex justify-between text-sm mb-1"><span>{g.name}</span><span className="font-medium">{g.target}</span></div>
                  <div className="h-2 bg-gray-200 rounded-full"><div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" style={{ width: `100%` }} /></div>
                </div>
              ))}
            </Card>
            <Card>
              <h3 className="font-semibold text-navy-600 mb-3">Today&apos;s Activities</h3>
              {activities.slice(0, 3).map((a) => (
                <label key={a.id} className="flex items-center gap-3 py-2 cursor-pointer">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${a.completed ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                    {a.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={a.completed ? 'line-through text-gray-400' : 'text-gray-700'}>{a.name}</span>
                </label>
              ))}
              {activities.length === 0 && <p className="text-sm text-gray-500">No activities assigned.</p>}
            </Card>
          </div>
        )}

        {tab === 'goals' && (
          <div className="space-y-3">
            {goals.length === 0 && <p className="text-sm text-gray-500">No goals defined.</p>}
            {goals.map((g) => (
              <Card key={g.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-navy-600">{g.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Active</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-2"><span>Target: {g.target}</span></div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'activities' && (
          <div className="space-y-3">
            {activities.length === 0 && <p className="text-sm text-gray-500">No activities assigned.</p>}
            {activities.map((a) => (
              <Card key={a.id} className={`cursor-pointer transition-all ${a.completed ? 'bg-primary-50 border-primary-200' : ''}`} onClick={() => toggleActivity(a.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${a.completed ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                      {a.completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div>
                      <h3 className={`font-medium ${a.completed ? 'line-through text-gray-400' : 'text-navy-600'}`}>{a.name}</h3>
                      <p className="text-sm text-gray-500">{a.frequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-500">{a.completed ? 'Done' : 'Tap to complete'}</span>
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
