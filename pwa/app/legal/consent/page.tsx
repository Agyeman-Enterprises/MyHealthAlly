'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SignaturePad } from '@/components/signature/SignaturePad';

type ConsentType = 'hipaa' | 'telehealth' | 'financial' | 'treatment';

interface ConsentDocument {
  type: ConsentType;
  title: string;
  content: string;
  required: boolean;
}

const consentDocuments: Record<ConsentType, ConsentDocument> = {
  hipaa: {
    type: 'hipaa',
    title: 'HIPAA Authorization and Consent',
    required: true,
    content: `
I acknowledge that I have received and reviewed the Notice of Privacy Practices for MyHealth Ally.

I understand that:
- My health information may be used and disclosed for treatment, payment, and healthcare operations
- I have the right to request restrictions on how my information is used or disclosed
- I have the right to access and obtain a copy of my health information
- I have the right to file a complaint if I believe my privacy rights have been violated
- My information will be kept confidential and secure in accordance with HIPAA regulations

By signing below, I acknowledge that I have read and understand this authorization.
    `.trim(),
  },
  telehealth: {
    type: 'telehealth',
    title: 'Telehealth Services Consent',
    required: true,
    content: `
I consent to receive telehealth services from MyHealth Ally and its healthcare providers.

I understand that:
- Telehealth involves the use of electronic communications to enable healthcare providers to provide healthcare services to me
- I have the right to withdraw my consent at any time
- There are potential risks to using telehealth, including but not limited to: technical failures, interruption of service, unauthorized access, and lack of access to complete medical information
- Telehealth services may not be appropriate for all conditions
- In case of a medical emergency, I will call 911 or go to the nearest emergency room
- My healthcare provider will determine if my condition is appropriate for telehealth services

By signing below, I consent to receive telehealth services and acknowledge that I understand the risks and benefits.
    `.trim(),
  },
  financial: {
    type: 'financial',
    title: 'Financial Responsibility and Payment Authorization',
    required: true,
    content: `
I acknowledge and agree to the following financial terms:

1. **Payment Responsibility**: I understand that I am financially responsible for all charges for services provided, regardless of insurance coverage.

2. **Insurance**: I authorize MyHealth Ally to bill my insurance company for services rendered. I understand that I am responsible for any copayments, deductibles, or amounts not covered by insurance.

3. **Payment Methods**: I authorize MyHealth Ally to charge my credit card, debit card, or other payment method on file for any amounts due.

4. **Collection**: I understand that if my account becomes delinquent, it may be referred to a collection agency, and I may be responsible for collection fees and costs.

5. **Cancellation Policy**: I understand the cancellation and no-show policies and agree to any applicable fees.

By signing below, I acknowledge that I have read and agree to these financial terms.
    `.trim(),
  },
  treatment: {
    type: 'treatment',
    title: 'Consent for Treatment',
    required: true,
    content: `
I consent to receive medical treatment from MyHealth Ally and its healthcare providers.

I understand that:
- I have the right to receive information about my diagnosis, treatment options, risks, and benefits
- I have the right to refuse treatment or withdraw consent at any time
- I have the right to ask questions about my care
- Treatment decisions will be made in consultation with my healthcare provider
- I am responsible for following the treatment plan agreed upon with my provider

By signing below, I consent to receive medical treatment and acknowledge that I understand my rights and responsibilities.
    `.trim(),
  },
};

