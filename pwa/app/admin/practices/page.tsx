/**
 * Admin: Practice Management
 * 
 * Admin interface to view, approve, and manage practice registrations
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { format } from 'date-fns';

interface Practice {
  id: string;
  practice_id: string;
  name: string;
  description?: string;
  specialty?: string;
  status: string;
  is_featured: boolean;
  is_public: boolean;
  registered_at: string;
  approved_at?: string;
  patient_count: number;
}

export default function AdminPracticesPage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'active'>('all');

  useEffect(() => {
    const checkAdmin = async () => {
      if (isLoading) return;

      try {
        const { user } = await getCurrentUserAndPatient();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Check if user is admin
        const { data: userRecord } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userRecord?.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        loadPractices();
      } catch (err) {
        console.error('Error checking admin status:', err);
        router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [isLoading, router]);

  const loadPractices = async () => {
    try {
      let query = supabase
        .from('practices')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPractices(data || []);
    } catch (err) {
      console.error('Error loading practices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load practices');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (practiceId: string) => {
    try {
      const { user } = await getCurrentUserAndPatient();
      if (!user) return;

      const { error: updateError } = await supabase
        .from('practices')
        .update({
          status: 'approved',
          approved_by_user_id: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', practiceId);

      if (updateError) throw updateError;

      // Reload practices
      await loadPractices();
    } catch (err) {
      console.error('Error approving practice:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve practice');
    }
  };

  const handleReject = async (practiceId: string) => {
    if (!confirm('Are you sure you want to reject this practice registration?')) return;

    try {
      const { error: updateError } = await supabase
        .from('practices')
        .update({
          status: 'inactive',
        })
        .eq('id', practiceId);

      if (updateError) throw updateError;

      await loadPractices();
    } catch (err) {
      console.error('Error rejecting practice:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject practice');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Practice Management" showBack />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">Practice Management</h1>
            <p className="text-gray-600 mt-1">Manage practice registrations and approvals</p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {(['all', 'pending', 'approved', 'active'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                loadPractices();
              }}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                filter === f
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({practices.filter(p => f === 'all' || p.status === f).length})
            </button>
          ))}
        </div>

        {/* Practices List */}
        {practices.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No practices found</h3>
            <p className="text-gray-600">No practices match the current filter.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {practices.map((practice) => (
              <Card key={practice.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-navy-600">{practice.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        practice.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : practice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {practice.status}
                      </span>
                      {practice.is_featured && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Practice ID:</strong> {practice.practice_id}
                    </p>
                    {practice.description && (
                      <p className="text-sm text-gray-600 mb-1">{practice.description}</p>
                    )}
                    {practice.specialty && (
                      <p className="text-sm text-gray-500">{practice.specialty}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Patients</p>
                    <p className="font-medium">{practice.patient_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Registered</p>
                    <p className="font-medium">{format(new Date(practice.registered_at), 'MMM d, yyyy')}</p>
                  </div>
                  {practice.approved_at && (
                    <div>
                      <p className="text-gray-500">Approved</p>
                      <p className="font-medium">{format(new Date(practice.approved_at), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Visibility</p>
                    <p className="font-medium">{practice.is_public ? 'Public' : 'Private'}</p>
                  </div>
                </div>

                {practice.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(practice.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(practice.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
