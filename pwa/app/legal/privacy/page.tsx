'use client';

import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Privacy Policy" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="p-8">
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            
            <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6">
              <p className="text-sm text-primary-800">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 mb-4">
                MyHealth Ally (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Health Information</h3>
              <p className="text-gray-700 mb-4">
                We collect health information that you provide to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Medical history and conditions</li>
                <li>Medications and prescriptions</li>
                <li>Vital signs and health measurements</li>
                <li>Messages and communications with your care team</li>
                <li>Appointment information</li>
                <li>Insurance information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Name, date of birth, contact information</li>
                <li>Account credentials</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Device information and usage data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Provide healthcare services and coordinate care</li>
                <li>Process payments and manage billing</li>
                <li>Communicate with you about your care</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
                <li>Protect against fraud and abuse</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>Your healthcare providers:</strong> To coordinate your care</li>
                <li><strong>Service providers:</strong> Third parties who assist in operating our services (under strict confidentiality agreements)</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We do not sell your personal health information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Compliance with HIPAA security requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Access and receive a copy of your health information</li>
                <li>Request corrections to your information</li>
                <li>Request restrictions on how we use or disclose your information</li>
                <li>Request confidential communications</li>
                <li>File a complaint if you believe your privacy rights have been violated</li>
                <li>Delete your account and data (subject to legal retention requirements)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Privacy Officer</strong><br />
                  MyHealth Ally<br />
                  [Contact Information]
                </p>
              </div>
            </section>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

