'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface FormStatus {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'incomplete' | 'not-started';
  required: boolean;
}

export default function IntakePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const patientId = useAuthStore((state) => state.patientId);
  const [formList, setFormList] = useState<FormStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Load actual form status from database
  useEffect(() => {
    const loadFormStatus = async () => {
      let currentPatientId = patientId;
      
      if (!currentPatientId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userRecord } = await supabase
              .from('users')
              .select('id, patients(id)')
              .eq('supabase_auth_id', user.id)
              .single();
            
            if (userRecord?.patients) {
              const patientsArray = Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients];
              currentPatientId = patientsArray[0]?.id;
            }
          }
        } catch (err) {
          console.error('Error loading patient ID:', err);
        }
      }
      
      if (!currentPatientId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data: patient, error } = await supabase
          .from('patients')
          .select('first_name, last_name, date_of_birth, address, emergency_contact, insurance_type, insurance_provider, chronic_conditions, allergies, intake_completed_at')
          .eq('id', currentPatientId)
          .single();
        
        if (error) throw error;
        
        // Determine form status based on patient data
        const forms: FormStatus[] = [
          {
            id: '1',
            name: 'Patient Registration',
            description: 'Basic demographic and contact information',
            status: (patient?.first_name && patient?.last_name && patient?.date_of_birth) ? 'completed' : 'not-started',
            required: true,
          },
          {
            id: '2',
            name: 'Medical History',
            description: 'Past medical conditions, surgeries, allergies',
            status: (patient?.chronic_conditions?.length > 0 || patient?.allergies?.length > 0) ? 'completed' : 'not-started',
            required: true,
          },
          {
            id: '3',
            name: 'Medication List',
            description: 'Current medications and supplements',
            status: 'not-started', // Medications are in separate table
            required: true,
          },
          {
            id: '4',
            name: 'Insurance Information',
            description: 'Insurance cards and policy details',
            status: (patient?.insurance_type && patient?.insurance_provider) ? 'completed' : 'not-started',
            required: true,
          },
          {
            id: '5',
            name: 'HIPAA Consent',
            description: 'Privacy practices acknowledgment',
            status: 'not-started', // Would need separate tracking
            required: true,
          },
          {
            id: '6',
            name: 'Financial Agreement',
            description: 'Payment policies and authorization',
            status: 'not-started', // Would need separate tracking
            required: true,
          },
        ];
        
        setFormList(forms);
      } catch (err) {
        console.error('Error loading form status:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadFormStatus();
    }
  }, [isAuthenticated, patientId]);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const completed = formList.filter(f => f.status === 'completed').length;
  const total = formList.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Intake Forms</h1>
          <p className="text-gray-600">Complete your registration paperwork</p>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-primary-100 to-sky-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700">Progress</p>
              <p className="text-2xl font-bold text-navy-600">{completed} of {total} forms completed</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-primary-300 flex items-center justify-center">
              <span className="text-lg font-bold text-primary-600">{Math.round((completed / total) * 100)}%</span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-white rounded-full">
            <div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" style={{ width: `${(completed / total) * 100}%` }} />
          </div>
        </Card>

        {loading ? (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading form status...</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {formList.map((form) => (
                <Card
                  key={form.id}
                  hover
                  className="cursor-pointer"
                  onClick={() => {
                    if (form.id === '1' || form.id === '2' || form.id === '4') {
                      router.push('/intake/wizard');
                    } else {
                      alert(`${form.name} form coming soon!`);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        form.status === 'completed' ? 'bg-green-100 text-green-600' :
                        form.status === 'incomplete' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {form.status === 'completed' ? '✓' : form.status === 'incomplete' ? '⋯' : '○'}
                      </div>
                      <div>
                        <h3 className="font-medium text-navy-600">{form.name}</h3>
                        <p className="text-sm text-gray-500">{form.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        form.status === 'completed' ? 'bg-green-100 text-green-700' :
                        form.status === 'incomplete' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {form.status === 'completed' ? 'Completed' : form.status === 'incomplete' ? 'In Progress' : 'Not Started'}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-primary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-navy-600 font-medium">Ready to complete your intake forms?</p>
                  <p className="text-xs text-gray-600 mt-1">Use our step-by-step wizard to fill out all required information.</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push('/intake/wizard')}
                >
                  Start Intake Wizard
                </Button>
              </div>
            </Card>
          </>
        )}

        <Card className="mt-6 bg-primary-50 border-primary-200">
          <p className="text-sm text-navy-600">
            💡 <strong>Tip:</strong> Complete all forms before your first appointment to save time. You can save your progress and return later.
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
