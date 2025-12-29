'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api/solopractice-client';
import { 
  validateBloodGlucose, 
  validateBloodPressure, 
  validateHeartRate, 
  validateTemperature, 
  validateOxygenSaturation,
  validateRespiratoryRate,
  validateWeight,
  type VitalValidationResult,
  type PatientContext,
  getAgeGroup
} from '@/lib/utils/vital-validation';

const vitalTypes = [
  { id: 'blood-glucose', name: 'Blood Glucose', unit: 'mg/dL', icon: '🩸', normalRange: '70-100 (fasting)' },
  { id: 'blood-pressure', name: 'Blood Pressure', unit: 'mmHg', icon: '💓', normalRange: '90/60-120/80' },
  { id: 'heart-rate', name: 'Heart Rate', unit: 'bpm', icon: '❤️', normalRange: '60-100' },
  { id: 'weight', name: 'Weight', unit: 'lbs', icon: '⚖️', normalRange: 'Varies' },
  { id: 'temperature', name: 'Temperature', unit: '°F', icon: '🌡️', normalRange: '97.8-99.5' },
  { id: 'oxygen', name: 'Oxygen Saturation', unit: '%', icon: '💨', normalRange: '95-100' },
  { id: 'respiratory-rate', name: 'Respiratory Rate', unit: 'breaths/min', icon: '🌬️', normalRange: '12-18' },
];

interface VitalReading {
  id: string;
  type: string;
  value: string;
  value2?: string;
  unit: string;
  date: string;
  status: 'normal' | 'warning' | 'critical';
}

