import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/primary-button';
import { GlowCard } from '@/components/ui/glow-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, TrendingUp, MessageSquare, Shield, Smartphone, Heart, Calendar, Activity } from 'lucide-react';

export default function MarketingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-myh-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-myh-primarySoft/30 via-myh-bg to-myh-surfaceSoft">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-myh-text leading-tight">
                Your health, in one connected place.
              </h1>
              <p className="text-xl text-myh-textSoft leading-relaxed">
                MyHealthAlly helps you track your vitals, follow your care plan, and stay connected to your care team in a calm, supportive way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/patient/login">
                  <PrimaryButton className="w-full sm:w-auto">
                    Get started
                  </PrimaryButton>
                </Link>
                <a href="#for-clinics">
                  <PrimaryButton variant="outline" className="w-full sm:w-auto">
                    For clinics
                  </PrimaryButton>
                </a>
              </div>
            </div>
            <div className="relative">
              {/* Phone Mockup Placeholder */}
              <div className="relative mx-auto max-w-sm">
                <div className="bg-myh-surface border-8 border-myh-text rounded-[3rem] p-4 shadow-2xl">
                  <div className="bg-myh-bg rounded-[2rem] overflow-hidden aspect-[9/19.5]">
                    <div className="h-full bg-gradient-to-br from-myh-primarySoft/50 to-myh-surface p-6 flex flex-col justify-center items-center space-y-4">
                      <div className="w-16 h-16 bg-myh-primary rounded-full flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-myh-text font-medium text-center">
                        MyHealthAlly
                      </p>
                      <p className="text-sm text-myh-textSoft text-center">
                        Your health dashboard
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* TODO: Replace with actual app screenshots */}
            </div>
          </div>
        </div>
      </section>

      {/* Patients Section */}
      <section className="py-20 bg-myh-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-myh-text mb-4">
              How it helps patients
            </h2>
            <p className="text-lg text-myh-textSoft max-w-2xl mx-auto">
              A calm, supportive way to stay on top of your health between visits.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <GlowCard className="p-6">
              <div className="w-12 h-12 bg-myh-primarySoft rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-myh-primary" />
              </div>
              <h3 className="text-xl font-semibold text-myh-text mb-2">
                See your health at a glance
              </h3>
              <p className="text-myh-textSoft">
                View your key vitals, daily wellness score, and health trends in one simple dashboard. No overwhelming charts or confusing numbers.
              </p>
            </GlowCard>
            <GlowCard className="p-6">
              <div className="w-12 h-12 bg-myh-primarySoft rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-myh-primary" />
              </div>
              <h3 className="text-xl font-semibold text-myh-text mb-2">
                Understand your numbers over time
              </h3>
              <p className="text-myh-textSoft">
                Track how your blood pressure, glucose, weight, and sleep patterns change. Clear trends help you see what&apos;s working.
              </p>
            </GlowCard>
            <GlowCard className="p-6">
              <div className="w-12 h-12 bg-myh-primarySoft rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-myh-primary" />
              </div>
              <h3 className="text-xl font-semibold text-myh-text mb-2">
                Stay connected between visits
              </h3>
              <p className="text-myh-textSoft">
                Message your care team, ask questions, and share updates securely. No need to wait for your next appointment.
              </p>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* Clinicians Section */}
      <section id="for-clinics" className="py-20 bg-myh-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-myh-text mb-4">
              Extend your care beyond the visit.
            </h2>
            <p className="text-lg text-myh-textSoft max-w-2xl mx-auto">
              Help your patients stay engaged and catch issues early with continuous monitoring and support.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <GlowCard className="p-6">
              <CheckCircle2 className="w-8 h-8 text-myh-primary mb-4" />
              <h3 className="text-xl font-semibold text-myh-text mb-2">
                Better adherence and engagement
              </h3>
              <p className="text-myh-textSoft">
                Patients see their progress and get gentle reminders. Care plans become manageable daily steps.
              </p>
            </GlowCard>
            <GlowCard className="p-6">
              <Activity className="w-8 h-8 text-myh-primary mb-4" />
              <h3 className="text-xl font-semibold text-myh-text mb-2">
                Early signal when something is off
              </h3>
              <p className="text-myh-textSoft">
                Automated alerts flag concerning trends before they become urgent. Review and respond from your dashboard.
              </p>
            </GlowCard>
            <GlowCard className="p-6">
              <MessageSquare className="w-8 h-8 text-myh-primary mb-4" />
              <h3 className="text-xl font-semibold text-myh-text mb-2">
                Secure messaging and visit requests
              </h3>
              <p className="text-myh-textSoft">
                HIPAA-compliant messaging lets patients ask questions and request visits without phone tag.
              </p>
            </GlowCard>
          </div>
          <div className="text-center">
            <a href="mailto:info@myhealthally.com">
              <PrimaryButton>
                Talk to us about deployment
              </PrimaryButton>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-myh-surface">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-myh-text text-center mb-12">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="security">
              <AccordionTrigger className="text-left text-myh-text">
                Is my data secure?
              </AccordionTrigger>
              <AccordionContent className="text-myh-textSoft">
                Yes. MyHealthAlly is built with HIPAA compliance in mind. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your health information without your explicit consent.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="devices">
              <AccordionTrigger className="text-left text-myh-text">
                Do I need special devices?
              </AccordionTrigger>
              <AccordionContent className="text-myh-textSoft">
                No special devices required. You can use MyHealthAlly on your smartphone, tablet, or computer. If you have a smartwatch or fitness tracker, you can connect it to automatically sync some health data, but it&apos;s optional.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="doctor-replacement">
              <AccordionTrigger className="text-left text-myh-text">
                Is this a replacement for my doctor?
              </AccordionTrigger>
              <AccordionContent className="text-myh-textSoft">
                No. MyHealthAlly is designed to help you stay connected with your care team between visits. It&apos;s a tool to support your health journey, not a replacement for regular medical care. Always consult your healthcare provider for medical advice.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cost">
              <AccordionTrigger className="text-left text-myh-text">
                How much does it cost?
              </AccordionTrigger>
              <AccordionContent className="text-myh-textSoft">
                MyHealthAlly is typically provided through your healthcare provider or clinic. Contact your care team to learn about availability and any associated costs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="setup">
              <AccordionTrigger className="text-left text-myh-text">
                How do I get started?
              </AccordionTrigger>
              <AccordionContent className="text-myh-textSoft">
                Your healthcare provider will set up your account and send you an invitation. Once you receive it, you can log in and start tracking your health data. If you have questions, reach out to your care team through the app.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-myh-text text-white py-12">
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
              <h4 className="font-semibold mb-4">Contact</h4>
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

