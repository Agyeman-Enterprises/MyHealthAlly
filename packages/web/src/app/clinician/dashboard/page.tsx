'use client';

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
} from 'lucide-react';
import {
  getVisitsToday,
  getHighRiskPatients,
  getTasks,
  getMessages,
} from '@/lib/clinician-demo-data';
import type { VisitSummary, PatientSummary, ClinicianTask, MessageSummary } from '@/lib/clinician-demo-data';

export default function ClinicianDashboardPage() {
  const todayVisits = getVisitsToday();
  const highRiskPatients = getHighRiskPatients();
  const tasks = getTasks({ status: 'open' });
  const messages = getMessages();

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
      value: 3,
      trend: 'New results',
      icon: FlaskConical,
    },
    {
      label: 'Open Tasks',
      value: tasks.length,
      trend: '2 overdue',
      icon: CheckSquare,
    },
  ];

  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        <div>
          <h1 className="text-h1 mb-2">Dashboard</h1>
          <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Overview of your practice today
          </p>
        </div>

        {/* KPI Row */}
        <Grid cols={4} gap="md" responsive>
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-caption mb-1" style={{ color: 'var(--color-textSecondary)' }}>
                        {kpi.label}
                      </p>
                      <p className="text-h1" style={{ color: 'var(--color-textPrimary)' }}>
                        {kpi.value}
                      </p>
                      <p className="text-caption mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                        {kpi.trend}
                      </p>
                    </div>
                    <Icon className="w-8 h-8" style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </Grid>

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
                    {todayVisits.map((visit: VisitSummary) => (
                      <div
                        key={visit.id}
                        className="p-4 border-radius"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {visit.visitType === 'virtual' ? (
                              <Video className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                            ) : (
                              <MapPin className="w-5 h-5" style={{ color: 'var(--color-textSecondary)' }} />
                            )}
                            <div>
                              <p className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                                {visit.patientName}
                              </p>
                              <p className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                                {visit.reason}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3" style={{ color: 'var(--color-textSecondary)' }} />
                                <span className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                                  {new Date(visit.startTime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <Badge
                                  style={{
                                    backgroundColor:
                                      visit.status === 'in_progress'
                                        ? 'var(--color-primary)'
                                        : visit.status === 'scheduled'
                                        ? 'var(--color-background)'
                                        : 'var(--color-success)',
                                    color:
                                      visit.status === 'scheduled'
                                        ? 'var(--color-textPrimary)'
                                        : '#FFFFFF',
                                  }}
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
                  <p className="text-body text-center py-4" style={{ color: 'var(--color-textSecondary)' }}>
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
                    {highRiskPatients.map((patient: PatientSummary) => (
                      <div
                        key={patient.id}
                        className="p-4 border-radius"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                                {patient.name}
                              </p>
                              <Badge
                                style={{
                                  backgroundColor:
                                    patient.riskLevel === 'high'
                                      ? 'var(--color-danger)'
                                      : patient.riskLevel === 'moderate'
                                      ? 'var(--color-warning)'
                                      : 'var(--color-success)',
                                  color: '#FFFFFF',
                                }}
                              >
                                {patient.riskLevel}
                              </Badge>
                            </div>
                            <p className="text-caption mb-1" style={{ color: 'var(--color-textSecondary)' }}>
                              {patient.primaryDx}
                            </p>
                            <div className="flex items-center gap-4 text-caption" style={{ color: 'var(--color-textSecondary)' }}>
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
                          <Link href={`/clinician/patients/${patient.id}`}>
                            <Button variant="outline" size="sm">
                              Open Chart
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body text-center py-4" style={{ color: 'var(--color-textSecondary)' }}>
                    No high-risk patients
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task: ClinicianTask) => (
                    <div
                      key={task.id}
                      className="p-3 border-radius"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                            {task.title}
                          </p>
                          {task.patientName && (
                            <p className="text-caption mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                              {task.patientName}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {task.dueDate && (
                              <span className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                                Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                            <Badge
                              style={{
                                backgroundColor:
                                  task.priority === 'high'
                                    ? 'var(--color-danger)'
                                    : task.priority === 'medium'
                                    ? 'var(--color-warning)'
                                    : 'var(--color-textSecondary)',
                                color: '#FFFFFF',
                              }}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/clinician/tasks" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    View all tasks <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.map((message: MessageSummary) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-3 p-3 border-radius cursor-pointer hover:bg-background transition-colors"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-primary)' + '20' }}
                      >
                        <span className="text-body font-medium" style={{ color: 'var(--color-primary)' }}>
                          {message.patientName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                            {message.patientName}
                          </p>
                          {message.unreadCount > 0 && (
                            <Badge style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}>
                              {message.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-caption truncate" style={{ color: 'var(--color-textSecondary)' }}>
                          {message.lastMessageSnippet}
                        </p>
                        <p className="text-caption mt-1" style={{ color: 'var(--color-textSecondary)' }}>
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
