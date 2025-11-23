'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Video, Share2, Monitor, Send, Clock, CheckCircle, Plus, FileText } from 'lucide-react';
import { getVisitById, getPatientById } from '@/lib/clinician-demo-data';

export default function VisitWorkspacePage({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = use(params);
  const [visitTime, setVisitTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setVisitTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const visit = getVisitById(visitId);
  const patient = visit ? getPatientById(visit.patientId) : null;

  if (!visit || !patient) {
    return <div className="text-center py-12" style={{ color: 'var(--color-textPrimary)' }}>Visit not found</div>;
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getRiskBadgeColor = (risk: string): React.CSSProperties => {
    switch (risk) {
      case 'high':
        return { backgroundColor: 'var(--color-danger)', color: '#FFFFFF' };
      case 'moderate':
        return { backgroundColor: 'var(--color-warning)', color: '#FFFFFF' };
      default:
        return { backgroundColor: 'var(--color-success)', color: '#FFFFFF' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient Info (30%) */}
        <div className="lg:col-span-3 space-y-4">
          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primaryLight)' }}>
                  <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{patient.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-body" style={{ color: 'var(--color-textPrimary)' }}>{patient.name}</p>
                  <p className="text-small" style={{ color: 'var(--color-textSecondary)' }}>
                    {patient.age} {patient.sex} • {patient.primaryDx}
                  </p>
                </div>
              </div>
              <Badge style={getRiskBadgeColor(patient.riskLevel)}>{patient.riskLevel}</Badge>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardHeader>
              <CardTitle className="text-small" style={{ color: 'var(--color-textPrimary)' }}>Key Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-small">
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-textSecondary)' }}>HR</span>
                <span style={{ color: 'var(--color-textPrimary)' }}>{patient.latestVitals.heartRate} bpm</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-textSecondary)' }}>BP</span>
                <span style={{ color: 'var(--color-textPrimary)' }}>
                  {patient.latestVitals.systolic}/{patient.latestVitals.diastolic}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-textSecondary)' }}>HRV</span>
                <span style={{ color: 'var(--color-textPrimary)' }}>{patient.latestVitals.hrvMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-textSecondary)' }}>BMI</span>
                <span style={{ color: 'var(--color-textPrimary)' }}>{patient.latestVitals.bmi.toFixed(1)}</span>
              </div>
              <p className="text-caption mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                Updated {new Date(patient.latestVitals.timestamp).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardHeader>
              <CardTitle className="text-small" style={{ color: 'var(--color-textPrimary)' }}>Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-small space-y-1" style={{ color: 'var(--color-textPrimary)' }}>
                <li>• Lisinopril 10mg daily</li>
                <li>• Metformin 500mg BID</li>
              </ul>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardHeader>
              <CardTitle className="text-small" style={{ color: 'var(--color-textPrimary)' }}>Allergies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-small" style={{ color: 'var(--color-textSecondary)' }}>None known</p>
            </CardContent>
          </Card>
        </div>

        {/* Center: Video Area (50%) */}
        <div className="lg:col-span-6 space-y-4">
          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardContent className="p-8">
              <div className="aspect-video rounded-lg flex items-center justify-center border-2 border-dashed" style={{ 
                backgroundColor: 'var(--color-background)', 
                borderColor: 'var(--color-textSecondary)',
                borderRadius: 'var(--radius)',
              }}>
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-textSecondary)' }} />
                  <p style={{ color: 'var(--color-textSecondary)' }}>Video visit</p>
                  <p className="text-small" style={{ color: 'var(--color-textSecondary)' }}>(to be connected to telehealth provider)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button variant="primary">
                  <Video className="w-4 h-4 mr-2" />
                  Start Video
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Labs
                </Button>
                <Button variant="outline">
                  <Monitor className="w-4 h-4 mr-2" />
                  Share Screen
                </Button>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Send Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Notes & Orders (20%) */}
        <div className="lg:col-span-3 space-y-4">
          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <Tabs defaultValue="notes">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="notes" className="space-y-3">
                <Textarea
                  placeholder="SOAP note..."
                  className="min-h-[200px]"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                  }}
                />
                <div className="flex gap-2 flex-wrap">
                  {['HPI', 'Assessment', 'Plan'].map((template) => (
                    <Button key={template} variant="outline" size="sm">
                      {template}
                    </Button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="orders" className="space-y-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-small" style={{ color: 'var(--color-textPrimary)' }}>
                    <input type="checkbox" className="rounded" style={{ borderRadius: 'var(--radius)' }} />
                    Order labs
                  </label>
                  <label className="flex items-center gap-2 text-small" style={{ color: 'var(--color-textPrimary)' }}>
                    <input type="checkbox" className="rounded" style={{ borderRadius: 'var(--radius)' }} />
                    Adjust meds
                  </label>
                  <label className="flex items-center gap-2 text-small" style={{ color: 'var(--color-textPrimary)' }}>
                    <input type="checkbox" className="rounded" style={{ borderRadius: 'var(--radius)' }} />
                    Add follow-up task
                  </label>
                </div>
              </TabsContent>
              <TabsContent value="chat" className="space-y-3">
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {[
                    { sender: 'patient', text: 'Hello doctor' },
                    { sender: 'clinician', text: 'Hi, how are you feeling today?' },
                    { sender: 'patient', text: 'Much better, thank you' },
                  ].map((msg, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg text-small"
                      style={{
                        backgroundColor: msg.sender === 'clinician' ? 'var(--color-primaryLight)' : 'var(--color-background)',
                        color: 'var(--color-textPrimary)',
                        borderRadius: 'var(--radius)',
                        marginLeft: msg.sender === 'clinician' ? 'auto' : '0',
                        textAlign: msg.sender === 'clinician' ? 'right' : 'left',
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea placeholder="Type a message..." className="flex-1" />
                  <Button size="sm" variant="primary">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 border-t p-4 rounded-lg" style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius)',
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--color-textSecondary)' }} />
              <span className="font-mono" style={{ color: 'var(--color-textPrimary)' }}>{formatTime(visitTime)}</span>
            </div>
            <Badge style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}>{visit.status}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">End Visit</Button>
            <Button variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Completed
            </Button>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
            <Link href={`/clinician/patients/${patient.id}`}>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Open Chart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
