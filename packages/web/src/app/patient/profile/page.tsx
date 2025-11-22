'use client';

import { GlowCard } from '@/components/ui/glow-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import FloatingNav from '@/components/patient/FloatingNav';
import { LogOut, Smartphone, Activity } from 'lucide-react';

export default function PatientProfilePage() {
  return (
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Profile</h1>
        </div>

        <GlowCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-myh-primarySoft rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-myh-primary">A</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-myh-text">Alex</p>
              <p className="text-sm text-myh-textSoft">Patient</p>
            </div>
          </div>
        </GlowCard>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-myh-text">Account & health records</h2>
          
          <GlowCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-myh-textSoft" />
                <span className="text-myh-text">Connected devices</span>
              </div>
              <span className="text-sm text-myh-textSoft">2 devices</span>
            </div>
          </GlowCard>

          <GlowCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-myh-textSoft" />
                <span className="text-myh-text">Health data sync</span>
              </div>
              <span className="text-sm text-myh-primary">Active</span>
            </div>
          </GlowCard>
        </div>

        <div className="pt-6">
          <button className="w-full flex items-center justify-center bg-myh-surface border border-myh-border text-myh-text hover:bg-myh-surfaceSoft rounded-xl px-5 py-3 active:scale-95 transition-all duration-200 font-medium">
            <LogOut className="w-5 h-5 mr-2" />
            Log out of MyHealthAlly
          </button>
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}

