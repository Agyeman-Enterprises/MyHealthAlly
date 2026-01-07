/**
 * Follow-up Reminders Page
 * 
 * View and manage follow-up reminders from hospital visits
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { format } from 'date-fns';

interface FollowUpReminder {
  id: string;
  reminder_type: string;
  reminder_date: string;
  reminder_message?: string;
  sent: boolean;
  sent_at?: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  hospital_admissions: {
    id: string;
    hospital_name: string;
    admission_date: string;
    discharge_date?: string;
  };
}

export default function FollowUpRemindersPage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();
  const [upcoming, setUpcoming] = useState<FollowUpReminder[]>([]);
  const [past, setPast] = useState<FollowUpReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReminders = async () => {
      if (isLoading) return;

      try {
        const { patientId } = await getCurrentUserAndPatient();
        if (!patientId) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/hospital/follow-up-reminders?patientId=${patientId}`);
        if (!response.ok) throw new Error('Failed to load reminders');

        const data = await response.json();
        setUpcoming(data.upcoming || []);
        setPast(data.past || []);
      } catch (err) {
        console.error('Error loading reminders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reminders');
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, [isLoading]);

  const handleAcknowledge = async (reminderId: string) => {
    try {
      const response = await fetch('/api/hospital/follow-up-reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminderId,
          updates: {
            acknowledged: true,
            acknowledged_at: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to acknowledge reminder');

      // Reload reminders
      const { patientId } = await getCurrentUserAndPatient();
      const remindersResponse = await fetch(`/api/hospital/follow-up-reminders?patientId=${patientId}`);
      const data = await remindersResponse.json();
      setUpcoming(data.upcoming || []);
      setPast(data.past || []);
    } catch (err) {
      console.error('Error acknowledging reminder:', err);
      setError(err instanceof Error ? err.message : 'Failed to acknowledge reminder');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Follow-up Reminders" showBack />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Follow-up Reminders</h1>
          <p className="text-gray-600 mt-1">Reminders for post-discharge care and appointments</p>
        </div>

        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </Card>
        )}

        {/* Upcoming Reminders */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-navy-600 mb-4">Upcoming</h2>
            <div className="space-y-4">
              {upcoming.map((reminder) => (
                <Card key={reminder.id} className="p-6 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-navy-600">
                          {reminder.hospital_admissions.hospital_name}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {reminder.reminder_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {reminder.reminder_message || 'Follow-up appointment recommended'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Due: {format(new Date(reminder.reminder_date), 'MMM d, yyyy')}
                        </span>
                        {reminder.hospital_admissions.discharge_date && (
                          <span>
                            Discharged: {format(new Date(reminder.hospital_admissions.discharge_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/hospital-visits`)}
                      >
                        View Visit
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcknowledge(reminder.id)}
                        disabled={reminder.acknowledged}
                      >
                        {reminder.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Reminders */}
        {past.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-navy-600 mb-4">Past Reminders</h2>
            <div className="space-y-4">
              {past.map((reminder) => (
                <Card key={reminder.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-navy-600">
                          {reminder.hospital_admissions.hospital_name}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {reminder.reminder_type.replace('_', ' ')}
                        </span>
                        {reminder.acknowledged && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {reminder.reminder_message || 'Follow-up appointment recommended'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Due: {format(new Date(reminder.reminder_date), 'MMM d, yyyy')}
                        </span>
                        {reminder.sent_at && (
                          <span>
                            Sent: {format(new Date(reminder.sent_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {upcoming.length === 0 && past.length === 0 && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No reminders</h3>
            <p className="text-gray-600 mb-6">You have no follow-up reminders at this time.</p>
            <Button variant="outline" onClick={() => router.push('/hospital-visits')}>
              View Visit History
            </Button>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
