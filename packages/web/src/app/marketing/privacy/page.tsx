import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/primary-button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-myh-bg text-myh-text">
      {/* Header */}
      <header className="bg-myh-surface border-b border-myh-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/marketing" className="text-2xl font-semibold text-myh-primary">
            MyHealthAlly
          </Link>
          <Link href="/marketing">
            <PrimaryButton variant="outline" className="text-sm">Back to Home</PrimaryButton>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-myh-text mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-myh-textSoft">
          <p className="text-myh-text font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div>
            <h2 className="text-2xl font-semibold text-myh-text mb-4">Our Commitment to Your Privacy</h2>
            <p>
              MyHealthAlly is committed to protecting your personal health information. We understand that health data is sensitive and personal, and we take our responsibility to safeguard it seriously.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-myh-text mb-4">HIPAA Compliance</h2>
            <p>
              MyHealthAlly is fully compliant with the Health Insurance Portability and Accountability Act (HIPAA). We implement administrative, physical, and technical safeguards to protect your protected health information (PHI).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-myh-text mb-4">Information We Collect</h2>
            <p>We collect and store:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Health metrics and vitals data you provide or sync from devices</li>
              <li>Messages and communications with your care team</li>
              <li>Care plan information and task completion</li>
              <li>Appointment and visit information</li>
              <li>Account information (email, name, contact details)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-myh-text mb-4">How We Use Your Information</h2>
            <p>Your health information is used to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide you with health insights and summaries</li>
              <li>Enable secure communication with your care team</li>
              <li>Generate alerts when your care team needs to be notified</li>
              <li>Support your care plan and treatment goals</li>
              <li>Improve our services (using de-identified data)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-myh-text mb-4">Data Security</h2>
            <p>
              We use industry-standard encryption to protect your data both in transit and at rest. Access to your health information is restricted to authorized personnel only, and all access is logged and monitored.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-myh-text mb-4">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your health information</li>
              <li>Request corrections to your data</li>
              <li>Request a copy of your health records</li>
              <li>Request restrictions on how we use your information</li>
              <li>File a complaint if you believe your privacy rights have been violated</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-myh-text mb-4">Contact Us</h2>
            <p>
              If you have questions about this privacy policy or your health information, please contact us at:
            </p>
            <p className="text-myh-primary font-medium">
              privacy@myhealthally.com
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-myh-surface border-t border-myh-border py-10 px-4 text-myh-textSoft text-sm mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-semibold text-myh-text">MYHEALTHALLY</p>
          <div className="flex gap-6">
            <Link href="/marketing/privacy" className="text-myh-primary font-medium">Privacy Policy</Link>
            <Link href="/marketing/terms" className="hover:text-myh-primary transition-colors">Terms of Service</Link>
          </div>
          <p>© {new Date().getFullYear()} MyHealthAlly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

