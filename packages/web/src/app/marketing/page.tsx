'use client';

import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/primary-button';
import { GlowCard } from '@/components/ui/glow-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, TrendingUp, MessageSquare, Shield, Calendar, Activity, LogIn } from 'lucide-react';
import { Logo } from '@/components/branding/Logo';

export default function MarketingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Header with Login Links */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Logo width={180} height={54} showText={true} />
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/patient/login">
                <PrimaryButton variant="outline" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Patient Login
                </PrimaryButton>
              </Link>
              <Link href="/login">
                <PrimaryButton className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Clinician Login
                </PrimaryButton>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-slate-900">
                Your health, in one connected place.
              </h1>
              <p className="text-xl leading-relaxed text-slate-600">
                MyHealthAlly helps you track your vitals, follow your care plan, and stay connected to your care team in a calm, supportive way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/patient/login">
                  <PrimaryButton className="w-full sm:w-auto">
                    Get started
                  </PrimaryButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patients Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
              How it helps patients
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-slate-600">
              A calm, supportive way to stay on top of your health between visits.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <GlowCard className="p-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-teal-50">
                <Activity className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                See your health at a glance
              </h3>
              <p className="text-slate-600">
                View your key vitals, daily wellness score, and health trends in one simple dashboard. No overwhelming charts or confusing numbers.
              </p>
            </GlowCard>
            <GlowCard className="p-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-teal-50">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                Understand your numbers over time
              </h3>
              <p className="text-slate-600">
                Track how your blood pressure, glucose, weight, and sleep patterns change. Clear trends help you see what&apos;s working.
              </p>
            </GlowCard>
            <GlowCard className="p-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-teal-50">
                <MessageSquare className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                Stay connected between visits
              </h3>
              <p className="text-slate-600">
                Message your care team, ask questions, and share updates securely. No need to wait for your next appointment.
              </p>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* Clinicians Section */}
      <section id="for-clinics" className="py-20 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
              Extend your care beyond the visit.
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-slate-600">
              Help your patients stay engaged and catch issues early with continuous monitoring and support.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <GlowCard className="p-6">
              <CheckCircle2 className="w-8 h-8 mb-4 text-teal-600" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                Better adherence and engagement
              </h3>
              <p className="text-slate-600">
                Patients see their progress and get gentle reminders. Care plans become manageable daily steps.
              </p>
            </GlowCard>
            <GlowCard className="p-6">
              <Activity className="w-8 h-8 mb-4 text-teal-600" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                Early signal when something is off
              </h3>
              <p className="text-slate-600">
                Automated alerts flag concerning trends before they become urgent. Review and respond from your dashboard.
              </p>
            </GlowCard>
            <GlowCard className="p-6">
              <MessageSquare className="w-8 h-8 mb-4 text-teal-600" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                Secure messaging and visit requests
              </h3>
              <p className="text-slate-600">
                HIPAA-compliant messaging lets patients ask questions and request visits without phone tag.
              </p>
            </GlowCard>
          </div>
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <PrimaryButton className="w-full sm:w-auto">
                  Clinician Login
                </PrimaryButton>
              </Link>
              <a href="mailto:info@myhealthally.com">
                <PrimaryButton variant="outline" className="w-full sm:w-auto">
                  Talk to us about deployment
                </PrimaryButton>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-slate-900">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="security">
              <AccordionTrigger className="text-left text-slate-900">
                Is my data secure?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Yes. MyHealthAlly is built with HIPAA compliance in mind. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your health information without your explicit consent.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="devices">
              <AccordionTrigger className="text-left text-slate-900">
                Do I need special devices?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                No special devices required. You can use MyHealthAlly on your smartphone, tablet, or computer. If you have a smartwatch or fitness tracker, you can connect it to automatically sync some health data, but it&apos;s optional.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="doctor-replacement">
              <AccordionTrigger className="text-left text-slate-900">
                Is this a replacement for my doctor?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                No. MyHealthAlly is designed to help you stay connected with your care team between visits. It&apos;s a tool to support your health journey, not a replacement for regular medical care. Always consult your healthcare provider for medical advice.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cost">
              <AccordionTrigger className="text-left text-slate-900">
                How much does it cost?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                MyHealthAlly is typically provided through your healthcare provider or clinic. Contact your care team to learn about availability and any associated costs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="setup">
              <AccordionTrigger className="text-left text-slate-900">
                How do I get started?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Your healthcare provider will set up your account and send you an invitation. Once you receive it, you can log in and start tracking your health data. If you have questions, reach out to your care team through the app.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">MyHealthAlly</h3>
              <p className="text-white/70">
                Your health, in one connected place.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/marketing/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/marketing/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Access</h4>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/patient/login" className="hover:text-white transition-colors">
                    Patient Login
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Clinician Login
                  </Link>
                </li>
              </ul>
              <h4 className="font-semibold mb-4 mt-6">Contact</h4>
              <p className="text-white/70">
                <a href="mailto:info@myhealthally.com" className="hover:text-white transition-colors">
                  info@myhealthally.com
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/70">
            <p>© {currentYear} MyHealthAlly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
