'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

const docTypes = [
  { value: 'discharge_summary', label: 'Discharge Summary (Hospital/ED)' },
  { value: 'insurance_front', label: 'Insurance Card - Front' },
  { value: 'insurance_back', label: 'Insurance Card - Back' },
  { value: 'id', label: 'Photo ID' },
  { value: 'referral', label: 'Referral Letter' },
  { value: 'records', label: 'Medical Records' },
  { value: 'lab_result', label: 'Lab Results' },
  { value: 'imaging', label: 'Imaging Results' },
  { value: 'other', label: 'Other' },
];

export default function UploadDocumentPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useRequireAuth();
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<PermissionState | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check camera permission status
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
        setCameraPermission(result.state);
        result.onchange = () => {
          setCameraPermission(result.state);
        };
      }).catch(() => {
        // Permissions API not fully supported, that's okay
      });
    }
  }, []);

  // Cleanup stream when component unmounts or camera closes
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [showCamera]);

  if (authLoading) {
    return null;
  }

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser. Please use file upload instead.');
      }

      // Check permission first if available
      if (cameraPermission === 'denied') {
        throw new Error('Camera permission was denied. Please enable camera access in your browser settings and try again.');
      }

      // Request camera access
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setShowCamera(true);
    } catch (error: unknown) {
      console.error('Camera error:', error);
      let errorMessage = 'Camera access denied or not available.';
      
      if (error instanceof Error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
      } else if (error instanceof Error && (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError')) {
        errorMessage = 'No camera found. Please use file upload instead.';
      } else if (error instanceof Error && (error.name === 'NotReadableError' || error.name === 'TrackStartError')) {
        errorMessage = 'Camera is already in use by another application. Please close other apps using the camera and try again.';
      } else if (error instanceof Error && (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError')) {
        errorMessage = 'Camera does not support the requested settings. Please use file upload instead.';
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      setCameraError(errorMessage);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFile(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

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
          
          {docType === 'discharge_summary' && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Discharge Summary Upload:</strong> Upload your discharge summary from a hospital or emergency department visit. 
                Your care team will review this document and update your medical records accordingly.
              </p>
            </div>
          )}

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
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${file ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'}`}>
                  <span className="text-2xl block mb-1">📤</span>
                  <p className="text-sm font-medium text-navy-600">Upload File</p>
                  <p className="text-xs text-gray-500">PDF, JPG, PNG</p>
                </label>
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={cameraPermission === 'denied'}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    cameraPermission === 'denied'
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">📷</span>
                  <p className="text-sm font-medium text-navy-600">Take Photo</p>
                  <p className="text-xs text-gray-500">
                    {cameraPermission === 'denied' ? 'Permission denied' : 'Use Camera'}
                  </p>
                </button>
              </div>
              {file && (
                <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-navy-600">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Camera Error Message */}
            {cameraError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <p className="font-semibold mb-1">⚠️ Camera Error</p>
                <p>{cameraError}</p>
                {cameraPermission === 'denied' && (
                  <p className="mt-2 text-xs">
                    To enable camera access:
                    <br />• Chrome/Edge: Click the lock icon in the address bar → Site settings → Camera → Allow
                    <br />• Firefox: Click the lock icon → Permissions → Camera → Allow
                    <br />• Safari: Safari → Settings → Websites → Camera → Allow for this site
                  </p>
                )}
              </div>
            )}

            {/* Camera Preview Modal */}
            {showCamera && (
              <div className="fixed inset-0 z-50 bg-black flex flex-col">
                <div className="flex-1 relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Camera controls overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={stopCamera}
                        className="px-6 py-3 bg-gray-600 text-white rounded-full font-medium hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={capturePhoto}
                        className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:scale-105 transition-transform"
                        aria-label="Capture photo"
                      >
                        <div className="w-full h-full bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
