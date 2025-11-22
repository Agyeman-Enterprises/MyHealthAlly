'use client';

import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { Calendar, Clock, MapPin } from 'lucide-react';

const upcomingVisits = [
  {
    id: '1',
    date: 'Dec 15, 2024',
    time: '10:00 AM',
    provider: 'Dr. Sarah Johnson',
    type: 'Follow-up',
    location: 'Main Clinic',
  },
  {
    id: '2',
    date: 'Dec 22, 2024',
    time: '2:30 PM',
    provider: 'Dr. Michael Chen',
    type: 'Annual Checkup',
    location: 'Main Clinic',
  },
];

export default function PatientSchedulePage() {
  return (
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Schedule</h1>
          <p className="text-myh-textSoft">Your upcoming appointments</p>
        </div>

        <div className="space-y-4">
          {upcomingVisits.map((visit) => (
            <GlowCard key={visit.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-myh-primary" />
                  <div>
                    <p className="font-semibold text-myh-text">{visit.date}</p>
                    <p className="text-sm text-myh-textSoft flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {visit.time}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-myh-primarySoft text-myh-primary rounded-full text-sm font-medium">
                  {visit.type}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-myh-text font-medium">{visit.provider}</p>
                <p className="text-sm text-myh-textSoft flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {visit.location}
                </p>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}

