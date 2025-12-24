'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

type IntakeStep = 'demographics' | 'insurance' | 'medical-history' | 'emergency-contact' | 'review';

export default function IntakePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<IntakeStep>('demographics');
  const [formData, setFormData] = useState({
    // Demographics
    firstName: '',
    lastName: '',
    preferredName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    // Insurance
    insuranceType: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',
    // Medical History
    chronicConditions: [] as string[],
    allergies: [] as string[],
    currentMedications: '',
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  });

  // Load existing patient data
  const { data: patientData } = useQuery({
    queryKey: ['patient-intake'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userRecord } = await supabase
        .from('users')
        .select('id, patients(*)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) return null;
      return userRecord.patients;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (patientData) {
      setFormData({
        firstName: patientData.first_name || '',
        lastName: patientData.last_name || '',
        preferredName: patientData.preferred_name || '',
        dateOfBirth: patientData.date_of_birth || '',
        gender: patientData.gender || '',
        phone: patientData.phone || '',
        address: patientData.address || { street: '', city: '', state: '', zip: '' },
        insuranceType: patientData.insurance_type || '',
        insuranceProvider: patientData.insurance_provider || '',
        insurancePolicyNumber: patientData.insurance_policy_number || '',
        insuranceGroupNumber: patientData.insurance_group_number || '',
        chronicConditions: patientData.chronic_conditions || [],
        allergies: patientData.allergies || [],
        currentMedications: '',
        emergencyContactName: patientData.emergency_contact?.name || '',
        emergencyContactRelationship: patientData.emergency_contact?.relationship || '',
        emergencyContactPhone: patientData.emergency_contact?.phone || '',
      });
    }
  }, [patientData]);

  const saveProgressMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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

      const { error } = await supabase
        .from('patients')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          preferred_name: data.preferredName || null,
          date_of_birth: data.dateOfBirth || null,
          gender: data.gender || null,
          phone: data.phone || null,
          address: data.address,
          insurance_type: data.insuranceType || null,
          insurance_provider: data.insuranceProvider || null,
          insurance_policy_number: data.insurancePolicyNumber || null,
          insurance_group_number: data.insuranceGroupNumber || null,
          chronic_conditions: data.chronicConditions,
          allergies: data.allergies,
          emergency_contact: {
            name: data.emergencyContactName || null,
            relationship: data.emergencyContactRelationship || null,
            phone: data.emergencyContactPhone || null,
          },
        })
        .eq('id', patientId);

      if (error) throw error;
    },
  });

  const submitIntakeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await saveProgressMutation.mutateAsync(data);
      
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

      const { error } = await supabase
        .from('patients')
        .update({
          intake_completed_at: new Date().toISOString(),
        })
        .eq('id', patientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-intake'] });
      router.push('/dashboard?intake-complete=true');
    },
  });

  const steps: { key: IntakeStep; label: string }[] = [
    { key: 'demographics', label: 'Demographics' },
    { key: 'insurance', label: 'Insurance' },
    { key: 'medical-history', label: 'Medical History' },
    { key: 'emergency-contact', label: 'Emergency Contact' },
    { key: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].key);
      saveProgressMutation.mutate(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  const handleSubmit = () => {
    submitIntakeMutation.mutate(formData);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Patient Intake" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index <= currentStepIndex
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="text-xs mt-2 text-center text-gray-600">{step.label}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card variant="elevated" className="p-6">
          {currentStep === 'demographics' && (
            <DemographicsStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'insurance' && (
            <InsuranceStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'medical-history' && (
            <MedicalHistoryStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'emergency-contact' && (
            <EmergencyContactStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'review' && (
            <ReviewStep formData={formData} />
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>
            {currentStep === 'review' ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={submitIntakeMutation.isPending}
              >
                Submit Intake
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

// Step Components
function DemographicsStep({ formData, setFormData }: { formData: any; setFormData: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Demographics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="firstName"
          name="firstName"
          label="First Name *"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        <Input
          id="lastName"
          name="lastName"
          label="Last Name *"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
        <Input
          id="preferredName"
          name="preferredName"
          label="Preferred Name"
          value={formData.preferredName}
          onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
        />
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          label="Date of Birth *"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
        <Input
          id="phone"
          name="phone"
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
        <div className="space-y-4">
          <Input
            id="street"
            name="street"
            label="Street Address"
            value={formData.address.street}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="city"
              name="city"
              label="City"
              value={formData.address.city}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
            />
            <Input
              id="state"
              name="state"
              label="State"
              value={formData.address.state}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
            />
            <Input
              id="zip"
              name="zip"
              label="ZIP Code"
              value={formData.address.zip}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zip: e.target.value } })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InsuranceStep({ formData, setFormData }: { formData: any; setFormData: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Insurance Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Type</label>
          <select
            value={formData.insuranceType}
            onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
          >
            <option value="">Select</option>
            <option value="medicare">Medicare</option>
            <option value="medicaid">Medicaid</option>
            <option value="private">Private Insurance</option>
            <option value="none">No Insurance</option>
          </select>
        </div>
        <Input
          id="insuranceProvider"
          name="insuranceProvider"
          label="Insurance Provider"
          value={formData.insuranceProvider}
          onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
        />
        <Input
          id="insurancePolicyNumber"
          name="insurancePolicyNumber"
          label="Policy Number"
          value={formData.insurancePolicyNumber}
          onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
        />
        <Input
          id="insuranceGroupNumber"
          name="insuranceGroupNumber"
          label="Group Number"
          value={formData.insuranceGroupNumber}
          onChange={(e) => setFormData({ ...formData, insuranceGroupNumber: e.target.value })}
        />
      </div>
    </div>
  );
}

function MedicalHistoryStep({ formData, setFormData }: { formData: any; setFormData: any }) {
  const commonConditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'COPD',
    'Arthritis', 'Depression', 'Anxiety', 'High Cholesterol', 'Obesity'
  ];

  const commonAllergies = [
    'Penicillin', 'Sulfa', 'Aspirin', 'Ibuprofen', 'Latex',
    'Shellfish', 'Peanuts', 'Dairy', 'Eggs', 'Soy'
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Medical History</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
        <div className="grid grid-cols-2 gap-2">
          {commonConditions.map((condition) => (
            <label key={condition} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.chronicConditions.includes(condition)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, chronicConditions: [...formData.chronicConditions, condition] });
                  } else {
                    setFormData({ ...formData, chronicConditions: formData.chronicConditions.filter((c: string) => c !== condition) });
                  }
                }}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700">{condition}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
        <div className="grid grid-cols-2 gap-2">
          {commonAllergies.map((allergy) => (
            <label key={allergy} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.allergies.includes(allergy)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, allergies: [...formData.allergies, allergy] });
                  } else {
                    setFormData({ ...formData, allergies: formData.allergies.filter((a: string) => a !== allergy) });
                  }
                }}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700">{allergy}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
        <textarea
          value={formData.currentMedications}
          onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
          placeholder="List current medications and dosages..."
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
          rows={4}
        />
      </div>
    </div>
  );
}

function EmergencyContactStep({ formData, setFormData }: { formData: any; setFormData: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Emergency Contact</h2>
      <div className="space-y-4">
        <Input
          id="emergencyContactName"
          name="emergencyContactName"
          label="Contact Name *"
          value={formData.emergencyContactName}
          onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
          required
        />
        <Input
          id="emergencyContactRelationship"
          name="emergencyContactRelationship"
          label="Relationship *"
          value={formData.emergencyContactRelationship}
          onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
          required
        />
        <Input
          id="emergencyContactPhone"
          name="emergencyContactPhone"
          label="Phone Number *"
          type="tel"
          value={formData.emergencyContactPhone}
          onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
          required
        />
      </div>
    </div>
  );
}

function ReviewStep({ formData }: { formData: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Review Your Information</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Demographics</h3>
          <p className="text-sm text-gray-600">{formData.firstName} {formData.lastName}</p>
          {formData.preferredName && <p className="text-sm text-gray-600">Preferred: {formData.preferredName}</p>}
          <p className="text-sm text-gray-600">DOB: {formData.dateOfBirth}</p>
          <p className="text-sm text-gray-600">Phone: {formData.phone}</p>
        </div>
        {formData.insuranceType && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Insurance</h3>
            <p className="text-sm text-gray-600">{formData.insuranceType}</p>
            {formData.insuranceProvider && <p className="text-sm text-gray-600">Provider: {formData.insuranceProvider}</p>}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Medical History</h3>
          {formData.chronicConditions.length > 0 && (
            <p className="text-sm text-gray-600">Conditions: {formData.chronicConditions.join(', ')}</p>
          )}
          {formData.allergies.length > 0 && (
            <p className="text-sm text-gray-600">Allergies: {formData.allergies.join(', ')}</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Emergency Contact</h3>
          <p className="text-sm text-gray-600">{formData.emergencyContactName}</p>
          <p className="text-sm text-gray-600">{formData.emergencyContactRelationship}</p>
          <p className="text-sm text-gray-600">{formData.emergencyContactPhone}</p>
        </div>
      </div>
    </div>
  );
}

