'use client';

import { useState } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Heart, Activity, TrendingUp, MessageSquare, Calendar, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const screenshots = [
  {
    id: 'daily-snapshot',
    title: 'Your health at a glance',
    subtitle: 'Daily vitals and gentle reminders in one place',
    component: 'DailySnapshot',
  },
  {
    id: 'trends',
    title: 'Understand your numbers over time',
    subtitle: 'Clear trends for blood pressure, glucose, weight, and sleep',
    component: 'Trends',
  },
  {
    id: 'care-plan',
    title: 'Follow a plan made just for you',
    subtitle: 'Your care plan, broken down into manageable steps',
    component: 'CarePlan',
  },
  {
    id: 'messaging',
    title: 'Stay connected to your care team',
    subtitle: 'Ask questions and share updates between visits',
    component: 'Messaging',
  },
  {
    id: 'alerts',
    title: 'Get support when something needs attention',
    subtitle: 'Thoughtful alerts help you and your clinic catch changes early',
    component: 'Alerts',
  },
  {
    id: 'summary',
    title: 'A calm summary of how you&apos;re doing',
    subtitle: 'MyHealthAlly turns your health data into simple, encouraging check-ins',
    component: 'Summary',
  },
];

const hrvData = [
  { date: 'Mon', value: 45 },
  { date: 'Tue', value: 48 },
  { date: 'Wed', value: 42 },
  { date: 'Thu', value: 50 },
  { date: 'Fri', value: 47 },
  { date: 'Sat', value: 49 },
  { date: 'Sun', value: 46 },
];

function DailySnapshotScreenshot() {
  return (
    <div className="w-full h-full bg-myh-bg p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-myh-text">Welcome back, Alex</h2>
        <p className="text-myh-textSoft text-sm">Your health data is updating in real time.</p>
      </div>

      <GlowCard className="p-4">
        <p className="text-xs text-myh-textSoft mb-1">Daily Wellness Score</p>
        <p className="text-3xl font-bold text-myh-primary">85%</p>
        <p className="text-xs text-myh-textSoft">Great progress today!</p>
      </GlowCard>

      <div className="grid grid-cols-2 gap-4">
        <GlowCard>
          <p className="text-xs text-myh-textSoft mb-1">Heart Rate</p>
          <p className="text-xl font-semibold text-myh-text">72</p>
          <p className="text-xs text-myh-textSoft">bpm</p>
        </GlowCard>
        <GlowCard>
          <p className="text-xs text-myh-textSoft mb-1">Blood Pressure</p>
          <p className="text-xl font-semibold text-myh-text">120/80</p>
          <p className="text-xs text-myh-textSoft">mmHg</p>
        </GlowCard>
        <GlowCard>
          <p className="text-xs text-myh-textSoft mb-1">Sleep Quality</p>
          <p className="text-xl font-semibold text-myh-text">7.5</p>
          <p className="text-xs text-myh-textSoft">hours</p>
        </GlowCard>
      </div>
    </div>
  );
}

