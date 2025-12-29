'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

const docTypes = [
  { value: 'insurance_front', label: 'Insurance Card - Front' },
  { value: 'insurance_back', label: 'Insurance Card - Back' },
  { value: 'id', label: 'Photo ID' },
  { value: 'referral', label: 'Referral Letter' },
  { value: 'records', label: 'Medical Records' },
  { value: 'other', label: 'Other' },
];

export default function UploadDocumentPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleUpload = async () => {
    if (!docType || !file) { alert('Please select document type and file'); return; }
    setUploading(true);
    await new Promise(r => setTimeout(r, 2000));
    setUploading(false);
    alert('Document uploaded successfully!');
    router.push('/documents');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <DisclaimerBanner variant="compact" />

        <Card>
          <h1 className="text-xl font-bold text-navy-600 mb-4">Upload Document</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400">
                <option value="">Select document type</option>
                {docTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'}`}>
                <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div>
                      <span className="text-3xl">✅</span>
                      <p className="mt-2 font-medium text-navy-600">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl">📤</span>
                      <p className="mt-2 font-medium text-navy-600">Click to select file</p>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={handleUpload} isLoading={uploading} disabled={!docType || !file}>Upload Document</Button>
            </div>
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
