'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

const DOCUMENT_TYPES = [
  { value: 'insurance_card', label: 'Insurance Card' },
  { value: 'lab_result', label: 'Lab Result' },
  { value: 'imaging', label: 'Imaging Report' },
  { value: 'doctor_note', label: 'Doctor Note' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'other', label: 'Other' },
];

export default function UploadDocumentPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    documentType: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, formData }: { file: File; formData: typeof formData }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRecord } = await supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) {
        throw new Error('Patient record not found');
      }

      const patientId = (userRecord.patients as any).id;

      // Upload file to Supabase Storage
      const fileName = `documents/${patientId}/${Date.now()}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-uploads')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('patient-uploads')
        .getPublicUrl(fileName);

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          patient_id: patientId,
          document_type: formData.documentType,
          title: formData.title || file.name,
          description: formData.description || null,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          source: 'upload',
          uploaded_by: userRecord.id,
          status: 'active',
        })
        .select()
        .single();

      if (docError) throw docError;
      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      router.push('/documents?upload-success=true');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or image file (JPEG, PNG)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      if (!formData.title) {
        setFormData({ ...formData, title: file.name });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    if (!formData.documentType) {
      alert('Please select a document type');
      return;
    }
    uploadDocumentMutation.mutate({ file: selectedFile, formData });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Upload Document" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        <Card variant="elevated" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                required
              >
                <option value="">Select document type</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="title"
              name="title"
              label="Document Title *"
              type="text"
              placeholder="e.g., Insurance Card Front"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-500 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                  {selectedFile && (
                    <p className="text-sm text-primary-600 mt-2">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any notes about this document..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={uploadDocumentMutation.isPending}
                disabled={!selectedFile || !formData.documentType || !formData.title}
              >
                Upload Document
              </Button>
            </div>
          </form>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

