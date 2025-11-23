import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/primary-button';
import { GlowCard } from '@/components/ui/glow-card';
import { ShieldCheck, Activity, MessageSquare, TrendingUp, Users, BarChart3, Clock } from 'lucide-react';

export default function CliniciansPage() {
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
            <Link href="/marketing/features" className="text-myh-textSoft hover:text-myh-primary transition-colors">
              Features
            </Link>
            <Link href="/marketing/clinicians" className="text-myh-primary font-medium">
              For Clinics
            </Link>
            <Link href="/login">
              <PrimaryButton variant="outline" className="text-sm">Sign In</PrimaryButton>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-myh-bg to-myh-surfaceSoft">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-myh-text mb-6">
            Extend your care beyond the visit
          </h1>
          <p className="text-xl text-myh-textSoft mb-8">
            MyHealthAlly empowers your clinic to provide continuous, proactive care, improving patient outcomes and operational efficiency.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-4xl font-bold text-myh-text mb-6">Better patient outcomes</h2>
            <p className="text-lg text-myh-textSoft mb-8">
              Continuous monitoring and early intervention help you catch issues before they become emergencies. Patients stay engaged between visits, leading to better adherence and healthier outcomes.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-myh-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-myh-text mb-1">Better adherence and engagement</h3>
                  <p className="text-myh-textSoft">Patients follow their care plans more consistently with gentle reminders and clear tracking.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Activity className="w-6 h-6 text-myh-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-myh-text mb-1">Early signal when something is off</h3>
                  <p className="text-myh-textSoft">Automated alerts notify your team when patient metrics trend outside normal ranges.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-myh-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-myh-text mb-1">Secure messaging and visit requests</h3>
                  <p className="text-myh-textSoft">Patients can ask questions and request visits without phone tag or portal confusion.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="relative w-full h-96 bg-myh-surface rounded-xl shadow-lg flex items-center justify-center border border-myh-border">
            <div className="text-center">
              <BarChart3 className="w-24 h-24 text-myh-border opacity-50 mx-auto mb-4" />
              <p className="text-myh-textSoft">Clinic dashboard overview</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <GlowCard className="p-6">
            <Users className="w-10 h-10 text-myh-primary mb-4" />
            <h3 className="text-xl font-semibold text-myh-text mb-2">Patient Management</h3>
            <p className="text-myh-textSoft">
              View all your patients in one place. See who needs attention, track progress, and manage care plans efficiently.
            </p>
          </GlowCard>

          <GlowCard className="p-6">
            <TrendingUp className="w-10 h-10 text-myh-primary mb-4" />
            <h3 className="text-xl font-semibold text-myh-text mb-2">Clinical Rules Engine</h3>
            <p className="text-myh-textSoft">
              Set up automated rules to monitor patient vitals and trigger alerts when intervention is needed.
            </p>
          </GlowCard>

          <GlowCard className="p-6">
            <Clock className="w-10 h-10 text-myh-primary mb-4" />
            <h3 className="text-xl font-semibold text-myh-text mb-2">Today&apos;s Triage</h3>
            <p className="text-myh-textSoft">
              Start each day with a clear view of patients needing attention, recent messages, and upcoming visits.
            </p>
          </GlowCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-myh-surfaceSoft">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-myh-text mb-6">Ready to transform your practice?</h2>
          <p className="text-xl text-myh-textSoft mb-8">
            Talk to us about deploying MyHealthAlly for your clinic.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:sales@myhealthally.com">
              <PrimaryButton className="w-full sm:w-auto">Contact Sales</PrimaryButton>
            </Link>
            <Link href="/marketing/features">
              <PrimaryButton variant="outline" className="w-full sm:w-auto">Learn More</PrimaryButton>
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

