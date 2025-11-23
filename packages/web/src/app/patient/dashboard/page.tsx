'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Grid } from '@/components/layout/Grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VitalCard } from '@/components/widgets/VitalCard';
import { AppointmentCard } from '@/components/widgets/AppointmentCard';
import { useVitals } from '@/hooks/useVitals';
import { useMetrics } from '@/hooks/useMetrics';
import { fetchAPI } from '@/lib/utils';
import { formatRelativeTime } from '@/utils/date';
import { calculateBMI, getBMICategory } from '@/utils/bmi';
import { Activity, Heart, Droplet, TrendingUp, Calendar, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface DashboardData {
  upcomingAppointments?: any[];
  recentMessages?: any[];
  carePlanProgress?: number;
}

export default function PatientDashboardPage() {
  const { vitals, loading: vitalsLoading } = useVitals();
  const { metrics } = useMetrics();
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [appointments, messages] = await Promise.all([
        fetchAPI('/patients/me/appointments?upcoming=true').catch(() => []),
        fetchAPI('/patients/me/messages?limit=3').catch(() => []),
      ]);
      setDashboardData({
        upcomingAppointments: appointments || [],
        recentMessages: messages || [],
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || vitalsLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Loading...
          </div>
        </div>
      </PageContainer>
    );
  }

  const bmi = vitals?.bmi || (vitals?.weight && vitals?.heightCm ? calculateBMI(vitals.weight, vitals.heightCm) : null);
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h1 mb-2">Dashboard</h1>
          <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Your health overview
          </p>
        </div>

        {/* Vitals Grid */}
        <Grid cols={4} gap="md" responsive>
          {vitals?.heartRate && (
            <VitalCard
              label="Heart Rate"
              value={vitals.heartRate}
              unit="bpm"
              status="normal"
              lastUpdated={formatRelativeTime(new Date())}
            />
          )}
          {vitals?.systolicBP && vitals?.diastolicBP && (
            <VitalCard
              label="Blood Pressure"
              value={`${vitals.systolicBP}/${vitals.diastolicBP}`}
              unit="mmHg"
              status="normal"
              lastUpdated={formatRelativeTime(new Date())}
            />
          )}
          {bmi && (
            <VitalCard
              label="BMI"
              value={bmi}
              unit=""
              status={bmiCategory?.status === 'normal' ? 'normal' : bmiCategory?.status === 'obese' ? 'high' : 'warning'}
              lastUpdated={formatRelativeTime(new Date())}
            />
          )}
          {vitals?.hrv && (
            <VitalCard
              label="HRV"
              value={vitals.hrv}
              unit="ms"
              status="normal"
              trend="stable"
              lastUpdated={formatRelativeTime(new Date())}
            />
          )}
        </Grid>

        {/* Main Content Grid */}
        <Grid cols={2} gap="lg" responsive>
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingAppointments.slice(0, 3).map((appt: any) => (
                    <AppointmentCard
                      key={appt.id}
                      date={new Date(appt.startTime).toLocaleDateString()}
                      time={new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      provider={appt.provider?.name || 'Provider'}
                      type={appt.visitMode === 'VIRTUAL' ? 'virtual' : 'in_person'}
                      status="scheduled"
                      reason={appt.reason}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                  No upcoming appointments
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentMessages && dashboardData.recentMessages.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentMessages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className="p-3 border-radius"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                          {msg.from?.name || 'Care Team'}
                        </span>
                        <span className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                        {msg.content?.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                  No recent messages
                </p>
              )}
            </CardContent>
          </Card>
        </Grid>
      </div>
    </PageContainer>
  );
}
