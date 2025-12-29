'use client';

import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

const corePromise = [
  'Access, continuity, and guided care — not unlimited visits.',
  'You are buying: a care relationship, a response SLA, a clinical backstop, and a guided self-management system.',
  'You are NOT buying: unlimited clinician time, 24/7 emergency care, or instant answers.',
];

const included = [
  'Clinician response within 48 business hours (symptoms, health questions, labs, nutrition/exercise). SLA pauses on weekends/holidays.',
  'AI-assisted symptom intake (not a diagnosis) + general health education; mandatory clinician review.',
  'Functional medicine guidance: nutrition review/feedback, exercise/lifestyle recommendations, supplement discussion (education + clinician-approved plans), root-cause-oriented lab interpretation (by clinician).',
  'Care coordination: lab ordering and review, refills when appropriate, referrals, appointment scheduling, uploads (outside records/discharge paperwork).',
  'Longitudinal tracking: food logs, exercise logs, symptoms over time, vitals/wearables (if connected), progress visible to clinician.',
];

const excluded = [
  'Emergency or urgent care',
  'Same-day responses',
  'On-demand video visits',
  'Controlled substance prescribing',
  'Specialist-level management without referral',
  'Crisis mental health services',
  'Unlimited visits',
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-600">Functional Care Membership</h1>
          <p className="text-gray-600 mt-2">Production-ready pricing and disclosures.</p>
        </div>

        <Card className="space-y-2">
          <h2 className="text-xl font-semibold text-navy-600">Pricing</h2>
          <p className="text-3xl font-bold text-primary-700">$129<span className="text-base font-medium text-gray-600">/month</span></p>
          <p className="text-lg font-semibold text-primary-700">$1,299<span className="text-base font-medium text-gray-600">/year</span></p>
          <p className="text-sm text-gray-600">Prices are for the Functional Care Membership.</p>
        </Card>

        <Card className="space-y-2">
          <h3 className="text-lg font-semibold text-navy-600">Core Promise</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {corePromise.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-navy-600">Includes</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {included.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-navy-600">Excludes</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {excluded.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>

        <Card className="space-y-2 bg-amber-50 border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800">Emergency Disclaimer</h3>
          <p className="text-sm text-amber-800">
            AI-assisted symptom intake is not a diagnosis or medical advice. If you think you may be having an emergency,
            call your local emergency number or go to the nearest emergency department. Same-day responses and emergency care are not included.
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
