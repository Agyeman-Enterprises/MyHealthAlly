'use client';

import { GlowCard } from '@/components/ui/glow-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import FloatingNav from '@/components/patient/FloatingNav';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, Smartphone, Activity, Bell, Shield, User } from 'lucide-react';

export default function AppSettingsPage() {
  const { patient, user, loading: authLoading, logout } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-myh-bg pb-24 p-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <FloatingNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Settings</h1>
          <p className="text-myh-textSoft">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <GlowCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-myh-primarySoft rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-myh-primary">
                {patient?.firstName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-myh-text">
                {patient?.firstName} {patient?.lastName}
              </p>
              <p className="text-sm text-myh-textSoft">{user?.email}</p>
            </div>
          </div>
        </GlowCard>

        {/* Account & Health Records */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-myh-text">Account & Health Records</h2>

          <GlowCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-myh-textSoft" />
                <span className="text-myh-text">Connected Devices</span>
              </div>
              <span className="text-sm text-myh-textSoft">2 devices</span>
            </div>
          </GlowCard>

          <GlowCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-myh-textSoft" />
                <span className="text-myh-text">Health Data Sync</span>
              </div>
              <span className="text-sm text-myh-primary font-medium">Active</span>
            </div>
          </GlowCard>

          <GlowCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-myh-textSoft" />
                <span className="text-myh-text">Notifications</span>
              </div>
              <span className="text-sm text-myh-textSoft">Enabled</span>
            </div>
          </GlowCard>

          <GlowCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-myh-textSoft" />
                <span className="text-myh-text">Privacy & Security</span>
              </div>
              <span className="text-sm text-myh-textSoft">HIPAA Compliant</span>
            </div>
          </GlowCard>
        </div>

        {/* Logout */}
        <div className="pt-6">
          <PrimaryButton
            onClick={logout}
            variant="outline"
            className="w-full flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log out of MyHealthAlly
          </PrimaryButton>
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}

