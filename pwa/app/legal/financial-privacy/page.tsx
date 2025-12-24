'use client';

import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

export default function FinancialPrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Financial Privacy Policy" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="p-8">
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Financial Privacy Policy</h1>
            
            <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6">
              <p className="text-sm text-primary-800">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-primary-800 mt-2">
                This policy describes how we collect, use, and protect your financial information.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Financial Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect the following financial information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Payment card information (processed securely through Stripe - we do not store full card numbers)</li>
                <li>Billing address and contact information</li>
                <li>Payment history and transaction records</li>
                <li>Insurance information for billing purposes</li>
                <li>Invoice and billing records</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Financial Information</h2>
              <p className="text-gray-700 mb-4">
                We use your financial information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Process payments for healthcare services</li>
                <li>Generate invoices and billing statements</li>
                <li>Manage your account and payment history</li>
                <li>Comply with financial regulations and tax requirements</li>
                <li>Prevent fraud and unauthorized transactions</li>
                <li>Provide customer support for billing inquiries</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Processing</h2>
              <p className="text-gray-700 mb-4">
                All payments are processed securely through Stripe, a PCI-DSS compliant payment processor. We do not store your full credit card number on our servers. Stripe handles all payment card data according to industry security standards.
              </p>
              <p className="text-gray-700 mb-4">
                When you make a payment, we transmit only the minimum information necessary to process the transaction securely.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We may share your financial information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>Payment processors:</strong> Stripe and other payment service providers to process transactions</li>
                <li><strong>Financial institutions:</strong> Banks and credit card companies for payment processing</li>
                <li><strong>Service providers:</strong> Third parties who assist with billing and payment operations (under strict confidentiality agreements)</li>
                <li><strong>Legal requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Your healthcare provider:</strong> For billing and payment coordination</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We do not sell your financial information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-4">
                We protect your financial information using:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>PCI-DSS compliant payment processing (via Stripe)</li>
                <li>Encryption of financial data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and assessments</li>
                <li>Compliance with financial privacy regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Access your payment and billing history</li>
                <li>Request copies of invoices and receipts</li>
                <li>Correct errors in billing information</li>
                <li>Dispute charges through our customer support</li>
                <li>Request information about how your financial data is used</li>
                <li>Opt out of certain communications (while maintaining essential billing communications)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Retention of Financial Records</h2>
              <p className="text-gray-700 mb-4">
                We retain financial records as required by law, typically for a minimum of 7 years for tax and regulatory compliance purposes. After this period, records may be securely deleted in accordance with our data retention policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For questions about this Financial Privacy Policy or to exercise your rights, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Billing & Financial Privacy</strong><br />
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

