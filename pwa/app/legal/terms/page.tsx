'use client';

import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Terms of Service" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="p-8">
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            
            <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6">
              <p className="text-sm text-primary-800">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-primary-800 mt-2">
                Please read these Terms of Service carefully before using MyHealth Ally.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using MyHealth Ally, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Medical Disclaimer</h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-800 font-semibold mb-2">IMPORTANT MEDICAL DISCLAIMER</p>
                <p className="text-red-700 text-sm">
                  MyHealth Ally is a patient engagement and communication platform. It is NOT a medical provider and does NOT provide medical diagnosis, treatment, or prescriptions. All clinical decisions are made by licensed healthcare providers. For medical emergencies, call 911 immediately.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to use MyHealth Ally for personal, non-commercial healthcare communication purposes. This license does not include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Commercial use or resale</li>
                <li>Modification or reverse engineering</li>
                <li>Removal of copyright or proprietary notices</li>
                <li>Transfer of materials to another person</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
              <p className="text-gray-700 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You may not use MyHealth Ally to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Violate any laws or regulations</li>
                <li>Transmit harmful, offensive, or illegal content</li>
                <li>Impersonate another person or entity</li>
                <li>Interfere with or disrupt the service</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Use automated systems to access the service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                Payments are processed securely through Stripe. By making a payment, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Provide accurate payment information</li>
                <li>Authorize charges for services rendered</li>
                <li>Pay all applicable fees and taxes</li>
                <li>Comply with refund policies as stated</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content, features, and functionality of MyHealth Ally are owned by us and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of your health information and data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, MyHealth Ally shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use, arising from your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and access to the service immediately, without prior notice, for any breach of these Terms of Service. Upon termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. We will notify you of any material changes. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Legal Department</strong><br />
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

