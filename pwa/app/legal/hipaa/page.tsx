'use client';

import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

export default function HIPAAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="HIPAA Notice of Privacy Practices" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="p-8">
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Notice of Privacy Practices</h1>
            
            <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6">
              <p className="text-sm text-primary-800">
                <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-primary-800 mt-2">
                This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Get a copy of your health and claims records</li>
                <li>Correct your health and claims records</li>
                <li>Request confidential communication</li>
                <li>Ask us to limit the information we share</li>
                <li>Get a list of those with whom we've shared your information</li>
                <li>Get a copy of this privacy notice</li>
                <li>Choose someone to act for you</li>
                <li>File a complaint if you feel your rights are violated</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Uses and Disclosures</h2>
              <p className="text-gray-700 mb-4">
                We may use and share your information as we:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>Treat you:</strong> We can use your health information and share it with other professionals who are treating you.</li>
                <li><strong>Run our organization:</strong> We can use and share your health information to run our practice, improve your care, and contact you when necessary.</li>
                <li><strong>Bill for your services:</strong> We can use and share your health information to bill and get payment from health plans or other entities.</li>
                <li><strong>Help with public health and safety issues:</strong> We can share health information about you for certain situations such as preventing disease, helping with product recalls, reporting adverse reactions to medications, and preventing or reducing a serious threat to anyone's health or safety.</li>
                <li><strong>Comply with the law:</strong> We will share information about you if state or federal laws require it, including with the Department of Health and Human Services if it wants to see that we're complying with federal privacy law.</li>
                <li><strong>Respond to organ and tissue donation requests:</strong> We can share health information about you with organ procurement organizations.</li>
                <li><strong>Work with a medical examiner or funeral director:</strong> We can share health information with a coroner, medical examiner, or funeral director when an individual dies.</li>
                <li><strong>Address workers' compensation, law enforcement, and other government requests:</strong> We can use or share health information about you for workers' compensation claims, for law enforcement purposes or with a law enforcement official, with health oversight agencies for activities authorized by law, and for special government functions such as military, national security, and presidential protective services.</li>
                <li><strong>Respond to lawsuits and legal actions:</strong> We can share health information about you in response to a court or administrative order, or in response to a subpoena.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>We are required by law to maintain the privacy and security of your protected health information.</li>
                <li>We will let you know promptly if a breach occurs that may have compromised the privacy or security of your information.</li>
                <li>We must follow the duties and privacy practices described in this notice and give you a copy of it.</li>
                <li>We will not use or share your information other than as described here unless you tell us we can in writing. If you tell us we can, you may change your mind at any time. Let us know in writing if you change your mind.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to the Terms of This Notice</h2>
              <p className="text-gray-700 mb-4">
                We can change the terms of this notice, and the changes will apply to all information we have about you. The new notice will be available upon request, in our office, and on our web site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">For More Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this notice or want to exercise any of your rights, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Privacy Officer</strong><br />
                  MyHealth Ally<br />
                  [Contact Information]
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Complaints</h2>
              <p className="text-gray-700 mb-4">
                You can complain if you feel we have violated your rights by contacting us using the information above, or by filing a complaint with the U.S. Department of Health and Human Services Office for Civil Rights by sending a letter to 200 Independence Avenue, S.W., Washington, D.C. 20201, calling 1-877-696-6775, or visiting <a href="https://www.hhs.gov/ocr/privacy/hipaa/complaints/" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">www.hhs.gov/ocr/privacy/hipaa/complaints/</a>.
              </p>
              <p className="text-gray-700">
                We will not retaliate against you for filing a complaint.
              </p>
            </section>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

