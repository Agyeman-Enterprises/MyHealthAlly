import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-navy-600 mb-4">
            A smarter patient experience.
          </h1>
          <h2 className="text-2xl font-semibold text-navy-500 mb-6">
            A safer way to deliver modern care.
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            MyHealthAlly is a patient engagement and health navigation platform designed for modern clinics, telehealth practices, and concierge care models.
          </p>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-4">
            All plans include secure patient access, AI-powered health navigation, and a continuously updated education library.
          </p>
        </div>

        {/* Core Platform */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🟢</span>
            <h2 className="text-2xl font-bold text-navy-600">Core Platform</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4 font-semibold">
            Included with all MyHealthAlly subscriptions
          </p>

          <h3 className="text-lg font-semibold text-navy-700 mb-3">What you get</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Patient app (iOS / Android / Web)</li>
            <li>Secure messaging & care workflows</li>
            <li>AI health navigation (non-diagnostic)</li>
            <li>Vitals, symptom tracking, and education tools</li>
            <li>Full access to the MyHealthAlly patient education library</li>
            <li>Automatic content updates and safety improvements</li>
          </ul>

          <h3 className="text-lg font-semibold text-navy-700 mb-3">Content usage</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Education content is available to your patients <strong>inside MyHealthAlly</strong></li>
            <li>AI may reference education modules during patient interactions</li>
          </ul>

          <div className="bg-white p-4 rounded border border-green-300">
            <p className="text-sm text-gray-700">
              <span className="text-green-600">✔</span> Ideal for clinics focused on care delivery<br />
              <span className="text-red-600">✖</span> External reuse not included
            </p>
          </div>
        </Card>

        {/* Marketing Content License */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🟡</span>
            <h2 className="text-2xl font-bold text-navy-600">Marketing Content License</h2>
            <span className="text-sm text-gray-600">(Optional Add-On)</span>
          </div>
          <p className="text-gray-700 mb-4">
            For practices that want to extend trusted education beyond the app.
          </p>

          <h3 className="text-lg font-semibold text-navy-700 mb-3">Additional rights</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Reuse approved education modules on your website or blog</li>
            <li>Share content in newsletters or patient emails</li>
            <li>Add your clinic branding, introductions, and calls-to-action</li>
            <li>Use content to support SEO and patient education campaigns</li>
          </ul>

          <h3 className="text-lg font-semibold text-navy-700 mb-3">Safeguards</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Core educational text remains unchanged</li>
            <li>Attribution required (configurable)</li>
            <li>License valid while your MyHealthAlly subscription is active</li>
          </ul>

          <div className="bg-white p-4 rounded border border-yellow-300">
            <p className="text-sm text-gray-700">
              <span className="text-green-600">✔</span> Ideal for growth-oriented clinics<br />
              <span className="text-green-600">✔</span> High-value patient education without content creation overhead
            </p>
          </div>
        </Card>

        {/* Enterprise License */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔵</span>
            <h2 className="text-2xl font-bold text-navy-600">Enterprise / White-Label License</h2>
          </div>
          <p className="text-gray-700 mb-4">
            For large practices, health systems, and international partners.
          </p>

          <h3 className="text-lg font-semibold text-navy-700 mb-3">Includes</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>White-label presentation</li>
            <li>Localization and regulatory adaptation</li>
            <li>Optional wording adjustments (approved)</li>
            <li>Multi-site and multi-brand deployment</li>
            <li>Dedicated governance and update coordination</li>
          </ul>

          <div className="bg-white p-4 rounded border border-blue-300">
            <p className="text-sm text-gray-700">
              <strong>Custom pricing</strong><br />
              <strong>Contractual agreement required</strong>
            </p>
          </div>
        </Card>

        {/* First-Party Clinics */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-navy-600 mb-3">First-Party Clinics</h2>
          <p className="text-gray-700">
            Clinics owned or operated by MyHealthAlly (including Ohimaa, BookADoc2U, and MedRx) receive full internal use rights by default under centralized content governance.
          </p>
        </Card>

        {/* Summary Table */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-navy-600 mb-4">Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Feature</th>
                  <th className="text-center p-2">Core</th>
                  <th className="text-center p-2">Marketing</th>
                  <th className="text-center p-2">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Patient education in app</td>
                  <td className="p-2 text-center">✔</td>
                  <td className="p-2 text-center">✔</td>
                  <td className="p-2 text-center">✔</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">AI health navigation</td>
                  <td className="p-2 text-center">✔</td>
                  <td className="p-2 text-center">✔</td>
                  <td className="p-2 text-center">✔</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">External content reuse</td>
                  <td className="p-2 text-center">✖</td>
                  <td className="p-2 text-center">✔</td>
                  <td className="p-2 text-center">✔</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">White-labeling</td>
                  <td className="p-2 text-center">✖</td>
                  <td className="p-2 text-center">✖</td>
                  <td className="p-2 text-center">✔</td>
                </tr>
                <tr>
                  <td className="p-2">Content ownership</td>
                  <td className="p-2 text-center">✖</td>
                  <td className="p-2 text-center">✖</td>
                  <td className="p-2 text-center">✖</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600 italic">
              Content is licensed, not sold.<br />
              All rights not expressly granted are reserved.
            </p>
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
