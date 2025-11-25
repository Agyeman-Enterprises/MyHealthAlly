'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { Grid } from '@/components/layout/Grid';
import Link from 'next/link';
import {
  Users,
  AlertTriangle,
  FlaskConical,
  CheckSquare,
  Video,
  MapPin,
  Clock,
  ArrowRight,
  Mic,
} from 'lucide-react';
import { getTriageTasks } from '@/services/triage/tasks';
import { getVoiceAudioUsage, type VoiceUsageSummary } from '@/services/clinician/voice-messages';
import {
  getTodayVisits,
  getHighRiskPatients,
  getRecentMessages,
  getUnreviewedLabsCount,
} from '@/services/clinician/dashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function ClinicianDashboardPage() {
  const { user } = useAuth();
  const [triageCount, setTriageCount] = useState(0);
  const [voiceUsage, setVoiceUsage] = useState<VoiceUsageSummary | null>(null);
  const [voiceUsageLoading, setVoiceUsageLoading] = useState(true);
  const [todayVisits, setTodayVisits] = useState<any[]>([]);
  const [highRiskPatients, setHighRiskPatients] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreviewedLabs, setUnreviewedLabs] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTriageCount(),
        loadVoiceUsage(),
        loadTodayVisits(),
        loadHighRiskPatients(),
        loadMessages(),
        loadUnreviewedLabs(),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTriageCount = async () => {
    try {
      const tasks = await getTriageTasks({ status: 'OPEN' });
      setTriageCount(tasks.length);
    } catch (error) {
      console.error('Failed to load triage count:', error);
    }
  };

  const loadVoiceUsage = async () => {
    try {
      const summary = await getVoiceAudioUsage();
      setVoiceUsage(summary);
    } catch (error) {
      console.error('Failed to load voice usage summary:', error);
    } finally {
      setVoiceUsageLoading(false);
    }
  };

  const loadTodayVisits = async () => {
    try {
      // TODO: Get providerId from user context
      const visits = await getTodayVisits();
      setTodayVisits(visits);
    } catch (error) {
      console.error('Failed to load today visits:', error);
    }
  };

  const loadHighRiskPatients = async () => {
    try {
      const patients = await getHighRiskPatients();
      setHighRiskPatients(patients);
    } catch (error) {
      console.error('Failed to load high-risk patients:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const recentMessages = await getRecentMessages();
      setMessages(recentMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadUnreviewedLabs = async () => {
    try {
      const count = await getUnreviewedLabsCount();
      setUnreviewedLabs(count);
    } catch (error) {
      console.error('Failed to load unreviewed labs count:', error);
    }
  };

  const kpis = [
    {
      label: 'Patients Today',
      value: todayVisits.length,
      trend: '+2 from yesterday',
      icon: Users,
    },
    {
      label: 'High-Risk Patients',
      value: highRiskPatients.length,
      trend: 'Requires attention',
      icon: AlertTriangle,
    },
    {
      label: 'Unreviewed Labs',
      value: unreviewedLabs,
      trend: unreviewedLabs > 0 ? 'New results' : 'All reviewed',
      icon: FlaskConical,
    },
    {
      label: 'Triage Items',
      value: triageCount,
      trend: triageCount > 0 ? 'For review' : 'All clear',
      icon: AlertTriangle,
    },
  ];

  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        <div>
          <h1 className="text-h1 mb-2">Dashboard</h1>
          <p className="text-body text-slate-600">
            Overview of your practice today
          </p>
        </div>

        {/* KPI Row */}
        <Grid cols={6} gap="md" responsive>
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-caption mb-1 text-slate-600">
                        {kpi.label}
                      </p>
                      <p className="text-h1 text-slate-900">
                        {kpi.value}
                      </p>
                      <p className="text-caption mt-1 text-slate-600">
                        {kpi.trend}
                      </p>
                    </div>
                    <Icon className="w-8 h-8 text-teal-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </Grid>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice Recording Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {voiceUsageLoading || !voiceUsage ? (
              <p className="text-sm col-span-4 text-slate-600">
                Loading audio retention metrics…
              </p>
            ) : (
              <>
                <div>
                  <p className="text-caption text-slate-600">
                    Total recordings
                  </p>
                  <p className="text-h3 text-slate-900">
                    {voiceUsage.totalVoiceMessages}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-slate-600">
                    Available audio
                  </p>
                  <p className="text-h3 text-slate-900">
                    {voiceUsage.availableRecordings}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-slate-600">
                    Expired audio
                  </p>
                  <p className="text-h3 text-slate-900">
                    {voiceUsage.expiredRecordings}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-slate-600">
                    Total downloads
                  </p>
                  <p className="text-h3 text-slate-900">
                    {voiceUsage.totalDownloads}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <Grid cols={2} gap="lg" responsive>
          {/* Left Column */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {todayVisits.length > 0 ? (
                  <div className="space-y-3">
                    {todayVisits.map((visit: any) => (
                      <div
                        key={visit.id}
                        className="p-4 rounded-2xl bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {visit.visitType === 'virtual' ? (
                              <Video className="w-5 h-5 text-teal-600" />
                            ) : (
                              <MapPin className="w-5 h-5 text-slate-500" />
                            )}
                            <div>
                              <p className="text-body font-medium text-slate-900">
                                {visit.patientName}
                              </p>
                              <p className="text-caption text-slate-600">
                                {visit.reason}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span className="text-caption text-slate-600">
                                  {new Date(visit.startTime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <Badge
                                  className={
                                    visit.status === 'in_progress'
                                      ? 'bg-teal-600 text-white'
                                      : visit.status === 'scheduled'
                                      ? 'bg-slate-100 text-slate-900'
                                      : 'bg-emerald-500 text-white'
                                  }
                                >
                                  {visit.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {visit.status !== 'completed' && (
                            <Link href={`/clinician/visit/${visit.id}`}>
                              <Button size="sm">Start Visit</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body text-center py-4 text-slate-600">
                    No visits scheduled for today
                  </p>
                )}
              </CardContent>
            </Card>

            {/* High-Risk Patients */}
            <Card>
              <CardHeader>
                <CardTitle>High-Risk Patients</CardTitle>
              </CardHeader>
              <CardContent>
                {highRiskPatients.length > 0 ? (
                  <div className="space-y-3">
                    {highRiskPatients.map((patient: any) => (
                      <div
                        key={patient.id}
                        className="p-4 rounded-2xl bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-body font-medium text-slate-900">
                                {patient.name}
                              </p>
                              <Badge
                                className={
                                  patient.riskLevel === 'high'
                                    ? 'bg-red-500 text-white'
                                    : patient.riskLevel === 'moderate'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-emerald-500 text-white'
                                }
                              >
                                {patient.riskLevel}
                              </Badge>
                            </div>
                            <p className="text-caption mb-1 text-slate-600">
                              {patient.primaryDx}
                            </p>
                            <div className="flex items-center gap-4 text-caption text-slate-600">
                              <span>HRV: {patient.latestVitals.hrvMs}ms</span>
                              <span>
                                Last visit:{' '}
                                {new Date(patient.lastVisit).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                          <Link href={`/clinician/chart/${patient.id}`}>
                            <Button variant="outline" size="sm">
                              Open Chart
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body text-center py-4 text-slate-600">
                    No high-risk patients
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.map((message: any) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-3 p-3 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-50"
                      >
                        <span className="text-body font-medium text-teal-600">
                          {message.patientName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-body font-medium text-slate-900">
                            {message.patientName}
                          </p>
                          {message.unreadCount > 0 && (
                            <Badge className="bg-teal-600 text-white">
                              {message.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-caption truncate text-slate-600">
                          {message.lastMessageSnippet}
                        </p>
                        <p className="text-caption mt-1 text-slate-600">
                          {new Date(message.lastMessageTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/clinician/messages" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Open inbox <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </div>
    </PageContainer>
  );
}
