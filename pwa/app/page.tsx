'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';

const features = [
  { title: 'Labs', desc: 'Order labs online; results with plain-English explanations.' },
  { title: 'Refills', desc: 'Request refills in two taps; we coordinate with your pharmacy.' },
  { title: 'Referrals', desc: 'We find specialists, send records, and schedule for you.' },
  { title: 'Appointments', desc: 'Real-time scheduling with your care team (Complete+).' },
  { title: 'AI Health Assistant', desc: '24/7 answers with clinician review—no diagnoses, just guidance.' },
  { title: 'Health Tracking', desc: 'Log symptoms, vitals, meds; your data stays private.' },
  { title: 'Voice & Multilingual', desc: 'Voice-log symptoms, vitals, and requests; we transcribe and support patient-preferred languages.' },
];

const plans = [
  { name: 'Essential', price: '$69/mo', blurb: '2 labs, 4 refills, 2 referrals per year. Perfect for light use.' },
  { name: 'Complete', price: '$120/mo', blurb: 'Unlimited labs, refills, referrals, appointments. Most popular.' },
  { name: 'Family', price: '$199/mo', blurb: 'Complete benefits for up to 5 household members.' },
  { name: 'Premium', price: '$299/mo', blurb: 'Concierge care with priority messaging and MD video consults.' },
];

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  const primaryCta = isAuthenticated
    ? role === 'provider' || role === 'admin'
      ? '/provider/dashboard'
      : '/dashboard'
    : '/auth/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 text-navy-700">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold">MHA</div>
          <div>
            <p className="text-lg font-semibold">MyHealthAlly</p>
            <p className="text-xs text-gray-500">Your Doctor&apos;s Office, In Your Pocket</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-sm font-semibold text-primary-700 hover:text-primary-800">Pricing</Link>
          <Link
            href="/provider/login"
            className="text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            Provider Login
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold text-primary-700 hover:text-primary-800 border border-primary-200 rounded-lg px-3 py-2"
          >
            Sign Up
          </Link>
          <Link
            href={primaryCta}
            className="text-sm font-semibold bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700"
          >
            {isAuthenticated ? 'Go to app' : 'Log In'}
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <section className="grid lg:grid-cols-2 gap-10 items-center py-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Labs. Refills. Referrals. One App.</p>
            <h1 className="text-4xl font-bold leading-tight text-navy-800">Your Doctor&apos;s Office, In Your Pocket</h1>
            <p className="text-lg text-gray-700">
              Order labs. Request refills. Get referrals. Book appointments. Real clinicians, clear SLAs, starting at $69.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="bg-primary-600 text-white rounded-xl px-5 py-3 font-semibold hover:bg-primary-700"
              >
                Get Started
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl px-5 py-3 font-semibold border border-primary-200 text-primary-700 hover:border-primary-300"
              >
                See Plans
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg">✓ HIPAA Compliant</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg">✓ 256-bit Encryption</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg">✓ Board-Certified Clinicians</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg">✓ Cancel Anytime</span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
            <p className="text-sm font-semibold text-primary-700">Plans at a glance</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div key={plan.name} className="p-4 border border-gray-100 rounded-xl bg-primary-50/50">
                  <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">{plan.name}</p>
                  <p className="text-2xl font-bold text-navy-800 mt-1">{plan.price}</p>
                  <p className="text-sm text-gray-700 mt-1">{plan.blurb}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Prices and inclusions may adjust as plans finalize.</p>
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-2xl font-bold text-navy-800 mb-4">Everything your practice does, without the phone tag.</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                <p className="text-sm font-semibold text-primary-700 mb-1">{f.title}</p>
                <p className="text-sm text-gray-700">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Concierge medicine without the concierge price</p>
              <p className="text-lg text-gray-700">Skip the waiting room. Not the care. Starting at $69.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/auth/signup" className="bg-primary-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-primary-700">
                Start Now
              </Link>
              <Link href="/pricing" className="border border-primary-200 text-primary-700 rounded-lg px-4 py-2 font-semibold hover:border-primary-300">
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
