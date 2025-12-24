'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DocumentsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: userRecord } = await supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) return [];

      const patientId = (userRecord.patients as any).id;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'insurance_card':
        return '💳';
      case 'lab_result':
        return '🔬';
      case 'imaging':
        return '📷';
      case 'doctor_note':
        return '📝';
      case 'discharge_summary':
        return '🏥';
      default:
        return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Documents" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
          <Link href="/documents/upload">
            <Button variant="primary" size="md">
              <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Document
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading documents...</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc: any) => (
              <Card key={doc.id} hover className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{getCategoryIcon(doc.document_type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-500">
                        Uploaded: {format(new Date(doc.created_at), 'PP')}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents</h3>
            <p className="text-gray-500 mb-6">Upload insurance cards, medical records, or other documents</p>
            <Link href="/documents/upload">
              <Button variant="primary" size="md">
                Upload Document
              </Button>
            </Link>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

