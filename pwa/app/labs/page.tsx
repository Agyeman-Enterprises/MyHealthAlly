'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAttachmentStatus } from '@/lib/hooks/useAttachmentStatus';
import { getPatientLabResults, type LabResult } from '@/lib/supabase/queries-results';

interface Lab {
  id: string;
  name: string;
  date: string;
  status: string;
  hasAbnormal?: boolean;
  hasResults?: boolean;
  doctorNote?: string;
}

export default function LabsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const patientId = useAuthStore((state) => state.patientId);
  const { attached } = useAttachmentStatus();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLabResults = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        const labResults = await getPatientLabResults(patientId);
        
        // Transform to display format
        const transformed: Lab[] = labResults.map((result: LabResult) => {
          // Check if results have abnormal values
          const hasAbnormal = result.results 
            ? Object.values(result.results).some((test: unknown) => {
                const t = test as { flag?: string };
                return t.flag && t.flag !== 'normal';
              })
            : false;
          
          const labDate = result.result_date;
          const createdDate = result.created_at ? result.created_at.split('T')[0] : '';
          const dateStr = labDate ? labDate.split('T')[0] : createdDate;
          
          const lab: Lab = {
            id: result.id,
            name: result.test_name,
            date: dateStr || '',
            status: result.status === 'completed' ? 'completed' : 'pending',
            hasAbnormal,
            hasResults: !!result.results,
          };
          if (result.doctor_note) {
            lab.doctorNote = result.doctor_note;
          }
          return lab;
        });
        
        setLabs(transformed);
      } catch (err) {
        console.error('Error loading lab results:', err);
        setError('Failed to load lab results. Please try again.');
        setLabs([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadLabResults();
    }
  }, [isAuthenticated, patientId]);

  if (isLoading) {
    return null;
  }

  function LabsPageInner() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Lab Results</h1>
          <p className="text-gray-600">
            {attached ? 'View your laboratory test results' : 'Track your laboratory test results for personal wellness'}
          </p>
        </div>

        {!attached && (
          <div className="mb-6 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm">
            <strong>Wellness Mode:</strong> These lab results are for your personal tracking only.
            <Link href="/connect" className="ml-1 text-blue-600 underline">Connect to a care team</Link> to share results with your provider.
          </div>
        )}

        {attached && (
          <Card className="mb-6 bg-primary-50 border-primary-200">
            <p className="text-sm text-navy-600">
              💡 <strong>Note:</strong> Lab results are typically available 1-3 days after your test. 
              For questions about your results, please <Link href="/messages/new?recipient=care-team&subject=Question about Lab Results&context=lab results" className="text-primary-600 hover:underline">message your care team</Link>.
            </p>
          </Card>
        )}

        {error && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <p className="text-amber-800 text-sm">{error}</p>
          </Card>
        )}

        {loading && (
          <Card className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading lab results...</p>
          </Card>
        )}

        {!loading && labs.length > 0 && (
          <div className="space-y-3">
            {labs.map((lab) => (
              <Card key={lab.id} hover className="cursor-pointer" onClick={() => router.push(`/labs/${lab.id}`)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-navy-600">{lab.name}</h3>
                      {lab.hasAbnormal && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Review Needed</span>}
                    </div>
                    <p className="text-sm text-gray-500">{new Date(lab.date).toLocaleDateString()}</p>
                    {lab.doctorNote && (
                      <p className="text-sm text-primary-600 mt-2 italic">📝 {lab.doctorNote.substring(0, 100)}{lab.doctorNote.length > 100 ? '...' : ''}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${lab.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {lab.status === 'completed' ? '✓ Ready' : 'Pending'}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && labs.length === 0 && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔬</span>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No lab results yet</h3>
            <p className="text-gray-600 mb-6">
              {attached 
                ? 'Your lab results will appear here once available'
                : 'You can enter lab results manually for personal tracking, or connect to a care team to receive results from your provider'
              }
            </p>
            {attached ? (
              <Button variant="outline" onClick={() => router.push('/messages/new?recipient=care-team&subject=Question about Lab Results&context=lab results')}>
                Message Your Care Team
              </Button>
            ) : (
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => router.push('/connect')}>
                  Connect to Care Team
                </Button>
                <Button variant="primary" onClick={() => router.push('/labs/enter')}>
                  Enter Lab Result
                </Button>
              </div>
            )}
          </Card>
        )}
        </main>
        <BottomNav />
      </div>
    );
  }

  return <LabsPageInner />;
}
