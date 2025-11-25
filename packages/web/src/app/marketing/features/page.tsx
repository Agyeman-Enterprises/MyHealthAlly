'use client';

import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/primary-button';
import { GlowCard } from '@/components/ui/glow-card';
import { Heart, TrendingUp, MessageSquare, ShieldCheck, Activity, Calendar, BarChart3, Bell } from 'lucide-react';
import { Logo } from '@/components/branding/Logo';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/marketing">
            <Logo width={180} height={54} showText={true} />
          </Link>
          <nav className="flex gap-6">
            <Link href="/marketing" className="transition-colors text-slate-600 hover:text-teal-600">
              Home
            </Link>
            <Link href="/marketing/features" className="font-medium text-teal-600">
              Features
            </Link>
            <Link href="/marketing/clinicians" className="transition-colors text-slate-600 hover:text-teal-600">
              For Clinics
            </Link>
            <Link href="/patient/login">
              <PrimaryButton variant="outline" className="text-sm">Sign In</PrimaryButton>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-slate-900">
            Everything you need to manage your health
          </h1>
          <p className="text-xl mb-8 text-slate-600">
            MyHealthAlly brings together your health data, care plan, and care team in one calm, supportive place.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50">
              <Heart className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Health at a Glance</h3>
            <p className="text-slate-600">
              See your daily vitals, wellness score, and key health metrics all in one intuitive dashboard. No more hunting through multiple apps.
            </p>
          </GlowCard>

          {/* Feature 2 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Track Trends Over Time</h3>
            <p className="text-slate-600">
              Understand how your health metrics change with clear, easy-to-read charts. Spot patterns and celebrate progress.
            </p>
          </GlowCard>

          {/* Feature 3 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50">
              <MessageSquare className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Stay Connected</h3>
            <p className="text-slate-600">
              Securely message your care team, ask questions, and share updates whenever you need to. No phone tag, no waiting.
            </p>
          </GlowCard>

          {/* Feature 4 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50">
              <Activity className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Follow Your Care Plan</h3>
            <p className="text-slate-600">
              Your personalized care plan, broken down into manageable steps. Track medications, habits, and goals with gentle reminders.
            </p>
          </GlowCard>

          {/* Feature 5 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50">
              <Bell className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Thoughtful Alerts</h3>
            <p className="text-slate-600">
              Get gentle notifications when something needs attention. Your care team is automatically informed, so you&apos;re never alone.
            </p>
          </GlowCard>

          {/* Feature 6 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Weekly Health Summary</h3>
            <p className="text-slate-600">
              Get a calm, encouraging summary of how you&apos;re doing each week. Simple insights that help you understand your progress.
            </p>
          </GlowCard>

          {/* Feature 7 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Manage Appointments</h3>
            <p className="text-slate-600">
              See upcoming visits, request appointments, and get reminders. All your care scheduling in one place.
            </p>
          </GlowCard>

          {/* Feature 8 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Secure & Private</h3>
            <p className="text-slate-600">
              Your health data is encrypted and protected. We&apos;re HIPAA compliant and take your privacy seriously.
            </p>
          </GlowCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">Ready to get started?</h2>
          <p className="text-xl mb-8 text-slate-600">
            Join MyHealthAlly and take control of your health journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/patient/login">
              <PrimaryButton className="w-full sm:w-auto">Get started</PrimaryButton>
            </Link>
            <Link href="/marketing/clinicians">
              <PrimaryButton variant="outline" className="w-full sm:w-auto">For clinics</PrimaryButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-4 text-sm bg-white text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-semibold text-slate-900">MYHEALTHALLY</p>
          <div className="flex gap-6">
            <Link href="/marketing/privacy" className="transition-colors text-slate-600 hover:text-teal-600">Privacy Policy</Link>
            <Link href="/marketing/terms" className="transition-colors text-slate-600 hover:text-teal-600">Terms of Service</Link>
          </div>
          <p>© {new Date().getFullYear()} MyHealthAlly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
