'use client';
import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VoiceConsole } from '@/components/voice/VoiceConsole';
import { useAttachmentStatus } from '@/lib/hooks/useAttachmentStatus';
import { supabase } from '@/lib/supabase/client';
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
import Link from 'next/link';

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

// Map language enum to speech recognition language codes
const languageToSpeechCode: Record<string, string> = {
  'en': 'en-US',
  'es': 'es-ES',
  'ch': 'zh-CN',
  'chu': 'zh-TW',
  'mh': 'mh-MH',
  'fil': 'fil-PH',
};

const languageNames: Record<string, string> = {
  'en': 'English',
  'es': 'Spanish',
  'ch': 'Chinese (Simplified)',
  'chu': 'Chinese (Traditional)',
  'mh': 'Marshallese',
  'fil': 'Filipino',
};

function LocalModeBanner() {
  return (
    <div className="my-4 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm">
      <strong>Wellness Mode:</strong> These vitals are for your personal tracking only.
      <Link href="/connect" className="ml-1 text-blue-600 underline">Connect to a care team</Link> to share vitals with a clinician.
    </div>
  );
}

function ClinicalModeBanner() {
  return (
    <div className="my-4 rounded-md border border-green-300 bg-green-50 p-4 text-sm">
      <strong>Clinical Mode:</strong> These vitals will be sent to your care team and
      added to your medical record.
    </div>
  );
}

