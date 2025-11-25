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
    return <div className="text-center py-12 text-slate-900">Visit not found</div>;
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const riskBadgeClasses: Record<string, string> = {
    high: 'bg-red-500 text-white',
    moderate: 'bg-amber-500 text-white',
    low: 'bg-emerald-500 text-white',
  };

  return (
    <div className="space-y-6">
      {/* Patient Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient Info (30%) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-50">
                  <span className="font-medium text-teal-600">{patient.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-body text-slate-900">{patient.name}</p>
                  <p className="text-small text-slate-600">
                    {patient.age} {patient.sex} • {patient.primaryDx}
                  </p>
                </div>
              </div>
              <Badge className={riskBadgeClasses[patient.riskLevel] ?? riskBadgeClasses.low}>
                {patient.riskLevel}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-small text-slate-900">Key Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-small">
              <div className="flex justify-between">
                <span className="text-slate-600">HR</span>
                <span className="text-slate-900">{patient.latestVitals.heartRate} bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">BP</span>
                <span className="text-slate-900">
                  {patient.latestVitals.systolic}/{patient.latestVitals.diastolic}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">HRV</span>
                <span className="text-slate-900">{patient.latestVitals.hrvMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">BMI</span>
                <span className="text-slate-900">{patient.latestVitals.bmi.toFixed(1)}</span>
              </div>
              <p className="text-caption mt-2 text-slate-600">
                Updated {new Date(patient.latestVitals.timestamp).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-small text-slate-900">Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-small space-y-1 text-slate-900">
                <li>• Lisinopril 10mg daily</li>
                <li>• Metformin 500mg BID</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-small text-slate-900">Allergies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-small text-slate-600">None known</p>
            </CardContent>
          </Card>
        </div>

        {/* Center: Video Area (50%) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="bg-white">
            <CardContent className="p-8">
              <div className="aspect-video rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50">
                <div className="text-center text-slate-600">
                  <Video className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <p>Video visit</p>
                  <p className="text-small">(to be connected to telehealth provider)</p>
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
          <Card className="bg-white">
            <Tabs defaultValue="notes">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="notes" className="space-y-3">
                <Textarea
                  placeholder="SOAP note..."
                  className="min-h-[200px] bg-white border-slate-200"
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
                <div className="space-y-2 text-slate-900 text-small">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-slate-300" />
                    Order labs
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-slate-300" />
                    Adjust meds
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-slate-300" />
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
                  ].map((msg, idx) => {
                    const alignment = msg.sender === 'clinician' ? 'text-right ml-auto bg-teal-50' : 'text-left bg-slate-50';
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-small ${alignment}`}
                      >
                        {msg.text}
                      </div>
                    );
                  })}
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
      <div className="sticky bottom-0 border-t p-4 rounded-2xl bg-white border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="font-mono text-slate-900">{formatTime(visitTime)}</span>
            </div>
            <Badge className="bg-teal-600 text-white">{visit.status}</Badge>
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
            <Link href={`/clinician/chart/${patient.id}`}>
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
