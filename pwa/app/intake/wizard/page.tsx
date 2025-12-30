'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MedicationLogger } from '@/components/medications/MedicationLogger';

type IntakeStep = 'demographics' | 'address' | 'emergency' | 'insurance' | 'medical' | 'review';

interface IntakeData {
  // Demographics
  firstName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  gender: string;
  heightInches: string;
  
  // Address
  street1: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyEmail: string;
  
  // Insurance
  insuranceType: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  
  // Medical
  chronicConditions: string[];
  allergies: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
  medications: Array<{
    id?: string;
    name: string;
    dosage: string;
    dosageUnit: string;
    frequency: string;
    route?: string;
    instructions?: string;
  }>;
}

export default function IntakeWizardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const patientId = useAuthStore((state) => state.patientId);
  const [currentStep, setCurrentStep] = useState<IntakeStep>('demographics');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  
  const [formData, setFormData] = useState<IntakeData>({
    firstName: '',
    lastName: '',
    preferredName: '',
    dateOfBirth: '',
    gender: '',
    heightInches: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    emergencyEmail: '',
    insuranceType: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',
    chronicConditions: [],
    allergies: [],
    medications: [],
  });

  // Load existing patient data
  useEffect(() => {
    const loadPatientData = async () => {
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
      
      if (!currentPatientId) return;
      
      try {
        const { data: patient, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', currentPatientId)
          .single();
        
        if (error) throw error;
        
        // Load existing medications
        const { data: existingMedications } = await supabase
          .from('medications')
          .select('id, name, dosage, dosage_unit, frequency, route, instructions')
          .eq('patient_id', currentPatientId)
          .eq('is_active', true);
        
        if (patient) {
          setFormData({
            firstName: patient.first_name || '',
            lastName: patient.last_name || '',
            preferredName: patient.preferred_name || '',
            dateOfBirth: patient.date_of_birth || '',
            gender: patient.gender || '',
            heightInches: patient.height_inches ? patient.height_inches.toString() : '',
            street1: patient.address?.street1 || '',
            street2: patient.address?.street2 || '',
            city: patient.address?.city || '',
            state: patient.address?.state || '',
            zipCode: patient.address?.zipCode || '',
            country: patient.address?.country || 'USA',
            emergencyName: patient.emergency_contact?.name || '',
            emergencyRelationship: patient.emergency_contact?.relationship || '',
            emergencyPhone: patient.emergency_contact?.phone || '',
            emergencyEmail: patient.emergency_contact?.email || '',
            insuranceType: patient.insurance_type || '',
            insuranceProvider: patient.insurance_provider || '',
            insurancePolicyNumber: patient.insurance_policy_number || '',
            insuranceGroupNumber: patient.insurance_group_number || '',
            chronicConditions: patient.chronic_conditions || [],
            allergies: patient.allergies || [],
            medications: (existingMedications || []).map((m) => ({
              id: m.id,
              name: m.name,
              dosage: m.dosage,
              dosageUnit: m.dosage_unit,
              frequency: m.frequency,
              route: m.route,
              instructions: m.instructions,
            })),
          });
        }
      } catch (err) {
        console.error('Error loading patient data:', err);
      }
    };
    
    if (isAuthenticated) {
      loadPatientData();
    }
  }, [isAuthenticated, patientId]);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const steps: IntakeStep[] = ['demographics', 'address', 'emergency', 'insurance', 'medical', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  const goNext = () => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) setCurrentStep(nextStep);
  };

  const goPrev = () => {
    const prevStep = steps[currentStepIndex - 1];
    if (prevStep) setCurrentStep(prevStep);
  };

  const startVoiceCommand = () => {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined' &&
      ((window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
        (window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
    if (!SpeechRecognitionCtor) {
      setError('Voice input not supported in this browser.');
      return;
    }
    try {
      const recognition = new (SpeechRecognitionCtor as {
        new (): {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: ((event: unknown) => void) | null;
          onerror: ((event: { error?: string }) => void) | null;
          onend: (() => void) | null;
        };
      })();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = true;
      setIsDictating(true);
      recognition.onresult = (event) => {
        const evt = event as { results: Array<unknown> };
        const res = evt.results?.[0] as unknown as { [key: number]: { transcript: string } } | undefined;
        const transcript = res?.[0]?.transcript || '';
        const lower = transcript.toLowerCase();
        if (lower.includes('next')) goNext();
        if (lower.includes('back') || lower.includes('previous')) goPrev();
      };
      recognition.onerror = () => {};
      recognition.onend = () => setIsDictating(false);
      recognition.start();
    } catch (err) {
      setIsDictating(false);
      setError(err instanceof Error ? err.message : 'Unable to start voice command.');
    }
  };

  const saveProgress = async (partialData?: Partial<IntakeData>) => {
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
            throw new Error('Unable to load your account. Please try refreshing the page.');
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
      } catch (err: unknown) {
        console.error('Error loading patient ID:', err);
        throw err; // Re-throw to be handled by caller
      }
    }
    
    if (!currentPatientId) {
      throw new Error('Patient record not found. Please complete your registration first.');
    }

    const dataToSave = { ...formData, ...partialData };
    
    const updateData: Record<string, unknown> = {
      first_name: dataToSave.firstName,
      last_name: dataToSave.lastName,
      preferred_name: dataToSave.preferredName || null,
      date_of_birth: dataToSave.dateOfBirth || null,
      gender: dataToSave.gender || null,
      height_inches: dataToSave.heightInches ? parseFloat(dataToSave.heightInches) : null,
      address: {
        street1: dataToSave.street1,
        street2: dataToSave.street2 || undefined,
        city: dataToSave.city,
        state: dataToSave.state,
        zipCode: dataToSave.zipCode,
        country: dataToSave.country,
      },
      emergency_contact: {
        name: dataToSave.emergencyName,
        relationship: dataToSave.emergencyRelationship,
        phone: dataToSave.emergencyPhone,
        email: dataToSave.emergencyEmail || undefined,
      },
      insurance_type: dataToSave.insuranceType || null,
      insurance_provider: dataToSave.insuranceProvider || null,
      insurance_policy_number: dataToSave.insurancePolicyNumber || null,
      insurance_group_number: dataToSave.insuranceGroupNumber || null,
      chronic_conditions: dataToSave.chronicConditions,
      allergies: dataToSave.allergies,
    };

    const { error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', currentPatientId);

    if (error) throw error;

    // Save medications to medications table
    if (dataToSave.medications && dataToSave.medications.length > 0) {
      // Get existing medication IDs to track what to keep
      const { data: existingMeds } = await supabase
        .from('medications')
        .select('id')
        .eq('patient_id', currentPatientId)
        .eq('is_active', true);

      type MedicationIdRow = { id: string };
      const existingIds = new Set((existingMeds || []).map((m: MedicationIdRow) => m.id));

      // Upsert medications
      for (const med of dataToSave.medications) {
        const medicationData: Record<string, unknown> = {
          patient_id: currentPatientId,
          name: med.name,
          dosage: med.dosage || '',
          dosage_unit: med.dosageUnit || 'mg',
          frequency: med.frequency || '',
          route: med.route || 'oral',
          instructions: med.instructions || null,
          is_active: true,
        };

        if (med.id && existingIds.has(med.id)) {
          // Update existing medication
          const { error: updateError } = await supabase
            .from('medications')
            .update(medicationData)
            .eq('id', med.id);

          if (updateError) console.error('Error updating medication:', updateError);
        } else {
          // Insert new medication
          const { error: insertError } = await supabase
            .from('medications')
            .insert(medicationData);

          if (insertError) console.error('Error inserting medication:', insertError);
        }
      }

      // Mark medications not in the list as inactive
      const currentMedIds = new Set((dataToSave.medications.map((m) => m.id).filter(Boolean) as string[]));
      const toDeactivate = (existingMeds || []).filter((m: MedicationIdRow) => !currentMedIds.has(m.id));
      
      if (toDeactivate.length > 0) {
        await supabase
          .from('medications')
          .update({ is_active: false })
          .in('id', toDeactivate.map((m: MedicationIdRow) => m.id));
      }
    }
  };

  const handleNext = async () => {
    setError(null);
    
    // Validate current step
    if (currentStep === 'demographics') {
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
        setError('Please fill in all required fields');
        return;
      }
    }
    
    if (currentStep === 'address') {
      if (!formData.street1 || !formData.city || !formData.state || !formData.zipCode) {
        setError('Please fill in all required address fields');
        return;
      }
    }
    
    if (currentStep === 'emergency') {
      if (!formData.emergencyName || !formData.emergencyRelationship || !formData.emergencyPhone) {
        setError('Please fill in all required emergency contact fields');
        return;
      }
    }

    // Save progress
    try {
      setSaving(true);
      await saveProgress();
      
      // Move to next step
      if (currentStepIndex < steps.length - 1) {
          const nextStep = steps[currentStepIndex + 1];
          if (nextStep) {
            setCurrentStep(nextStep);
          }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save progress';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep);
      }
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    
    try {
      // Use saveProgress which already handles patient ID loading
      await saveProgress();
      
      // Get patient ID after saveProgress (it updates the store)
      let currentPatientId = patientId;
      if (!currentPatientId) {
        const authStore = useAuthStore.getState();
        currentPatientId = authStore.patientId;
      }
      
      if (!currentPatientId) {
        // Try one more time to get it
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
        setError('Unable to find your patient record. Please try refreshing the page or contact support.');
        setSaving(false);
        return;
      }
      
      // Mark intake as completed
      const { error } = await supabase
        .from('patients')
        .update({ intake_completed_at: new Date().toISOString() })
        .eq('id', currentPatientId);

      if (error) {
        console.error('Error updating intake completion:', error);
        setError('Failed to mark intake as complete. Your data has been saved.');
        setSaving(false);
        return;
      }

      // Show success message inline instead of alert
      setError(null);
      router.push('/intake');
    } catch (err: unknown) {
      console.error('Error submitting intake:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit intake forms. Please try again.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'demographics':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-navy-600">Demographics</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <Input
              label="Preferred Name"
              value={formData.preferredName}
              onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date of Birth *"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <Input
              label="Height (inches)"
              type="number"
              value={formData.heightInches}
              onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
            />
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-navy-600">Address</h2>
            <Input
              label="Street Address *"
              value={formData.street1}
              onChange={(e) => setFormData({ ...formData, street1: e.target.value })}
              required
            />
            <Input
              label="Apartment/Unit"
              value={formData.street2}
              onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City *"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                label="State *"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ZIP Code *"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                required
              />
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-navy-600">Emergency Contact</h2>
            <Input
              label="Contact Name *"
              value={formData.emergencyName}
              onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              required
            />
            <Input
              label="Relationship *"
              value={formData.emergencyRelationship}
              onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
              placeholder="e.g., Spouse, Parent, Friend"
              required
            />
            <Input
              label="Phone *"
              type="tel"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.emergencyEmail}
              onChange={(e) => setFormData({ ...formData, emergencyEmail: e.target.value })}
            />
          </div>
        );

      case 'insurance':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-navy-600">Insurance Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Type</label>
              <select
                value={formData.insuranceType}
                onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400"
              >
                <option value="">Select</option>
                <option value="private">Private Insurance</option>
                <option value="medicare">Medicare</option>
                <option value="medicaid">Medicaid</option>
                <option value="tricare">Tricare</option>
                <option value="self_pay">Self Pay</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input
              label="Insurance Provider"
              value={formData.insuranceProvider}
              onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
            />
            <Input
              label="Policy Number"
              value={formData.insurancePolicyNumber}
              onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
            />
            <Input
              label="Group Number"
              value={formData.insuranceGroupNumber}
              onChange={(e) => setFormData({ ...formData, insuranceGroupNumber: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              💡 You can upload insurance card images in the Documents section.
            </p>
          </div>
        );

      case 'medical':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy-600">Medical Information</h2>
            
            {/* Chronic Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chronic Conditions (comma-separated)
              </label>
              <textarea
                value={formData.chronicConditions.join(', ')}
                onChange={(e) => {
                  const conditions = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                  setFormData({ ...formData, chronicConditions: conditions });
                }}
                placeholder="e.g., Diabetes, Hypertension, Asthma"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400"
                rows={3}
              />
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
              {formData.allergies.map((allergy, index) => (
                <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      label="Allergen"
                      value={allergy.allergen}
                      onChange={(e) => {
                        const newAllergies = [...formData.allergies];
                        const targetAllergy = newAllergies[index];
                        if (targetAllergy) {
                          targetAllergy.allergen = e.target.value;
                          setFormData({ ...formData, allergies: newAllergies });
                        }
                      }}
                    />
                    <Input
                      label="Reaction"
                      value={allergy.reaction}
                      onChange={(e) => {
                        const newAllergies = [...formData.allergies];
                        const targetAllergy = newAllergies[index];
                        if (targetAllergy) {
                          targetAllergy.reaction = e.target.value;
                          setFormData({ ...formData, allergies: newAllergies });
                        }
                      }}
                    />
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Severity</label>
                      <select
                        value={allergy.severity}
                        onChange={(e) => {
                          const newAllergies = [...formData.allergies];
                          const targetAllergy = newAllergies[index];
                          if (targetAllergy) {
                            targetAllergy.severity = e.target.value as 'mild' | 'moderate' | 'severe';
                            setFormData({ ...formData, allergies: newAllergies });
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newAllergies = formData.allergies.filter((_, i) => i !== index);
                      setFormData({ ...formData, allergies: newAllergies });
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    allergies: [...formData.allergies, { allergen: '', reaction: '', severity: 'mild' }],
                  });
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Allergy
              </button>
            </div>

            {/* Medications */}
            <div>
              <MedicationLogger
                medications={formData.medications}
                onMedicationsChange={(medications) => {
                  setFormData({ ...formData, medications });
                }}
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-navy-600">Review & Submit</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-navy-600 mb-2">Demographics</h3>
                <p className="text-sm text-gray-600">
                  {formData.firstName} {formData.lastName}
                  {formData.preferredName && ` (${formData.preferredName})`}
                </p>
                <p className="text-sm text-gray-600">DOB: {formData.dateOfBirth}</p>
                {formData.gender && <p className="text-sm text-gray-600">Gender: {formData.gender}</p>}
              </div>
              
              <div>
                <h3 className="font-semibold text-navy-600 mb-2">Address</h3>
                <p className="text-sm text-gray-600">
                  {formData.street1}
                  {formData.street2 && `, ${formData.street2}`}
                </p>
                <p className="text-sm text-gray-600">
                  {formData.city}, {formData.state} {formData.zipCode}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-navy-600 mb-2">Emergency Contact</h3>
                <p className="text-sm text-gray-600">{formData.emergencyName}</p>
                <p className="text-sm text-gray-600">{formData.emergencyRelationship}</p>
                <p className="text-sm text-gray-600">{formData.emergencyPhone}</p>
              </div>
              
              {formData.insuranceType && (
                <div>
                  <h3 className="font-semibold text-navy-600 mb-2">Insurance</h3>
                  <p className="text-sm text-gray-600">{formData.insuranceType}</p>
                  {formData.insuranceProvider && (
                    <p className="text-sm text-gray-600">Provider: {formData.insuranceProvider}</p>
                  )}
                </div>
              )}
              
              {formData.chronicConditions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-navy-600 mb-2">Chronic Conditions</h3>
                  <p className="text-sm text-gray-600">{formData.chronicConditions.join(', ')}</p>
                </div>
              )}
              
              {formData.allergies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-navy-600 mb-2">Allergies</h3>
                  {formData.allergies.map((a, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {a.allergen} - {a.reaction} ({a.severity})
                    </p>
                  ))}
                </div>
              )}
              
              {formData.medications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-navy-600 mb-2">Medications</h3>
                  {formData.medications.map((m, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {m.name}
                      {m.dosage && ` - ${m.dosage} ${m.dosageUnit}`}
                      {m.frequency && ` - ${m.frequency}`}
                      {m.route && ` (${m.route})`}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Intake Forms</h1>
          <p className="text-gray-600">Step {currentStepIndex + 1} of {steps.length}</p>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Button variant="secondary" onClick={startVoiceCommand} disabled={isDictating}>
            {isDictating ? 'Listening…' : 'Voice command (say "next" or "back")'}
          </Button>
          <p className="text-xs text-gray-500">Hands-free navigation; speak your answers, then say &quot;next&quot;.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex-1 ${index < steps.length - 1 ? 'mr-2' : ''}`}
              >
                <div className={`h-2 rounded-full ${
                  index <= currentStepIndex ? 'bg-primary-500' : 'bg-gray-200'
                }`} />
                <p className={`text-xs mt-1 text-center ${
                  index <= currentStepIndex ? 'text-primary-600 font-medium' : 'text-gray-400'
                }`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Card className="mb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}
          
          {renderStep()}
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </Button>
          {currentStep === 'review' ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={saving}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              isLoading={saving}
            >
              Next
            </Button>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
