import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/primary-button';
import { GlowCard } from '@/components/ui/glow-card';
import { Heart, TrendingUp, MessageSquare, ShieldCheck, Activity, Calendar, BarChart3, Bell } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-myh-bg text-myh-text">
      {/* Header */}
      <header className="bg-myh-surface border-b border-myh-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/marketing" className="text-2xl font-semibold text-myh-primary">
            MyHealthAlly
          </Link>
          <nav className="flex gap-6">
            <Link href="/marketing" className="text-myh-textSoft hover:text-myh-primary transition-colors">
              Home
            </Link>
            <Link href="/marketing/features" className="text-myh-primary font-medium">
              Features
            </Link>
            <Link href="/marketing/clinicians" className="text-myh-textSoft hover:text-myh-primary transition-colors">
              For Clinics
            </Link>
            <Link href="/patient/login">
              <PrimaryButton variant="outline" className="text-sm">Sign In</PrimaryButton>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-myh-bg to-myh-surfaceSoft">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-myh-text mb-6">
            Everything you need to manage your health
          </h1>
          <p className="text-xl text-myh-textSoft mb-8">
            MyHealthAlly brings together your health data, care plan, and care team in one calm, supportive place.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 bg-myh-primarySoft rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-myh-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-myh-text">Health at a Glance</h3>
            <p className="text-myh-textSoft">
              See your daily vitals, wellness score, and key health metrics all in one intuitive dashboard. No more hunting through multiple apps.
            </p>
          </GlowCard>

          {/* Feature 2 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 bg-myh-primarySoft rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-myh-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-myh-text">Track Trends Over Time</h3>
            <p className="text-myh-textSoft">
              Understand how your health metrics change with clear, easy-to-read charts. Spot patterns and celebrate progress.
            </p>
          </GlowCard>

          {/* Feature 3 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 bg-myh-primarySoft rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-myh-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-myh-text">Stay Connected</h3>
            <p className="text-myh-textSoft">
              Securely message your care team, ask questions, and share updates whenever you need to. No phone tag, no waiting.
            </p>
          </GlowCard>

          {/* Feature 4 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 bg-myh-primarySoft rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-myh-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-myh-text">Follow Your Care Plan</h3>
            <p className="text-myh-textSoft">
              Your personalized care plan, broken down into manageable steps. Track medications, habits, and goals with gentle reminders.
            </p>
          </GlowCard>

          {/* Feature 5 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 bg-myh-primarySoft rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-myh-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-myh-text">Thoughtful Alerts</h3>
            <p className="text-myh-textSoft">
              Get gentle notifications when something needs attention. Your care team is automatically informed, so you&apos;re never alone.
            </p>
          </GlowCard>

          {/* Feature 6 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 bg-myh-primarySoft rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-myh-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-myh-text">Weekly Health Summary</h3>
            <p className="text-myh-textSoft">
              Get a calm, encouraging summary of how you&apos;re doing each week. Simple insights that help you understand your progress.
            </p>
          </GlowCard>

          {/* Feature 7 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 bg-myh-primarySoft rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-myh-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-myh-text">Manage Appointments</h3>
            <p className="text-myh-textSoft">
              See upcoming visits, request appointments, and get reminders. All your care scheduling in one place.
            </p>
          </GlowCard>

          {/* Feature 8 */}
          <GlowCard className="p-8 space-y-4">
            <div className="w-12 h-12 bg-myh-primarySoft rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-myh-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-myh-text">Secure & Private</h3>
            <p className="text-myh-textSoft">
              Your health data is encrypted and protected. We&apos;re HIPAA compliant and take your privacy seriously.
            </p>
          </GlowCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-myh-surfaceSoft">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-myh-text mb-6">Ready to get started?</h2>
          <p className="text-xl text-myh-textSoft mb-8">
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
      <footer className="bg-myh-surface border-t border-myh-border py-10 px-4 text-myh-textSoft text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-semibold text-myh-text">MYHEALTHALLY</p>
          <div className="flex gap-6">
            <Link href="/marketing/privacy" className="hover:text-myh-primary transition-colors">Privacy Policy</Link>
            <Link href="/marketing/terms" className="hover:text-myh-primary transition-colors">Terms of Service</Link>
          </div>
          <p>© {new Date().getFullYear()} MyHealthAlly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

