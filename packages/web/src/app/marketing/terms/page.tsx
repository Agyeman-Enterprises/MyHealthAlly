'use client';

import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Logo } from '@/components/branding/Logo';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/marketing">
            <Logo width={180} height={54} showText={true} />
          </Link>
          <Link href="/marketing">
            <PrimaryButton variant="outline" className="text-sm">Back to Home</PrimaryButton>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">Terms of Service</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-slate-600">
          <p className="font-medium text-slate-900">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Agreement to Terms</h2>
            <p>
              By accessing or using MyHealthAlly, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Use of Service</h2>
            <p>MyHealthAlly is a health management platform designed to help you track your health metrics, communicate with your care team, and follow your care plan. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service only for lawful purposes</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Not share your account credentials with others</li>
              <li>Not use the service to violate any laws or regulations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Medical Disclaimer</h2>
            <p>
              <strong className="text-slate-900">Important:</strong> MyHealthAlly is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or seen in MyHealthAlly.
            </p>
            <p>
              If you think you may have a medical emergency, call your doctor or emergency services immediately.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Service Availability</h2>
            <p>
              We strive to provide reliable service, but we do not guarantee that the service will be available at all times. We may experience downtime for maintenance, updates, or unforeseen circumstances.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, MyHealthAlly shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the service after changes become effective constitutes acceptance of the new terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Contact Us</h2>
            <p>
              If you have questions about these terms, please contact us at:
            </p>
            <p className="font-medium text-teal-600">
              legal@myhealthally.com
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-4 text-sm mt-20 bg-white text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-semibold text-slate-900">MYHEALTHALLY</p>
          <div className="flex gap-6">
            <Link href="/marketing/privacy" className="transition-colors text-slate-600 hover:text-teal-600">Privacy Policy</Link>
            <Link href="/marketing/terms" className="font-medium text-teal-600 transition-colors">Terms of Service</Link>
          </div>
          <p>© {new Date().getFullYear()} MyHealthAlly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
