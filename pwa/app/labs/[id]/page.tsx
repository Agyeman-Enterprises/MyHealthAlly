'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const mockResults = [
  { name: 'Glucose', value: '98', unit: 'mg/dL', range: '70-100', status: 'normal' },
  { name: 'BUN', value: '15', unit: 'mg/dL', range: '7-20', status: 'normal' },
  { name: 'Creatinine', value: '0.9', unit: 'mg/dL', range: '0.7-1.3', status: 'normal' },
  { name: 'Sodium', value: '140', unit: 'mEq/L', range: '136-145', status: 'normal' },
  { name: 'Potassium', value: '4.2', unit: 'mEq/L', range: '3.5-5.0', status: 'normal' },
  { name: 'HbA1c', value: '6.8', unit: '%', range: '<5.7', status: 'high' },
];

export default function LabDetailPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <h1 className="text-xl font-bold text-navy-600">Comprehensive Metabolic Panel</h1>
          <p className="text-gray-500">December 20, 2024 • Ordered by Dr. Smith</p>
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Test Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-2">Test</th>
                  <th className="pb-2">Result</th>
                  <th className="pb-2">Reference Range</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockResults.map((result, i) => (
                  <tr key={i} className={result.status !== 'normal' ? 'bg-amber-50' : ''}>
                    <td className="py-3 font-medium text-navy-600">{result.name}</td>
                    <td className="py-3">{result.value} {result.unit}</td>
                    <td className="py-3 text-gray-500">{result.range}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        result.status === 'normal' ? 'bg-green-100 text-green-700' :
                        result.status === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {result.status === 'normal' ? 'Normal' : result.status === 'high' ? '↑ High' : '↓ Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/labs')}>Back to Labs</Button>
          <Button variant="primary" onClick={() => router.push('/messages/new')}>Ask About Results</Button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
