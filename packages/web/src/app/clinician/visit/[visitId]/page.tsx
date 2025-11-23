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
    return <div className="text-center py-12">Visit not found</div>;
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Patient Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient Info (30%) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-clinician-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-clinician-primary-soft flex items-center justify-center">
                  <span className="text-clinician-primary font-medium">{patient.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-clinician-text">{patient.name}</p>
                  <p className="text-sm text-clinician-textMuted">
                    {patient.age} {patient.sex} • {patient.primaryDx}
                  </p>
                </div>
              </div>
              <Badge className="bg-clinician-danger text-white">{patient.riskLevel}</Badge>
            </CardContent>
          </Card>

          <Card className="bg-clinician-surface">
            <CardHeader>
              <CardTitle className="text-sm text-clinician-text">Key Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-clinician-textMuted">HR</span>
                <span className="text-clinician-text">{patient.latestVitals.heartRate} bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinician-textMuted">BP</span>
                <span className="text-clinician-text">
                  {patient.latestVitals.systolic}/{patient.latestVitals.diastolic}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinician-textMuted">HRV</span>
                <span className="text-clinician-text">{patient.latestVitals.hrvMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinician-textMuted">BMI</span>
                <span className="text-clinician-text">{patient.latestVitals.bmi.toFixed(1)}</span>
              </div>
              <p className="text-xs text-clinician-textMuted mt-2">
                Updated {new Date(patient.latestVitals.timestamp).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-clinician-surface">
            <CardHeader>
              <CardTitle className="text-sm text-clinician-text">Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-clinician-text space-y-1">
                <li>• Lisinopril 10mg daily</li>
                <li>• Metformin 500mg BID</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-clinician-surface">
            <CardHeader>
              <CardTitle className="text-sm text-clinician-text">Allergies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-clinician-textMuted">None known</p>
            </CardContent>
          </Card>
        </div>

        {/* Center: Video Area (50%) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="bg-clinician-surface">
            <CardContent className="p-8">
              <div className="aspect-video bg-clinician-panel rounded-lg flex items-center justify-center border-2 border-dashed border-clinician-textMuted">
                <div className="text-center">
                  <Video className="w-16 h-16 text-clinician-textMuted mx-auto mb-4" />
                  <p className="text-clinician-textMuted">Video visit</p>
                  <p className="text-sm text-clinician-textMuted">(to be connected to telehealth provider)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button className="bg-clinician-primary hover:bg-clinician-primary-soft">
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
          <Card className="bg-clinician-surface">
            <Tabs defaultValue="notes">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="notes" className="space-y-3">
                <Textarea
                  placeholder="SOAP note..."
                  className="min-h-[200px] bg-clinician-panel border-clinician-panel"
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
                  <label className="flex items-center gap-2 text-sm text-clinician-text">
                    <input type="checkbox" className="rounded" />
                    Order labs
                  </label>
                  <label className="flex items-center gap-2 text-sm text-clinician-text">
                    <input type="checkbox" className="rounded" />
                    Adjust meds
                  </label>
                  <label className="flex items-center gap-2 text-sm text-clinician-text">
                    <input type="checkbox" className="rounded" />
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
                      className={`p-2 rounded-lg text-sm ${
                        msg.sender === 'clinician'
                          ? 'bg-clinician-primary-soft text-clinician-text ml-auto text-right'
                          : 'bg-clinician-panel text-clinician-text'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea placeholder="Type a message..." className="flex-1" />
                  <Button size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 bg-clinician-surface border-t border-clinician-panel p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-clinician-textMuted" />
              <span className="text-clinician-text font-mono">{formatTime(visitTime)}</span>
            </div>
            <Badge className="bg-clinician-primary text-white">{visit.status}</Badge>
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

