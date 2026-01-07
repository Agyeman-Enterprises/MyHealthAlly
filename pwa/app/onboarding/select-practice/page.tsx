/**
 * Onboarding: Select Care Team
 * 
 * First-time user flow: User must select either:
 * 1. A predefined practice (Ohimaa, MedRx, BookADoc2U)
 * 2. A custom care team (with practice details input)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { attachPractice } from '@/lib/attachPractice';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { supabase } from '@/lib/supabase/client';
import type { Patient } from '@/lib/supabase/types';

// Predefined practice IDs
const OHIMAA_PRACTICE_ID = 'ohimaa-practice-id';
const MEDRX_PRACTICE_ID = 'medrx-practice-id';
const BOOKADOC2U_PRACTICE_ID = 'bookadoc2u-practice-id';

interface RegisteredPractice {
  id: string;
  practice_id: string;
  name: string;
  description?: string;
  specialty?: string;
  is_featured: boolean;
}

type PracticeOption = 'ohimaa' | 'medrx' | 'bookadoc2u' | string | 'custom' | null; // string for registered practice IDs

export default function OnboardingSelectPracticePage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();
  const [selectedOption, setSelectedOption] = useState<PracticeOption>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredPractices, setRegisteredPractices] = useState<RegisteredPractice[]>([]);
  const [loadingPractices, setLoadingPractices] = useState(true);
  
  // Custom practice form data
  const [customPractice, setCustomPractice] = useState({
    practiceId: '',
    practiceName: '',
  });

  // Load registered practices from database
  useEffect(() => {
    const loadPractices = async () => {
      if (isLoading) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('practices')
          .select('id, practice_id, name, description, specialty, is_featured')
          .eq('status', 'approved')
          .eq('is_public', true)
          .order('is_featured', { ascending: false })
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        setRegisteredPractices(data || []);
      } catch (err) {
        console.error('Error loading practices:', err);
        // Continue even if loading fails
      } finally {
        setLoadingPractices(false);
      }
    };

    loadPractices();
  }, [isLoading]);

  // Check if user is already attached (shouldn't be here if attached, but safety check)
  useEffect(() => {
    const checkAttachment = async () => {
      if (isLoading) return;
      
      try {
        const { patient } = await getCurrentUserAndPatient();
        if (patient?.attachment_status === 'ATTACHED' && patient?.practice_id) {
          // Already attached, redirect to dashboard
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Error checking attachment:', err);
      }
    };

    checkAttachment();
  }, [isLoading, router]);

  if (isLoading || loadingPractices) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading practices...</p>
        </div>
      </div>
    );
  }

  const handlePracticeSelection = async (practiceId: string, practiceName: string, source: 'OHIMAA' | 'MEDRX' | 'BOOKADOC2U' | 'REGISTERED' | 'OTHER') => {
    setConnecting(true);
    setError(null);

    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          setError('Your session has expired. Please log in again.');
          setConnecting(false);
          router.push('/auth/login');
          return;
        }
      }

      const { user, patient } = await getCurrentUserAndPatient();

      if (!user || !patient) {
        setError('User or patient data not found. Please complete your profile first.');
        setConnecting(false);
        return;
      }

      const userData: { id: string; email: string; firstName?: string; lastName?: string; phone?: string | null } = {
        id: user.id,
        email: user.email || '',
      };
      if (user.firstName) userData.firstName = user.firstName;
      if (user.lastName) userData.lastName = user.lastName;
      if (user.phone !== undefined) userData.phone = user.phone;
      
      await attachPractice({
        user: userData,
        patient: patient as Patient,
        practiceId,
        practiceName,
        consentAccepted: true,
        source,
      });

      // Redirect to dashboard after successful attachment
      router.push('/dashboard');
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnecting(false);
    }
  };

  const handleCustomPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customPractice.practiceId.trim() || !customPractice.practiceName.trim()) {
      setError('Please fill in both practice ID and practice name');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          setError('Your session has expired. Please log in again.');
          setConnecting(false);
          router.push('/auth/login');
          return;
        }
      }

      const { user, patient } = await getCurrentUserAndPatient();

      if (!user || !patient) {
        setError('User or patient data not found. Please complete your profile first.');
        setConnecting(false);
        return;
      }

      const userData: { id: string; email: string; firstName?: string; lastName?: string; phone?: string | null } = {
        id: user.id,
        email: user.email || '',
      };
      if (user.firstName) userData.firstName = user.firstName;
      if (user.lastName) userData.lastName = user.lastName;
      if (user.phone !== undefined) userData.phone = user.phone;
      
      await attachPractice({
        user: userData,
        patient: patient as Patient,
        practiceId: customPractice.practiceId.trim(),
        practiceName: customPractice.practiceName.trim(),
        consentAccepted: true,
        source: 'OTHER',
      });

      // Redirect to dashboard after successful attachment
      router.push('/dashboard');
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Select Your Care Team" />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600 mb-4">Welcome to MyHealthAlly</h1>
          <p className="text-gray-600 mb-6">
            To get started, please select your care team. This will connect you to your healthcare providers and unlock all app features.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <h2 className="font-semibold text-navy-600 mb-3">Select a Practice:</h2>
            
            {/* Featured/Predefined Practices */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Featured Practices</h3>
              
              <Card 
                hover 
                className={`cursor-pointer transition-all ${
                  selectedOption === 'ohimaa' ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                }`}
                onClick={() => setSelectedOption('ohimaa')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-navy-600">Ohimaa GU Functional Medicine</h3>
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">Featured</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Primary care and functional medicine</p>
                  </div>
                  {selectedOption === 'ohimaa' && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>

              <Card 
                hover 
                className={`cursor-pointer transition-all ${
                  selectedOption === 'medrx' ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                }`}
                onClick={() => setSelectedOption('medrx')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-navy-600">MedRx</h3>
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">Featured</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Pharmacy and medication management</p>
                  </div>
                  {selectedOption === 'medrx' && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>

              <Card 
                hover 
                className={`cursor-pointer transition-all ${
                  selectedOption === 'bookadoc2u' ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                }`}
                onClick={() => setSelectedOption('bookadoc2u')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-navy-600">BookADoc2U</h3>
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">Featured</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Healthcare services and appointments</p>
                  </div>
                  {selectedOption === 'bookadoc2u' && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Registered Practices from Database */}
            {registeredPractices.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Available Practices</h3>
                {registeredPractices.map((practice) => (
                  <Card 
                    key={practice.id}
                    hover 
                    className={`cursor-pointer transition-all ${
                      selectedOption === practice.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                    }`}
                    onClick={() => setSelectedOption(practice.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-navy-600">{practice.name}</h3>
                          {practice.is_featured && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">Featured</span>
                          )}
                        </div>
                        {practice.description && (
                          <p className="text-sm text-gray-500 mt-1">{practice.description}</p>
                        )}
                        {practice.specialty && (
                          <p className="text-xs text-gray-400 mt-1">{practice.specialty}</p>
                        )}
                      </div>
                      {selectedOption === practice.id && (
                        <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Custom Care Team Option */}
            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Other Options</h3>
              
              <Card 
                hover 
                className={`cursor-pointer transition-all ${
                  selectedOption === 'custom' ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                }`}
                onClick={() => setSelectedOption('custom')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-navy-600">Custom Care Team</h3>
                    <p className="text-sm text-gray-500 mt-1">Connect to your designated care team with a practice ID</p>
                  </div>
                  {selectedOption === 'custom' && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>

              <Card 
                hover 
                className="cursor-pointer border-2 border-dashed border-primary-300 hover:border-primary-400"
                onClick={() => router.push('/practices/register')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-navy-600">Register Your Practice</h3>
                    <p className="text-sm text-gray-500 mt-1">Are you a practice? Register to be listed here</p>
                  </div>
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </div>
          </div>

          {/* Action Buttons for Practice Selection */}
          {selectedOption && selectedOption !== 'custom' && (
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={async () => {
                  let practiceId: string;
                  let practiceName: string;
                  let source: 'OHIMAA' | 'MEDRX' | 'BOOKADOC2U' | 'REGISTERED' | 'OTHER';

                  if (selectedOption === 'ohimaa') {
                    practiceId = OHIMAA_PRACTICE_ID;
                    practiceName = 'Ohimaa GU Functional Medicine';
                    source = 'OHIMAA';
                  } else if (selectedOption === 'medrx') {
                    practiceId = MEDRX_PRACTICE_ID;
                    practiceName = 'MedRx';
                    source = 'MEDRX';
                  } else if (selectedOption === 'bookadoc2u') {
                    practiceId = BOOKADOC2U_PRACTICE_ID;
                    practiceName = 'BookADoc2U';
                    source = 'BOOKADOC2U';
                  } else {
                    // Registered practice - pass UUID to attachPractice, it will resolve to practice_id string
                    const practice = registeredPractices.find(p => p.id === selectedOption);
                    if (!practice) {
                      setError('Practice not found');
                      setConnecting(false);
                      return;
                    }
                    // Pass the UUID (practice.id) - attachPractice will look it up and get practice_id string
                    practiceId = practice.id; // UUID from practices table (attachPractice will resolve to practice_id string)
                    practiceName = practice.name;
                    source = 'REGISTERED';
                  }

                  await handlePracticeSelection(practiceId, practiceName, source);
                }}
                isLoading={connecting}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : `Continue with ${(() => {
                  if (selectedOption === 'ohimaa') return 'Ohimaa';
                  if (selectedOption === 'medrx') return 'MedRx';
                  if (selectedOption === 'bookadoc2u') return 'BookADoc2U';
                  const practice = registeredPractices.find(p => p.id === selectedOption);
                  return practice?.name || 'Selected Practice';
                })()}`}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedOption(null)}
                disabled={connecting}
              >
                Change Selection
              </Button>
            </div>
          )}

          {/* Custom Practice Form */}
          {selectedOption === 'custom' && (
            <form onSubmit={handleCustomPractice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice ID *
                </label>
                <Input
                  type="text"
                  value={customPractice.practiceId}
                  onChange={(e) => setCustomPractice({ ...customPractice, practiceId: e.target.value })}
                  placeholder="Enter practice ID"
                  disabled={connecting}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Get this from your care team</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice Name *
                </label>
                <Input
                  type="text"
                  value={customPractice.practiceName}
                  onChange={(e) => setCustomPractice({ ...customPractice, practiceName: e.target.value })}
                  placeholder="Enter practice name"
                  disabled={connecting}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={connecting}
                  disabled={connecting || !customPractice.practiceId.trim() || !customPractice.practiceName.trim()}
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOption(null)}
                  disabled={connecting}
                >
                  Back
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Once you select a care team, you&apos;ll have full access to all app features including messages, 
            lab results, medications, and appointments. You can change your care team later in settings.
          </p>
        </Card>
      </main>
    </div>
  );
}