export default function VitalsPageInner() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const patientId = useAuthStore((state) => state.patientId);
  const user = useAuthStore((state) => state.user);
  const { loading: attachmentLoading, attached } = useAttachmentStatus();
  
  const [showForm, setShowForm] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<VitalValidationResult | null>(null);
  const [recentReadings, setRecentReadings] = useState<VitalReading[]>([]);
  const [patientContext, setPatientContext] = useState<PatientContext | undefined>(undefined);
  const [isDictating, setIsDictating] = useState(false);
  const [voiceHelperVisible, setVoiceHelperVisible] = useState(true);

  // Get user's preferred language
  const userLanguage = user?.preferredLanguage || 'en';
  const speechLanguageCode = languageToSpeechCode[userLanguage] || 'en-US';
  const languageName = languageNames[userLanguage] || 'English';

  // Load patient ID and context on mount
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
      
      type VitalRow = {
        id: string;
        type: string;
        value: number | null;
        value_secondary: number | null;
        unit: string | null;
        measured_at: string;
        is_abnormal: boolean | null;
        abnormal_reason: string | null;
      };

      const readings: VitalReading[] = (data || []).map((v: VitalRow) => ({
        id: v.id,
        type: v.type.replace(/_/g, ' '),
        value: v.value !== null && v.value !== undefined ? String(v.value) : '',
        value2: v.value_secondary !== null && v.value_secondary !== undefined ? String(v.value_secondary) : '',
        unit: v.unit || '',
        date: v.measured_at,
        status: v.is_abnormal ? (v.abnormal_reason?.includes('critical') || v.abnormal_reason?.includes('emergency') ? 'critical' : 'warning') : 'normal',
      }));
      
      setRecentReadings(readings);
    } catch (error) {
      console.error('Failed to load readings:', error);
    }
  };

  // Auth is handled by useRequireAuth hook and middleware
  // Show loading state while auth initializes
  if (authLoading) {
    return null;
  }

  if (attachmentLoading) {
    return null;
  }

  const startVitalDictation = () => {
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
      const userLang = user?.preferredLanguage || 'en';
      const speechCode = languageToSpeechCode[userLang] || (typeof navigator !== 'undefined' && typeof navigator.language === 'string' ? navigator.language : 'en-US');
      recognition.lang = speechCode;
      recognition.interimResults = false;
      recognition.continuous = true;
      setIsDictating(true);
      let sessionTranscript = '';
      recognition.onresult = (event) => {
        const evt = event as { results: Array<unknown> };
        const res = evt.results?.[0] as unknown as { [key: number]: { transcript: string }; isFinal?: boolean } | undefined;
        const transcript = res?.[0]?.transcript || '';
        if (transcript) sessionTranscript += `${transcript} `;
      };
      recognition.onerror = (e) => {
        setIsDictating(false);
        const code = e.error || 'unknown';
        const guidance = code === 'not-allowed'
          ? 'Microphone access was blocked. You can still type values normally - voice input is optional.'
          : `Voice input error: ${code}. You can still type values normally.`;
        setError(guidance);
        setTimeout(() => setError(null), 8000);
      };
      recognition.onend = () => {
        setIsDictating(false);
        const finalTranscript = sessionTranscript.trim();
        if (!finalTranscript) return;
        const numbers = (finalTranscript.match(/[\d\.]+/g) || [])
          .map((n) => n.replace(/[^0-9.]/g, ''))
          .filter(Boolean);
        if (showForm === 'blood-pressure') {
          if (numbers.length >= 2) {
            setValue(numbers[0] ?? '');
            setValue2(numbers[1] ?? '');
          } else if (numbers.length === 1) {
            setValue(numbers[0] ?? '');
          }
        } else if (numbers[0]) {
          setValue(numbers[0] ?? '');
        }
        setValidationResult(null);
      };
      recognition.start();
    } catch (err) {
      setIsDictating(false);
      const errorMsg = err instanceof Error ? err.message : 'Unable to start voice input.';
      setError(`${errorMsg} You can still type values normally.`);
      setTimeout(() => setError(null), 8000);
    }
  };

  // LOCAL MODE: Save to Supabase only (wellness tracking)
  const handleSaveLocally = async () => {
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

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      alert('Please enter a valid number');
      return;
    }

    let numValue2: number | undefined;
    let result: VitalValidationResult | null = null;

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

    // Run validation for UI display
    switch (showForm) {
      case 'blood-glucose':
        result = validateBloodGlucose(numValue, false, patientContext);
        break;
      case 'blood-pressure':
        result = validateBloodPressure(numValue, numValue2 ?? 0, patientContext);
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

    if (result) {
      setValidationResult(result);
    }

    setSaving(true);
    try {
      let currentPatientId = patientId;
      
      if (!currentPatientId) {
        const authStore = useAuthStore.getState();
        currentPatientId = authStore.patientId ?? authStore.user?.patientId ?? null;
        
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
                
                if (currentPatientId && authStore.user) {
                  authStore.updateUser({ patientId: currentPatientId });
                }
              }
            }
          } catch (err: unknown) {
            console.error('Error loading patient ID:', err);
            throw new Error('Unable to find your patient record. Please complete your intake form first or contact support.');
          }
        }
      }
      
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

      const { error: saveError } = await supabase
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

      await loadRecentReadingsWithId(currentPatientId);

      setShowForm(null);
      setValue('');
      setValue2('');
      setValidationResult(null);
      setError(null);
    } catch (error: unknown) {
      console.error('Failed to save vital:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { message?: string; error?: { message?: string } })?.message ||
            (error as { message?: string; error?: { message?: string } })?.error?.message ||
            'Unknown error';
      
      setError(`Failed to save vital: ${errorMessage}. Please check that you are logged in and try again.`);
    } finally {
      setSaving(false);
    }
  };

  // CLINICAL MODE: Save locally + send to care team via API
  const handleSendToClinician = async () => {
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

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      alert('Please enter a valid number');
      return;
    }

    let numValue2: number | undefined;
    let result: VitalValidationResult | null = null;

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

    // Run validation
    switch (showForm) {
      case 'blood-glucose':
        result = validateBloodGlucose(numValue, false, patientContext);
        break;
      case 'blood-pressure':
        result = validateBloodPressure(numValue, numValue2 ?? 0, patientContext);
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

    if (result) {
      setValidationResult(result);
    }

    setSaving(true);
    setSending(true);
    try {
      let currentPatientId = patientId;
      
      if (!currentPatientId) {
        const authStore = useAuthStore.getState();
        currentPatientId = authStore.patientId ?? authStore.user?.patientId ?? null;
        
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
                
                if (currentPatientId && authStore.user) {
                  authStore.updateUser({ patientId: currentPatientId });
                }
              }
            }
          } catch (err: unknown) {
            console.error('Error loading patient ID:', err);
            throw new Error('Unable to find your patient record. Please complete your intake form first or contact support.');
          }
        }
      }
      
      if (!currentPatientId) {
        setError('Your patient record is not set up yet. Please complete your intake forms first by going to the Intake page.');
        setSaving(false);
        setSending(false);
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

      // Save locally first
      const { error: saveError } = await supabase
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

      // Send to care team via API (guarded by assertAttachedPatient)
      const res = await fetch('/api/vitals/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: vitalTypeMap[showForm || ''] || showForm,
          value: numValue,
          value2: numValue2,
          unit: vitalTypes.find(v => v.id === showForm)?.unit || '',
          metadata: {
            alert_level: result.alertLevel,
            message: result.message,
            recommendation: result.action,
            is_abnormal: result.alertLevel !== 'normal',
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to send vitals' }));
        throw new Error(errorData.error || 'Unable to send vitals to care team');
      }

      await loadRecentReadingsWithId(currentPatientId);

      setShowForm(null);
      setValue('');
      setValue2('');
      setValidationResult(null);
      setError(null);
    } catch (error: unknown) {
      console.error('Failed to save/send vital:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { message?: string; error?: { message?: string } })?.message ||
            (error as { message?: string; error?: { message?: string } })?.error?.message ||
            'Unknown error';
      
      setError(`Failed to ${attached ? 'send' : 'save'} vital: ${errorMessage}. Please try again.`);
    } finally {
      setSaving(false);
      setSending(false);
    }
  };

  const handleVoiceFill = (input: string) => {
    const lower = input.toLowerCase();
    const numbers = (input.match(/[\d\.]+/g) || []).map((n) => n.replace(/[^0-9.]/g, '')).filter(Boolean);

    let target = showForm;
    if (!target) {
      if (lower.includes('pressure') || lower.includes('/') || numbers.length >= 2) target = 'blood-pressure';
      else if (lower.includes('resp') || lower.includes('breath')) target = 'respiratory-rate';
      else if (lower.includes('pulse') || lower.includes('heart')) target = 'heart-rate';
      else if (lower.includes('oxygen') || lower.includes('spo2') || lower.includes('o2')) target = 'oxygen';
      else target = 'blood-pressure';
      setShowForm(target);
    }

    if (target === 'blood-pressure') {
      if (numbers.length >= 2) {
        setValue(numbers[0] ?? '');
        setValue2(numbers[1] ?? '');
      }
    } else if (target === 'heart-rate' || target === 'respiratory-rate' || target === 'oxygen' || target === 'temperature' || target === 'weight' || target === 'blood-glucose') {
      if (numbers[0]) setValue(numbers[0]);
    }
    setValidationResult(null);
    setError(null);
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

        {!attached && <LocalModeBanner />}
        {attached && <ClinicalModeBanner />}

        {voiceHelperVisible && (
          <div className="mb-4">
            <VoiceConsole
              title={`Voice log vitals (${languageName} → English)`}
              targetLang={speechLanguageCode}
              onComplete={({ translated }) => {
                handleVoiceFill(translated);
                setVoiceHelperVisible(false);
              }}
              onCancel={() => setVoiceHelperVisible(false)}
            />
          </div>
        )}

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
              
              {error && (
                <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-200 rounded-lg relative">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-amber-800 text-sm font-medium mb-1">⚠️ {error.includes('Voice') ? 'Voice input unavailable' : 'Error'}</p>
                      <p className="text-amber-700 text-xs">{error}</p>
                      {error.includes('Voice') && (
                        <p className="text-amber-600 text-xs mt-2 font-medium">✓ You can still type values in the fields below</p>
                      )}
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-amber-600 hover:text-amber-800 flex-shrink-0"
                      aria-label="Dismiss error"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              
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
                  {attached && validationResult.notifyProvider && (
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
                <Button variant="secondary" onClick={startVitalDictation} disabled={isDictating}>
                  {isDictating ? 'Listening…' : 'Voice log'}
                </Button>
                {!attached ? (
                  <Button variant="primary" onClick={handleSaveLocally} isLoading={saving}>
                    Save for My Records
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleSendToClinician} isLoading={saving || sending}>
                    {sending ? 'Sending...' : 'Send to Care Team'}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => { setShowForm(null); setValue(''); setValue2(''); setValidationResult(null); }}>Cancel</Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {attached 
                  ? 'All values are saved and sent to your care team. Your care team will be notified of concerning readings.'
                  : 'All values are saved for your personal tracking. Connect to a care team to share vitals with a clinician.'}
              </p>
            </div>
          )}
        </Card>

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

