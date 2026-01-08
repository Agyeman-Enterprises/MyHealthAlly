'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { sendMessageToSolopractice, handleMessageStatus } from '@/lib/api/message-helpers';
import { translateText } from '@/lib/utils/translate';
import { useLanguageStore } from '@/lib/i18n/language-store';
import { supabase } from '@/lib/supabase/client';
import { getPatientMedications, type Medication } from '@/lib/supabase/queries-medications';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

export default function HospitalRecordsRequestPage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();
  const { preferredLanguage } = useLanguageStore();
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalPhone: '',
    hospitalAddress: '',
    contactName: '',
    contactEmail: '',
    visitDate: '',
    visitType: 'emergency' as 'emergency' | 'inpatient' | 'outpatient',
    reason: '',
    additionalNotes: '',
  });
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Array<{ allergen: string; reaction: string; severity: string }>>([]);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load patient medications, allergies, and past medical history
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        // Check for session first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Please log in to access this page');
          setLoadingData(false);
          return;
        }

        const { patientId } = await getCurrentUserAndPatient();
        if (!patientId) {
          setLoadingData(false);
          return;
        }

        // Load medications
        const meds = await getPatientMedications(patientId);
        setMedications(meds.filter(m => m.is_active)); // Only active medications

        // Load allergies and chronic conditions from patient record
        const { data: patient } = await supabase
          .from('patients')
          .select('allergies, chronic_conditions')
          .eq('id', patientId)
          .single();

        if (patient?.allergies && Array.isArray(patient.allergies)) {
          setAllergies(patient.allergies);
        }

        if (patient?.chronic_conditions && Array.isArray(patient.chronic_conditions)) {
          setChronicConditions(patient.chronic_conditions);
        }
      } catch (err) {
        console.error('Error loading patient data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load patient data';
        if (errorMessage.includes('not authenticated') || errorMessage.includes('session')) {
          setError('Please log in to access this page');
        }
      } finally {
        setLoadingData(false);
      }
    };

    if (!isLoading) {
      loadPatientData();
    }
  }, [isLoading]);

  if (isLoading || loadingData) {
    return null;
  }

  const formatMedicationList = (): string => {
    if (medications.length === 0) {
      return 'No active medications on record.';
    }

    return medications
      .map((med) => {
        const parts = [
          med.name,
          med.dosage ? `${med.dosage} ${med.dosage_unit || ''}`.trim() : '',
          med.frequency || '',
          med.route ? `(${med.route})` : '',
          med.instructions ? `- ${med.instructions}` : '',
        ].filter(Boolean);

        return `• ${parts.join(' ')}`;
      })
      .join('\n');
  };

  const formatAllergyList = (): string => {
    if (allergies.length === 0) {
      return 'No known allergies on record.';
    }

    return allergies
      .map((allergy) => {
        const parts = [
          allergy.allergen,
          allergy.reaction ? `(${allergy.reaction})` : '',
          allergy.severity ? `[${allergy.severity}]` : '',
        ].filter(Boolean);

        return `• ${parts.join(' ')}`;
      })
      .join('\n');
  };

  const formatPastMedicalHistory = (): string => {
    if (chronicConditions.length === 0) {
      return 'No chronic conditions on record.';
    }

    return chronicConditions
      .map((condition) => `• ${condition}`)
      .join('\n');
  };

  const formatVisitNotes = (): string => {
    const notes: string[] = [];
    
    if (formData.reason) {
      notes.push(`Reason for Visit: ${formData.reason}`);
    }
    
    if (formData.additionalNotes) {
      notes.push(`Additional Notes: ${formData.additionalNotes}`);
    }
    
    return notes.length > 0 ? notes.join('\n\n') : 'No visit notes provided.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.visitDate) {
      setError('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Format all patient information
      const medicationHistory = formatMedicationList();
      const allergyHistory = formatAllergyList();
      const pastMedicalHistory = formatPastMedicalHistory();
      const visitNotes = formatVisitNotes();

      // Format authorization message for care team
      const message = `Hospital Records Request - Authorization to Send Medical Records

PATIENT AUTHORIZATION:
I authorize my care team to send my complete medical information to the hospital/facility listed below, including:
- Past Medical History (Chronic Conditions)
- Current Medications
- Allergies
- Visit Notes

HOSPITAL/FACILITY INFORMATION:
Name: ${formData.hospitalName}
Phone: ${formData.hospitalPhone || 'Not provided'}
Address: ${formData.hospitalAddress || 'Not provided'}
Contact Name: ${formData.contactName || 'Not provided'}
Contact Email: ${formData.contactEmail || 'Not provided'}

VISIT INFORMATION:
Visit Date: ${formData.visitDate}
Visit Type: ${formData.visitType}

PAST MEDICAL HISTORY (to be sent):
${pastMedicalHistory}

CURRENT MEDICATION HISTORY (to be sent):
${medicationHistory}

CURRENT ALLERGY HISTORY (to be sent):
${allergyHistory}

VISIT NOTES (to be sent):
${visitNotes}

Please send this information to the hospital/facility as requested.`;

      // Translate to English for care team
      const { translatedText: englishMessage } = await translateText(
        message,
        'en'
      );

      // Send to care team
      const subject = `Hospital Records Request - ${formData.hospitalName} - ${formData.visitDate}`;
      const response = await sendMessageToSolopractice(
        englishMessage,
        subject,
        undefined,
        preferredLanguage || 'en',
        'care-team'
      );

      const status = handleMessageStatus(response);
      if (status.success) {
        setSuccess(status.message);
        // Reset form after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(status.message);
      }
    } catch (err) {
      console.error('Error sending medication request:', err);
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Send Records to Hospital/ED" showBack />
    
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <DisclaimerBanner />
        </div>

        <Card variant="elevated" className="p-6 mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Send Medical Records to Hospital/ED:</strong> Authorize your care team to send your complete medical information 
              to a hospital or emergency department, including past medical history (chronic conditions), current medications, allergies, 
              and visit notes. This helps ensure the hospital has your complete medical information.
            </p>
          </div>

          {/* Display Current Medication History */}
          <Card className="mb-6 bg-gray-50">
            <h3 className="font-semibold text-navy-600 mb-3">Your Current Medication History</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {medications.length > 0 ? formatMedicationList() : 'No active medications on record.'}
            </div>
          </Card>

          {/* Display Current Allergy History */}
          <Card className="mb-6 bg-gray-50">
            <h3 className="font-semibold text-navy-600 mb-3">Your Current Allergy History</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {allergies.length > 0 ? formatAllergyList() : 'No known allergies on record.'}
            </div>
          </Card>

          {/* Display Past Medical History */}
          <Card className="mb-6 bg-gray-50">
            <h3 className="font-semibold text-navy-600 mb-3">Your Past Medical History (Chronic Conditions)</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {chronicConditions.length > 0 ? formatPastMedicalHistory() : 'No chronic conditions on record.'}
            </div>
          </Card>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="hospitalName"
              name="hospitalName"
              label="Hospital/Facility Name *"
              type="text"
              placeholder="Hospital or facility name"
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              required
            />

            <Input
              id="hospitalPhone"
              name="hospitalPhone"
              label="Hospital Phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.hospitalPhone}
              onChange={(e) => setFormData({ ...formData, hospitalPhone: e.target.value })}
            />

            <Input
              id="hospitalAddress"
              name="hospitalAddress"
              label="Hospital Address"
              type="text"
              placeholder="Street address, city, state, zip"
              value={formData.hospitalAddress}
              onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="contactName"
                name="contactName"
                label="Contact Name (Optional)"
                type="text"
                placeholder="Name of person to contact"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />

              <Input
                id="contactEmail"
                name="contactEmail"
                label="Contact Email (Optional)"
                type="email"
                placeholder="contact@hospital.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="visitDate"
                name="visitDate"
                label="Visit Date *"
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Type *
                </label>
                <select
                  value={formData.visitType}
                  onChange={(e) => setFormData({ ...formData, visitType: e.target.value as 'emergency' | 'inpatient' | 'outpatient' })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                >
                  <option value="emergency">Emergency Department</option>
                  <option value="inpatient">Inpatient/Hospital Stay</option>
                  <option value="outpatient">Outpatient Visit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly describe why you were seen..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                placeholder="Any additional information or special instructions for sending records..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                rows={3}
              />
            </div>

            <Card className="bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Authorization:</strong> By submitting this form, you authorize your care team to send your complete medical information 
                (past medical history, medications, allergies, and visit notes) to the hospital/facility listed above. This information will be 
                sent securely to help ensure the hospital has your complete medical information.
              </p>
            </Card>

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
                isLoading={loading}
                disabled={!formData.hospitalName.trim() || !formData.visitDate || loading}
              >
                Authorize & Send to Care Team
              </Button>
            </div>
          </form>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