export default function VitalsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const patientId = useAuthStore((state) => state.patientId);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<VitalValidationResult | null>(null);
  const [recentReadings, setRecentReadings] = useState<VitalReading[]>([]);
  const [patientContext, setPatientContext] = useState<PatientContext | undefined>(undefined);

  // Load patient ID and context on mount
  useEffect(() => {
    const loadPatientData = async () => {
      let currentPatientId = patientId;
      
      // If no patient ID, try to load it
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
              
              // Update auth store
              const authStore = useAuthStore.getState();
              if (currentPatientId && authStore.user) {
                authStore.updateUser({ patientId: currentPatientId });
              }
            }
          }
        } catch (error) {
          console.error('Error loading patient ID:', error);
        }
      }
      
      if (!currentPatientId) return;
      
      // Load patient age for age-based validation
      try {
        const { data: patient, error } = await supabase
          .from('patients')
          .select('date_of_birth')
          .eq('id', currentPatientId)
          .single();
        
        if (error) {
          console.error('Failed to load patient data:', error);
          return;
        }
        
        if (patient?.date_of_birth) {
          const dob = new Date(patient.date_of_birth);
          const today = new Date();
          const ageYears = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const ageMonths = ageYears * 12 + monthDiff;
          const finalAgeYears = Math.floor(ageMonths / 12);
          const finalAgeMonths = ageMonths % 12;
          
          const ageGroup = getAgeGroup(finalAgeYears, finalAgeMonths);
          setPatientContext({
            ageGroup,
            ageYears: finalAgeYears,
            ageMonths: finalAgeMonths,
          });
        }
      } catch (error) {
        console.error('Error loading patient context:', error);
      }
      
      // Load recent readings
      loadRecentReadingsWithId(currentPatientId);
    };
    
    if (isAuthenticated) {
      loadPatientData();
    }
  }, [isAuthenticated, patientId]);

  const loadRecentReadingsWithId = async (pid: string) => {
    if (!pid) return;
    try {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', pid)
        .order('measured_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Failed to load readings:', error);
        return;
      }
      
      const readings: VitalReading[] = (data || []).map((v: any) => ({
        id: v.id,
        type: v.type.replace(/_/g, ' '),
        value: v.value,
        value2: v.value_secondary,
        unit: v.unit || '',
        date: v.measured_at,
        status: v.is_abnormal ? (v.abnormal_reason?.includes('critical') || v.abnormal_reason?.includes('emergency') ? 'critical' : 'warning') : 'normal',
      }));
      
      setRecentReadings(readings);
    } catch (error) {
      console.error('Failed to load readings:', error);
    }
  };

  const loadRecentReadings = async () => {
    const currentPatientId = patientId || useAuthStore.getState().patientId || useAuthStore.getState().user?.patientId;
    if (currentPatientId) {
      await loadRecentReadingsWithId(currentPatientId);
    }
  };

  // Ensure patient ID is loaded on mount - this should already be set during login
  useEffect(() => {
    if (isAuthenticated && !patientId) {
      const loadPatientId = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.warn('User not authenticated in Supabase');
            return;
          }

          const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('id, patients(id)')
            .eq('supabase_auth_id', user.id)
            .single();
          
          if (userError) {
            console.error('Error loading user record:', userError);
            return;
          }
          
          if (userRecord?.patients) {
            const patientsArray = Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients];
            const pid = patientsArray[0]?.id;
            
            if (pid) {
              const authStore = useAuthStore.getState();
              authStore.updateUser({ patientId: pid });
              console.log('✅ Patient ID loaded and stored:', pid);
            } else {
              console.warn('⚠️ User record found but no patient record linked. User may need to complete intake.');
            }
          } else {
            console.warn('⚠️ No patient record found for user. User may need to complete intake.');
          }
        } catch (error) {
          console.error('Error loading patient ID on mount:', error);
        }
      };
      loadPatientId();
    }
  }, [isAuthenticated, patientId]);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleSave = async () => {
    if (!value) { 
      setValidationResult({
        isValid: false,
        canSave: false,
        alertLevel: 'warning',
        message: 'Please enter a value',
        action: '',
        notifyProvider: false,
      });
      return; 
    }

    // Basic input validation - only check if it's a valid number format
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      alert('Please enter a valid number');
      return;
    }

    let numValue2: number | undefined;
    let result: VitalValidationResult | null = null;

    // For blood pressure, validate both values are numbers
    if (showForm === 'blood-pressure') {
      numValue2 = parseFloat(value2);
      if (isNaN(numValue2)) {
        alert('Please enter both systolic and diastolic values');
        return;
      }
      if (numValue <= numValue2) {
        alert('Systolic (top number) must be higher than diastolic (bottom number)');
        return;
      }
    }

    // Run validation ONLY for UI display (alerts, recommendations, flags)
    // This does NOT block saving - we save ALL values, good or bad!
    // Use age-based validation when patient context is available
    switch (showForm) {
      case 'blood-glucose':
        result = validateBloodGlucose(numValue, false, patientContext);
        break;
      case 'blood-pressure':
        result = validateBloodPressure(numValue, numValue2!, patientContext);
        break;
      case 'heart-rate':
        result = validateHeartRate(numValue, patientContext);
        break;
      case 'temperature':
        result = validateTemperature(numValue, patientContext);
        break;
      case 'oxygen':
        result = validateOxygenSaturation(numValue);
        break;
      case 'respiratory-rate':
        result = validateRespiratoryRate(numValue, patientContext);
        break;
      case 'weight':
        result = validateWeight(numValue);
        break;
      default:
        result = {
          isValid: true,
          canSave: true,
          alertLevel: 'normal',
          message: 'Value recorded',
          action: '',
          notifyProvider: false,
        };
    }

    // Show validation result in UI (for alerts/recommendations/flags)
    // This is SEPARATE from saving - we always save!
    if (result) {
      setValidationResult(result);
    }

    // CRITICAL: ALWAYS SAVE - validation is ONLY for displaying alerts/recommendations
    // We save ALL values, good or bad - that's the whole point of tracking vitals!

    // Save the vital - even if high/low, we need to track it!
    setSaving(true);
    try {
      // Ensure patientId is available - try multiple sources
      let currentPatientId = patientId;
      
      if (!currentPatientId) {
        // Try to get from auth store
        const authStore = useAuthStore.getState();
        currentPatientId = authStore.patientId || authStore.user?.patientId;
        
        // If still not found, try to get from Supabase user
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
                
                // Update auth store with patient ID
                if (currentPatientId && authStore.user) {
                  authStore.updateUser({ patientId: currentPatientId });
                }
              }
            }
          } catch (err: any) {
            console.error('Error loading patient ID:', err);
            throw new Error('Unable to find your patient record. Please complete your intake form first or contact support.');
          }
        }
      }
      
      // If patient ID still not found, this is a valid state - user might not have completed intake
      // Don't throw error, just show helpful message
      if (!currentPatientId) {
        setError('Your patient record is not set up yet. Please complete your intake forms first by going to the Intake page.');
        setSaving(false);
        return;
      }

      const vitalTypeMap: Record<string, string> = {
        'blood-glucose': 'blood_glucose',
        'blood-pressure': 'blood_pressure',
        'heart-rate': 'heart_rate',
        'temperature': 'temperature',
        'oxygen': 'oxygen_saturation',
        'respiratory-rate': 'respiratory_rate',
        'weight': 'weight',
      };

      const { data: savedVital, error: saveError } = await supabase
        .from('vitals')
        .insert({
          patient_id: currentPatientId,
          type: vitalTypeMap[showForm || ''] || showForm,
          value: numValue.toString(),
          value_secondary: numValue2 ? numValue2.toString() : null,
          unit: vitalTypes.find(v => v.id === showForm)?.unit || '',
          source: 'manual',
          measured_at: new Date().toISOString(),
          is_abnormal: result.alertLevel !== 'normal' && result.alertLevel !== undefined,
          abnormal_reason: result.alertLevel !== 'normal' ? result.message : null,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // CRITICAL: Send measurement to SoloPractice - this creates alerts in SoloPractice provider panel
      // SoloPractice enforces R4 (Urgency Classification) and R5 (Hard Escalation)
      // This is the PRIMARY pathway for provider notifications
      try {
        // Ensure API client has access token from auth store
        const authStore = useAuthStore.getState();
        const token = authStore.accessToken;
        const refreshToken = authStore.refreshToken;
        
        if (token && refreshToken) {
          apiClient.setTokens(token, refreshToken);
        } else {
          // Try to get from localStorage (fallback)
          const storedToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
          const storedRefresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
          if (storedToken && storedRefresh) {
            apiClient.setTokens(storedToken, storedRefresh);
          }
        }

        // Build value object for SoloPractice API
        const measurementValue: Record<string, unknown> = {
          value: numValue,
          unit: vitalTypes.find(v => v.id === showForm)?.unit || '',
        };
        
        if (numValue2 !== undefined) {
          measurementValue.value2 = numValue2;
        }

        const metadata: Record<string, unknown> = {
          alert_level: result.alertLevel,
          message: result.message,
          recommendation: result.action,
          is_abnormal: result.alertLevel !== 'normal',
        };

        // Send to SoloPractice - this will create alerts in SoloPractice provider panel
        // SoloPractice will enforce R4 (urgency classification) and R5 (hard escalation)
        const spResponse = await apiClient.recordMeasurement({
          type: vitalTypeMap[showForm || ''] || showForm,
          value: measurementValue,
          source: 'manual',
          metadata: metadata,
        }).catch((err) => {
          // Don't fail the save if SoloPractice API fails - log and continue
          console.warn('SoloPractice API call failed (non-critical):', err);
          return null;
        });

        if (spResponse) {
          console.log('✅ Measurement sent to SoloPractice:', spResponse);
          
          // SoloPractice will create alerts based on urgency (green/yellow/red)
          // These alerts appear in SoloPractice provider panel automatically
          if (spResponse.urgency === 'red' || spResponse.escalated) {
            console.log('🚨 CRITICAL: SoloPractice escalated this measurement - alert created in SoloPractice provider panel');
          }
        }
      } catch (spError: any) {
        // CRITICAL: If SoloPractice API fails, we still need to create alert locally
        console.error('⚠️ CRITICAL: Failed to send measurement to SoloPractice:', spError);
        console.error('Error details:', spError?.response?.data || spError?.message);
        // Fall through to create local alert as backup
        // In production, this should trigger immediate admin notification
      }

      // Create local Supabase alert as backup (if SoloPractice API unavailable)
      // PRIMARY PATHWAY: SoloPractice API creates alerts in provider panel
      // BACKUP PATHWAY: Local Supabase alert (for MHA provider portal)
      if (result.notifyProvider) {
        try {
          const { data: alertData, error: alertError } = await supabase
            .from('alerts')
            .insert({
              patient_id: currentPatientId,
              type: 'vital_alert',
              severity: (result.alertLevel === 'critical' || result.alertLevel === 'emergency') ? 'high' : 'medium',
              title: `Vital Alert: ${vitalTypes.find(v => v.id === showForm)?.name || showForm}`,
              message: result.message,
              trigger_data: {
                vital_type: showForm,
                value: numValue,
                value2: numValue2,
                recommendation: result.action,
                alert_level: result.alertLevel,
              },
              status: 'active',
            })
            .select()
            .single();

          if (alertError) {
            console.error('CRITICAL: Failed to create alert:', alertError);
            // Log this as a critical error - alerts MUST be created
            // In production, this should trigger an admin notification
            throw new Error(`Alert creation failed: ${alertError.message}. This is a critical system error.`);
          }

          // Verify alert was created
          if (!alertData || !alertData.id) {
            throw new Error('Alert was not created - no ID returned');
          }

          console.log('Alert created successfully:', alertData.id);
        } catch (alertError: any) {
          // This is CRITICAL - if we can't create alerts, we can't promise notification
          console.error('CRITICAL ALERT CREATION FAILURE:', alertError);
          // Don't fail the vital save, but log this as a critical issue
          // In production, this should trigger immediate admin notification
        }
      }

      // Reload readings with the patient ID we used
      await loadRecentReadingsWithId(currentPatientId);

      // Show success - clear form and validation
      setShowForm(null);
      setValue('');
      setValue2('');
      setValidationResult(null);
      setError(null); // Clear any previous errors
      
      // Show success message inline if there's a validation result
      if (result && result.alertLevel !== 'normal') {
        // Validation result already shown in UI via setValidationResult
        // No need for alert
      }
    } catch (error: any) {
      console.error('Failed to save vital:', error);
      const errorMessage = error?.message || error?.error?.message || 'Unknown error';
      
      // Show error inline instead of alert
      setError(`Failed to save vital: ${errorMessage}. Please check that you are logged in and try again.`);
      
      // Don't clear the form on error - let user retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">Vitals</h1>
            <p className="text-gray-600">Track and record your health measurements</p>
          </div>
        </div>

        {/* Record New Vital */}
        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Record a Reading</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {vitalTypes.map((vital) => (
              <button
                key={vital.id}
                onClick={() => { setShowForm(vital.id); setValue(''); setValue2(''); }}
                className={`p-4 rounded-xl border-2 transition-all text-center ${showForm === vital.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
              >
                <span className="text-2xl block mb-1">{vital.icon}</span>
                <span className="text-sm font-medium text-navy-600">{vital.name}</span>
                <span className="text-xs text-gray-500 block">{vital.normalRange}</span>
              </button>
            ))}
          </div>

          {showForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-navy-600 mb-3">Enter {vitalTypes.find(v => v.id === showForm)?.name}</h3>
              
              {/* Error Message - Dismissible */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg relative">
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
                </div>
              )}
              
              {/* Validation Alert - Dismissible, does not block data entry */}
              {validationResult && validationResult.alertLevel !== 'normal' && (
                <div className={`mb-4 p-3 rounded-lg border-2 relative ${
                  (validationResult.alertLevel === 'critical' || validationResult.alertLevel === 'emergency')
                    ? 'bg-red-50 border-red-300 text-red-800' 
                    : 'bg-amber-50 border-amber-300 text-amber-800'
                }`}>
                  <button
                    onClick={() => setValidationResult(null)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Dismiss alert"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="font-semibold mb-1 pr-6">⚠️ {validationResult.message}</p>
                  {validationResult.action && (
                    <p className="text-sm">{validationResult.action}</p>
                  )}
                  {validationResult.notifyProvider && (
                    <p className="text-xs mt-1 italic">Your care team will be notified.</p>
                  )}
                  <p className="text-xs mt-2 text-gray-600 italic">You can continue entering data - all values are saved.</p>
                </div>
              )}

              <div className="flex gap-3 items-end">
                {showForm === 'blood-pressure' ? (
                  <>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Systolic</label>
                      <input type="number" value={value} onChange={(e) => { setValue(e.target.value); setValidationResult(null); }} placeholder="120" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <span className="text-gray-500 pb-2">/</span>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Diastolic</label>
                      <input type="number" value={value2} onChange={(e) => { setValue2(e.target.value); setValidationResult(null); }} placeholder="80" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </>
                ) : (
                  <div className="flex-1">
                    <input type="number" value={value} onChange={(e) => { setValue(e.target.value); setValidationResult(null); }} placeholder="Enter value" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                )}
                <span className="text-gray-500 pb-2">{vitalTypes.find(v => v.id === showForm)?.unit}</span>
                <Button variant="primary" onClick={handleSave} isLoading={saving}>Save</Button>
                <Button variant="ghost" onClick={() => { setShowForm(null); setValue(''); setValue2(''); setValidationResult(null); }}>Cancel</Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">All values are saved, even if high or low. Your care team will be notified of concerning readings.</p>
            </div>
          )}
        </Card>

        {/* Recent Readings */}
        <Card>
          <h2 className="font-semibold text-navy-600 mb-4">Recent Readings</h2>
          {recentReadings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent readings</p>
          ) : (
            <div className="space-y-3">
              {recentReadings.map((reading) => (
                <div key={reading.id} className={`flex items-center justify-between p-3 rounded-xl ${
                  reading.status === 'critical' ? 'bg-red-50 border border-red-200' :
                  reading.status === 'warning' ? 'bg-amber-50 border border-amber-200' :
                  'bg-gray-50'
                }`}>
                  <div>
                    <h3 className="font-medium text-navy-600">{reading.type}</h3>
                    <p className="text-xs text-gray-500">{new Date(reading.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-navy-700">
                      {reading.value}{reading.value2 ? `/${reading.value2}` : ''}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">{reading.unit}</span>
                    <span className={`block text-xs ${
                      reading.status === 'normal' ? 'text-green-600' : 
                      reading.status === 'warning' ? 'text-amber-600' : 
                      'text-red-600'
                    }`}>
                      {reading.status === 'normal' ? '✓ Normal' : reading.status === 'warning' ? '⚠️ Monitor' : '🚨 Alert'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