export default function ConsentPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const patientId = useAuthStore((state) => state.patientId);
  const [selectedConsent, setSelectedConsent] = useState<ConsentType | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedConsents, setSignedConsents] = useState<Set<ConsentType>>(new Set());

  // Helper function to get patient ID
  const getPatientId = async (): Promise<string | null> => {
    let currentPatientId = patientId;
    
    if (!currentPatientId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('id, patients(id)')
            .eq('supabase_auth_id', user.id)
            .single();
          
          if (userError) {
            console.error('Error loading user record:', userError);
            return null;
          }
          
          if (userRecord?.patients) {
            const patientsArray = Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients];
            currentPatientId = patientsArray[0]?.id;
            
            // Update auth store if we found the patient ID
            if (currentPatientId) {
              const authStore = useAuthStore.getState();
              if (authStore.user) {
                authStore.updateUser({ patientId: currentPatientId });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading patient ID:', err);
        return null;
      }
    }
    
    return currentPatientId || null;
  };

  // Load existing consents
  useEffect(() => {
    const loadConsents = async () => {
      const currentPatientId = await getPatientId();
      
      if (!currentPatientId) {
        // Don't show error, just silently fail - patient might not have completed intake yet
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('consent_signatures')
          .select('consent_type')
          .eq('patient_id', currentPatientId)
          .eq('is_active', true);
        
        if (error) {
          console.error('Error loading consents:', error);
          return;
        }
        
        if (data) {
          setSignedConsents(new Set(data.map((c: any) => c.consent_type as ConsentType)));
        }
      } catch (err) {
        console.error('Error loading consents:', err);
      }
    };
    
    if (isAuthenticated) {
      loadConsents();
    }
  }, [isAuthenticated, patientId]);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleSelectConsent = (type: ConsentType) => {
    if (signedConsents.has(type)) {
      alert('You have already signed this consent form.');
      return;
    }
    setSelectedConsent(type);
    setShowSignature(false);
    setSignatureDataUrl(null);
    setError(null);
  };

  const handleSignatureComplete = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
    setShowSignature(false);
  };

  const handleSign = async () => {
    if (!selectedConsent || !signatureDataUrl) {
      setError('Please provide your signature');
      return;
    }

    setSigning(true);
    setError(null);

    try {
      const currentPatientId = await getPatientId();
      
      if (!currentPatientId) {
        setError('Unable to find your patient record. Please complete your intake form first or contact support.');
        setSigning(false);
        return;
      }

      // Save signature to Supabase Storage
      const signatureBlob = await (await fetch(signatureDataUrl)).blob();
      const fileName = `consent-${selectedConsent}-${currentPatientId}-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('consent-signatures')
        .upload(fileName, signatureBlob, {
          contentType: 'image/png',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('consent-signatures')
        .getPublicUrl(fileName);

      // Save consent signature to database
      const { error: dbError } = await supabase
        .from('consent_signatures')
        .insert({
          patient_id: currentPatientId,
          consent_type: selectedConsent,
          signature_url: urlData.publicUrl,
          signed_at: new Date().toISOString(),
          is_active: true,
        });

      if (dbError) throw dbError;

      // Update signed consents
      setSignedConsents(new Set([...signedConsents, selectedConsent]));
      setSelectedConsent(null);
      setSignatureDataUrl(null);
      
      // Auto-sign: Check if all required consents are signed
      const requiredConsents: ConsentType[] = ['hipaa', 'telehealth', 'financial', 'treatment'];
      const newSignedSet = new Set([...signedConsents, selectedConsent]);
      const allRequiredSigned = requiredConsents.every(type => newSignedSet.has(type));
      
      if (allRequiredSigned) {
        // Mark patient as having completed all required consents
        const { error: updateError } = await supabase
          .from('patients')
          .update({ 
            onboarding_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPatientId);
        
        if (updateError) {
          console.error('Error updating onboarding status:', updateError);
          // Don't fail the whole operation if this fails
        }
      }
      
      // Show success message inline instead of alert
      setError(null);
      setSelectedConsent(null);
      setSignatureDataUrl(null);
      
      // Reload consents to update the UI
      const currentPatientIdReload = await getPatientId();
      if (currentPatientIdReload) {
        const { data } = await supabase
          .from('consent_signatures')
          .select('consent_type')
          .eq('patient_id', currentPatientIdReload)
          .eq('is_active', true);
        
        if (data) {
          setSignedConsents(new Set(data.map((c: any) => c.consent_type as ConsentType)));
        }
      }
    } catch (err: any) {
      console.error('Error signing consent:', err);
      setError(err.message || 'Failed to save signature. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const consentList = Object.values(consentDocuments);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Consent Forms" showBack />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600 mb-2">Consent Forms</h1>
          <p className="text-gray-600">
            Please review and sign the required consent forms to continue using MyHealth Ally.
          </p>
        </div>

        {error && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200">
            <div className="flex items-start justify-between">
              <p className="text-red-800 text-sm flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-600 hover:text-red-800"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          </Card>
        )}

        {!selectedConsent ? (
          <div className="space-y-4">
            {consentList.map((consent) => (
              <Card
                key={consent.type}
                hover
                className={`cursor-pointer ${
                  signedConsents.has(consent.type) ? 'bg-green-50 border-green-200' : ''
                }`}
                onClick={() => handleSelectConsent(consent.type)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-navy-600">{consent.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {consent.required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {signedConsents.has(consent.type) ? (
                      <span className="text-sm text-green-700 font-medium">✓ Signed</span>
                    ) : (
                      <span className="text-sm text-amber-700 font-medium">Not Signed</span>
                    )}
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedConsent(null);
                    setShowSignature(false);
                    setSignatureDataUrl(null);
                  }}
                >
                  ← Back to List
                </Button>
              </div>
              
              <h2 className="text-2xl font-bold text-navy-600 mb-4">
                {consentDocuments[selectedConsent].title}
              </h2>
              
              <div className="prose max-w-none mb-6">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {consentDocuments[selectedConsent].content}
                </div>
              </div>

              {!showSignature && !signatureDataUrl && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => setShowSignature(true)}
                    className="w-full"
                  >
                    Sign This Consent Form
                  </Button>
                </div>
              )}

              {showSignature && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-navy-600 mb-4">Your Signature</h3>
                  <SignaturePad
                    onSignatureComplete={handleSignatureComplete}
                    onCancel={() => setShowSignature(false)}
                  />
                </div>
              )}

              {signatureDataUrl && !showSignature && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-navy-600 mb-2">Signature Preview</h3>
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                      <img
                        src={signatureDataUrl}
                        alt="Your signature"
                        className="max-w-full h-auto"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSignatureDataUrl(null);
                        setShowSignature(true);
                      }}
                    >
                      Re-sign
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSign}
                      isLoading={signing}
                      className="flex-1"
                    >
                      Submit Signature
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