function TrendsScreenshot() {
  return (
    <div className="w-full h-full bg-myh-bg p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-myh-text">Health trends</h2>
        <p className="text-myh-textSoft text-sm">Recovery (HRV)</p>
      </div>

      <GlowCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-myh-text font-medium">Current HRV</span>
          <span className="px-3 py-1 bg-myh-primarySoft text-myh-primary rounded-full text-sm font-medium">
            In a healthy range
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={hrvData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#4B5563" />
            <YAxis stroke="#4B5563" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2A7F79" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </GlowCard>
    </div>
  );
}

function CarePlanScreenshot() {
  return (
    <div className="w-full h-full bg-myh-bg p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-myh-text">Your 3-month plan</h2>
        <p className="text-myh-textSoft text-sm">Phase 1: Foundation & Baseline</p>
      </div>

      <GlowCard className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-myh-primary" />
          <div>
            <p className="font-medium text-myh-text">Take medication daily</p>
            <p className="text-xs text-myh-textSoft">Log adherence in the app.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-myh-primary" />
          <div>
            <p className="font-medium text-myh-text">Walk 30 minutes, 3x a week</p>
            <p className="text-xs text-myh-textSoft">Connect your fitness tracker.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-myh-primary" />
          <div>
            <p className="font-medium text-myh-text">Aim for 7-8 hours of sleep</p>
            <p className="text-xs text-myh-textSoft">Track with your wearable device.</p>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

function MessagingScreenshot() {
  const messages = [
    { id: '1', text: 'Hello Alex, how are you feeling today?', sender: 'assistant', time: '10:00 AM' },
    { id: '2', text: 'I&apos;m doing well, thank you! Just a quick question about my new medication.', sender: 'user', time: '10:05 AM' },
    { id: '3', text: 'Of course, I&apos;m here to help. What would you like to know?', sender: 'assistant', time: '10:06 AM' },
  ];

  return (
    <div className="w-full h-full bg-myh-bg p-6 space-y-4 flex flex-col">
      <GlowCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-myh-primarySoft rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-myh-primary" />
          </div>
          <div>
            <p className="font-medium text-myh-text">MyHealthAlly Assistant</p>
            <p className="text-xs text-myh-textSoft">Online</p>
          </div>
        </div>
      </GlowCard>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 ${
                msg.sender === 'user'
                  ? 'bg-myh-primary text-white'
                  : 'bg-myh-surface border border-myh-border text-myh-text'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-white/70' : 'text-myh-textSoft'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsScreenshot() {
  return (
    <div className="w-full h-full bg-myh-bg p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-myh-text">Important updates</h2>
      </div>

      <GlowCard className="p-6 space-y-4 border-l-4 border-myh-warning">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-myh-warning" />
          <h3 className="text-lg font-semibold text-myh-text">Blood Pressure Alert</h3>
        </div>
        <p className="text-myh-textSoft">
          Your blood pressure has been slightly above your target for the past few days. Let&apos;s keep an eye on it.
        </p>
        <PrimaryButton variant="outline" className="w-full">View Details</PrimaryButton>
      </GlowCard>
    </div>
  );
}

function SummaryScreenshot() {
  return (
    <div className="w-full h-full bg-myh-bg p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-myh-text">Your weekly health summary</h2>
      </div>

      <GlowCard className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-myh-primarySoft rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-myh-primary" />
          </div>
          <div>
            <p className="font-medium text-myh-text">MyHealthAlly Assistant</p>
            <p className="text-xs text-myh-textSoft">Last updated: Nov 18, 2024</p>
          </div>
        </div>
        <div className="bg-myh-surfaceSoft rounded-lg p-4 border border-myh-border">
          <p className="text-myh-text text-sm leading-relaxed">
            Your health metrics are looking stable this week. Your blood pressure and glucose levels have been consistently within your target ranges. Keep up the great work with your daily routine!
          </p>
          <p className="text-myh-text text-sm leading-relaxed mt-2 font-semibold">
            Next step: Continue monitoring your sleep patterns and aim for 7-8 hours each night.
          </p>
        </div>
      </GlowCard>
    </div>
  );
}

const componentMap: { [key: string]: () => JSX.Element } = {
  DailySnapshot: DailySnapshotScreenshot,
  Trends: TrendsScreenshot,
  CarePlan: CarePlanScreenshot,
  Messaging: MessagingScreenshot,
  Alerts: AlertsScreenshot,
  Summary: SummaryScreenshot,
};

export default function IOSScreenshotsPage() {
  const [selectedScreenshot, setSelectedScreenshot] = useState(screenshots[0]);
  const ScreenshotComponent = componentMap[selectedScreenshot.component];

  return (
    <div className="min-h-screen bg-myh-bg p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-myh-text">iOS App Store Screenshots</h1>
          <p className="text-muted-foreground mt-2">Pre-sized phone mockups for App Store submission</p>
        </div>

        {/* Screenshot Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {screenshots.map((screenshot) => (
            <button
              key={screenshot.id}
              onClick={() => setSelectedScreenshot(screenshot)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScreenshot.id === screenshot.id
                  ? 'bg-myh-primary text-white border-myh-primary'
                  : 'bg-myh-surface border-myh-border hover:border-myh-primary'
              }`}
            >
              <p className="font-medium text-sm mb-1">{screenshot.title}</p>
            </button>
          ))}
        </div>

        {/* Phone Mockup */}
        <div className="flex justify-center">
          <div className="relative">
            {/* iPhone Frame */}
            <div className="w-[375px] h-[812px] bg-black rounded-[3rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-myh-bg rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-myh-bg flex items-center justify-between px-6 text-xs font-medium text-myh-text z-10">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 border border-myh-text rounded-sm">
                      <div className="w-3 h-1.5 bg-myh-text rounded-sm m-0.5" />
                    </div>
                    <div className="w-1 h-1 bg-myh-text rounded-full" />
                    <div className="w-6 h-3 border border-myh-text rounded-sm">
                      <div className="w-4 h-2 bg-myh-text rounded-sm m-0.5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-12 h-full overflow-y-auto">
                  <ScreenshotComponent />
                </div>
              </div>
            </div>

            {/* Caption Overlay */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center w-full max-w-md">
              <h3 className="text-xl font-semibold text-myh-text mb-2">{selectedScreenshot.title}</h3>
              <p className="text-myh-textSoft">{selectedScreenshot.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

