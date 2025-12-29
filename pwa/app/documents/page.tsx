'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const mockDocs = [
  { id: '1', name: 'Insurance Card - Front', type: 'image', date: '2024-12-20', size: '1.2 MB' },
  { id: '2', name: 'Insurance Card - Back', type: 'image', date: '2024-12-20', size: '1.1 MB' },
  { id: '3', name: 'Prior Authorization Form', type: 'pdf', date: '2024-12-15', size: '245 KB' },
  { id: '4', name: 'Referral Letter', type: 'pdf', date: '2024-12-10', size: '156 KB' },
];

export default function DocumentsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [docs] = useState(mockDocs);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const hasDocs = docs.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">Documents</h1>
            <p className="text-gray-600">Upload and manage your health documents</p>
          </div>
          {hasDocs && (
            <Button variant="primary" onClick={() => router.push('/documents/upload')}>+ Upload Document</Button>
          )}
        </div>

        {loading && (
          <Card className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading documents...</p>
          </Card>
        )}

        {!loading && hasDocs && (
          <div className="space-y-3">
            {docs.map((doc) => (
              <Card key={doc.id} hover className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {doc.type === 'pdf' ? '📄' : '🖼️'}
                    </div>
                    <div>
                      <h3 className="font-medium text-navy-600">{doc.name}</h3>
                      <p className="text-sm text-gray-500">{new Date(doc.date).toLocaleDateString()} • {doc.size}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && !hasDocs && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📁</span>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-6">Upload insurance cards, referrals, and other documents</p>
            <Button variant="primary" onClick={() => router.push('/documents/upload')}>Upload Your First Document</Button>
          </Card>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
