'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/auth-store';

// Types
type VitalType = 'blood_glucose' | 'blood_pressure' | 'heart_rate' | 'oxygen_saturation' | 'temperature' | 'weight' | 'respiratory_rate' | 'peak_flow';

interface VitalValidationResult {
  isValid: boolean;
  alertLevel: 'normal' | 'warning' | 'critical';
  message: string;
  recommendation?: string;
  notifyProvider?: boolean;
  showEmergencyOptions?: boolean;
}

interface VitalReading {
  id: string;
  type: VitalType;
  value: number;
  value2?: number; // For blood pressure (diastolic)
  unit: string;
  timestamp: Date;
  notes?: string;
}

// Vital type configuration
const VITAL_CONFIG: Record<VitalType, { 
  label: string; 
  unit: string; 
  icon: string;
  placeholder: string;
  normalRange: string;
  hasSecondValue?: boolean;
  secondLabel?: string;
}> = {
  blood_glucose: {
    label: 'Blood Glucose',
    unit: 'mg/dL',
    icon: '🩸',
    placeholder: 'e.g., 120',
    normalRange: '70-180 (fasting: 70-130)',
  },
  blood_pressure: {
    label: 'Blood Pressure',
    unit: 'mmHg',
    icon: '❤️',
    placeholder: 'Systolic',
    normalRange: '<120/80',
    hasSecondValue: true,
    secondLabel: 'Diastolic',
  },
  heart_rate: {
    label: 'Heart Rate',
    unit: 'bpm',
    icon: '💓',
    placeholder: 'e.g., 72',
    normalRange: '60-100',
  },
  oxygen_saturation: {
    label: 'Oxygen Saturation',
    unit: '%',
    icon: '🫁',
    placeholder: 'e.g., 98',
    normalRange: '95-100',
  },
  temperature: {
    label: 'Temperature',
    unit: '°F',
    icon: '🌡️',
    placeholder: 'e.g., 98.6',
    normalRange: '97.8-99.1',
  },
  weight: {
    label: 'Weight',
    unit: 'lbs',
    icon: '⚖️',
    placeholder: 'e.g., 150',
    normalRange: 'Varies',
  },
  respiratory_rate: {
    label: 'Respiratory Rate',
    unit: 'breaths/min',
    icon: '🌬️',
    placeholder: 'e.g., 16',
    normalRange: '12-20',
  },
  peak_flow: {
    label: 'Peak Flow',
    unit: 'L/min',
    icon: '💨',
    placeholder: 'e.g., 400',
    normalRange: '80-100% of personal best',
  },
};

// ============================================================================
// VALIDATION FUNCTIONS - Evidence-based, never blocking
// ============================================================================

// ============================================================================
// PLAUSIBILITY BOUNDS - Values outside these are DATA ENTRY ERRORS
// These reject saving because they're physiologically impossible
// ============================================================================
const PLAUSIBILITY_BOUNDS: Record<VitalType, { min: number; max: number; minMsg: string; maxMsg: string }> = {
  blood_glucose: {
    min: 10,
    max: 800,
    minMsg: 'Blood glucose below 10 mg/dL is not physiologically possible. Please check your entry.',
    maxMsg: 'Blood glucose above 800 mg/dL is extremely rare. Please verify this reading.',
  },
  oxygen_saturation: {
    min: 50,
    max: 100,
    minMsg: 'Oxygen saturation below 50% is incompatible with consciousness. Please check your reading.',
    maxMsg: 'Oxygen saturation cannot exceed 100%.',
  },
  heart_rate: {
    min: 20,
    max: 250,
    minMsg: 'Heart rate below 20 bpm requires immediate medical attention. If accurate, call 911.',
    maxMsg: 'Heart rate above 250 bpm is extremely rare. Please verify this reading.',
  },
  blood_pressure: {
    min: 40, // systolic
    max: 300,
    minMsg: 'Systolic pressure below 40 mmHg indicates severe shock. If accurate, call 911.',
    maxMsg: 'Systolic pressure above 300 mmHg is extremely rare. Please verify this reading.',
  },
  temperature: {
    min: 85,
    max: 110,
    minMsg: 'Temperature below 85°F indicates severe hypothermia. If accurate, call 911.',
    maxMsg: 'Temperature above 110°F is life-threatening. If accurate, call 911.',
  },
  respiratory_rate: {
    min: 4,
    max: 60,
    minMsg: 'Respiratory rate below 4 breaths/min requires immediate attention. Please verify.',
    maxMsg: 'Respiratory rate above 60 breaths/min is extremely high. Please verify.',
  },
  weight: {
    min: 1,
    max: 1000,
    minMsg: 'Please enter a valid weight.',
    maxMsg: 'Please verify this weight entry.',
  },
  peak_flow: {
    min: 50,
    max: 900,
    minMsg: 'Peak flow below 50 L/min is extremely low. Please verify or seek care.',
    maxMsg: 'Peak flow above 900 L/min is unusually high. Please verify.',
  },
};

// Check if value is within plausible bounds (data entry validation)
function checkPlausibility(type: VitalType, value: number, value2?: number): VitalValidationResult | null {
  const bounds = PLAUSIBILITY_BOUNDS[type];
  
  if (value < bounds.min) {
    return {
      isValid: false, // ❌ Don't save - likely data entry error
      alertLevel: 'critical',
      message: bounds.minMsg,
      recommendation: 'Please re-enter the value. If this reading is accurate and you feel unwell, seek immediate medical care.',
      showEmergencyOptions: true,
    };
  }
  
  if (value > bounds.max) {
    return {
      isValid: false, // ❌ Don't save - likely data entry error
      alertLevel: 'critical',
      message: bounds.maxMsg,
      recommendation: 'Please verify and re-enter the value.',
    };
  }
  
  // Blood pressure: also check diastolic
  if (type === 'blood_pressure' && value2 !== undefined) {
    if (value2 < 20) {
      return {
        isValid: false,
        alertLevel: 'critical',
        message: 'Diastolic pressure below 20 mmHg is not physiologically typical. Please verify.',
        recommendation: 'Please re-check your measurement.',
        showEmergencyOptions: true,
      };
    }
    if (value2 > 200) {
      return {
        isValid: false,
        alertLevel: 'critical',
        message: 'Diastolic pressure above 200 mmHg is extremely rare. Please verify.',
        recommendation: 'Please verify and re-enter the value.',
      };
    }
  }
  
  return null; // Passed plausibility check
}

function validateBloodGlucose(value: number): VitalValidationResult {
  // ADA 2025 Guidelines
  if (value < 54) {
    return {
      isValid: true, // Still valid to save!
      alertLevel: 'critical',
      message: `Blood glucose of ${value} mg/dL is low.`,
      recommendation: value < 40 
        ? 'Take 15-20g fast-acting carbs NOW. If confused or unable to swallow, someone should give glucagon or call 911.'
        : 'Follow 15-15 rule: Take 15g fast-acting carbs, wait 15 minutes, recheck.',
      notifyProvider: true,
      showEmergencyOptions: value < 40,
    };
  }
  if (value < 70) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Blood glucose of ${value} mg/dL is below target.`,
      recommendation: 'Have a small snack with carbs. Recheck in 15-30 minutes.',
      notifyProvider: value < 60,
    };
  }
  if (value > 400) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Blood glucose of ${value} mg/dL is very high.`,
      recommendation: 'Stay hydrated. If you feel unwell (nausea, confusion, fruity breath), seek emergency care.',
      notifyProvider: true,
      showEmergencyOptions: value > 500,
    };
  }
  if (value > 250) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Blood glucose of ${value} mg/dL is elevated.`,
      recommendation: 'Stay hydrated. Take medications as prescribed. Contact your care team.',
      notifyProvider: true,
    };
  }
  if (value > 180) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Blood glucose of ${value} mg/dL is above target.`,
      recommendation: 'Post-meal elevations happen. Stay active, hydrate, monitor your next reading.',
      notifyProvider: value > 200,
    };
  }
  return {
    isValid: true,
    alertLevel: 'normal',
    message: `Blood glucose of ${value} mg/dL is within target range.`,
  };
}

function validateOxygenSaturation(value: number): VitalValidationResult {
  // Note: COPD patients have different targets (88-92%) - this is default adult
  if (value < 88) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Oxygen saturation of ${value}% is low.`,
      recommendation: 'Sit upright and take slow deep breaths. If you have difficulty breathing or feel confused, seek emergency care.',
      notifyProvider: true,
      showEmergencyOptions: value < 85,
    };
  }
  if (value < 92) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Oxygen saturation of ${value}% is below normal.`,
      recommendation: 'Take slow deep breaths. If on supplemental oxygen, ensure it\'s working. Contact your care team.',
      notifyProvider: true,
    };
  }
  if (value < 95) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Oxygen saturation of ${value}% is slightly low.`,
      recommendation: 'Ensure pulse oximeter is positioned correctly. Take a few deep breaths and recheck.',
      notifyProvider: value < 93,
    };
  }
  return {
    isValid: true,
    alertLevel: 'normal',
    message: `Oxygen saturation of ${value}% is normal.`,
  };
}

function validateHeartRate(value: number): VitalValidationResult {
  if (value < 40) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Heart rate of ${value} bpm is very low.`,
      recommendation: 'If you feel dizzy, faint, or short of breath, seek medical attention. This may be normal if you are very athletic.',
      notifyProvider: true,
      showEmergencyOptions: value < 35,
    };
  }
  if (value < 50) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Heart rate of ${value} bpm is below normal range.`,
      recommendation: 'May be normal for athletes. Monitor how you feel and report any dizziness.',
    };
  }
  if (value > 150) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Heart rate of ${value} bpm is significantly elevated.`,
      recommendation: 'Rest and recheck. If you have chest pain, difficulty breathing, or feel faint, seek emergency care.',
      notifyProvider: true,
      showEmergencyOptions: value > 180,
    };
  }
  if (value > 120) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Heart rate of ${value} bpm is elevated.`,
      recommendation: 'Could be from activity, caffeine, or stress. Rest and recheck in 15 minutes.',
      notifyProvider: value > 130,
    };
  }
  if (value > 100) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Heart rate of ${value} bpm is slightly elevated.`,
      recommendation: 'May be normal after activity. Rest and monitor.',
    };
  }
  return {
    isValid: true,
    alertLevel: 'normal',
    message: `Heart rate of ${value} bpm is within normal range.`,
  };
}

function validateBloodPressure(systolic: number, diastolic: number): VitalValidationResult {
  // Hypertensive crisis
  if (systolic >= 180 || diastolic >= 120) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is very high.`,
      recommendation: 'Wait 5 minutes and re-measure. If still elevated, or if you have headache, vision changes, or chest pain, seek emergency care.',
      notifyProvider: true,
      showEmergencyOptions: systolic >= 200 || diastolic >= 130,
    };
  }
  // Stage 2 hypertension
  if (systolic >= 160 || diastolic >= 100) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is high.`,
      recommendation: 'Rest for 5 minutes and recheck. Contact your care team today.',
      notifyProvider: true,
    };
  }
  // Stage 1 hypertension
  if (systolic >= 140 || diastolic >= 90) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is elevated.`,
      recommendation: 'Take medications as prescribed. Reduce sodium and stress.',
      notifyProvider: true,
    };
  }
  // Elevated
  if (systolic >= 130 || diastolic >= 85) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is slightly elevated.`,
      recommendation: 'Rest and recheck. Continue healthy lifestyle habits.',
    };
  }
  // Low blood pressure
  if (systolic < 90 || diastolic < 60) {
    return {
      isValid: true,
      alertLevel: systolic < 80 ? 'critical' : 'warning',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is low.`,
      recommendation: 'If you feel dizzy or faint, lie down with legs elevated. Stay hydrated.',
      notifyProvider: systolic < 85,
      showEmergencyOptions: systolic < 80,
    };
  }
  return {
    isValid: true,
    alertLevel: 'normal',
    message: `Blood pressure of ${systolic}/${diastolic} mmHg is within healthy range.`,
  };
}

function validateTemperature(value: number): VitalValidationResult {
  if (value > 104) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Temperature of ${value}°F is a high fever.`,
      recommendation: 'Take fever reducers. Seek medical care promptly. Cool compresses may help.',
      notifyProvider: true,
      showEmergencyOptions: value > 105,
    };
  }
  if (value > 102) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Temperature of ${value}°F indicates a moderate fever.`,
      recommendation: 'Rest and stay hydrated. Fever reducers may help. Monitor symptoms.',
      notifyProvider: true,
    };
  }
  if (value > 100.4) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Temperature of ${value}°F indicates a low-grade fever.`,
      recommendation: 'Rest and stay hydrated. Monitor for other symptoms.',
    };
  }
  if (value < 95) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Temperature of ${value}°F is low (hypothermia risk).`,
      recommendation: 'Warm up gradually with blankets. Seek emergency care if confused or symptoms persist.',
      notifyProvider: true,
      showEmergencyOptions: value < 93,
    };
  }
  if (value < 97) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Temperature of ${value}°F is below normal.`,
      recommendation: 'Warm up gradually. May be due to thermometer placement.',
    };
  }
  return {
    isValid: true,
    alertLevel: 'normal',
    message: `Temperature of ${value}°F is normal.`,
  };
}

function validateRespiratoryRate(value: number): VitalValidationResult {
  if (value < 8) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Respiratory rate of ${value} breaths/min is very low.`,
      recommendation: 'This is unusually slow. Check for responsiveness. Seek immediate medical attention.',
      notifyProvider: true,
      showEmergencyOptions: true,
    };
  }
  if (value < 12) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Respiratory rate of ${value} breaths/min is below normal.`,
      recommendation: 'May be normal when very relaxed. Recheck if feeling unusual.',
    };
  }
  if (value > 30) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Respiratory rate of ${value} breaths/min indicates respiratory distress.`,
      recommendation: 'This indicates difficulty breathing. Seek medical attention.',
      notifyProvider: true,
      showEmergencyOptions: value > 35,
    };
  }
  if (value > 24) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Respiratory rate of ${value} breaths/min is elevated.`,
      recommendation: 'Could be from activity or anxiety. Rest and recheck.',
      notifyProvider: value > 28,
    };
  }
  if (value > 20) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Respiratory rate of ${value} breaths/min is slightly elevated.`,
      recommendation: 'May be normal after activity. Monitor.',
    };
  }
  return {
    isValid: true,
    alertLevel: 'normal',
    message: `Respiratory rate of ${value} breaths/min is normal.`,
  };
}

function validateWeight(value: number): VitalValidationResult {
  // Weight validation is mostly about change detection, not absolute values
  // For now, just accept the value
  return {
    isValid: true,
    alertLevel: 'normal',
    message: `Weight of ${value} lbs recorded.`,
  };
}

function validatePeakFlow(value: number, personalBest?: number): VitalValidationResult {
  if (!personalBest) {
    return {
      isValid: true,
      alertLevel: 'normal',
      message: `Peak flow of ${value} L/min recorded.`,
      recommendation: 'Set your personal best to enable zone-based monitoring.',
    };
  }
  
  const percent = (value / personalBest) * 100;
  
  if (percent < 50) {
    return {
      isValid: true,
      alertLevel: 'critical',
      message: `Peak flow of ${value} L/min is in the RED ZONE (${percent.toFixed(0)}% of best).`,
      recommendation: 'Use rescue inhaler immediately. If no improvement in 15 minutes, seek emergency care.',
      notifyProvider: true,
      showEmergencyOptions: true,
    };
  }
  if (percent < 80) {
    return {
      isValid: true,
      alertLevel: 'warning',
      message: `Peak flow of ${value} L/min is in the YELLOW ZONE (${percent.toFixed(0)}% of best).`,
      recommendation: 'Airways are narrowing. Use rescue inhaler per your action plan. Contact care team if not improving.',
      notifyProvider: percent < 60,
    };
  }
  return {
    isValid: true,
    alertLevel: 'normal',
    message: `Peak flow of ${value} L/min is in the GREEN ZONE (${percent.toFixed(0)}% of best).`,
    recommendation: 'Asthma is well controlled. Continue current medications.',
  };
}

// Main validation dispatcher
function validateVital(type: VitalType, value: number, value2?: number): VitalValidationResult {
  // STEP 1: Check plausibility bounds (data entry errors)
  const plausibilityError = checkPlausibility(type, value, value2);
  if (plausibilityError) {
    return plausibilityError; // isValid: false - don't save
  }
  
  // STEP 2: Clinical validation (real values that may need attention)
  switch (type) {
    case 'blood_glucose':
      return validateBloodGlucose(value);
    case 'oxygen_saturation':
      return validateOxygenSaturation(value);
    case 'heart_rate':
      return validateHeartRate(value);
    case 'blood_pressure':
      return validateBloodPressure(value, value2 || 80);
    case 'temperature':
      return validateTemperature(value);
    case 'respiratory_rate':
      return validateRespiratoryRate(value);
    case 'weight':
      return validateWeight(value);
    case 'peak_flow':
      return validatePeakFlow(value);
    default:
      return { isValid: true, alertLevel: 'normal', message: 'Value recorded.' };
  }
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function VitalAlert({ result, onDismiss }: { result: VitalValidationResult | null; onDismiss: () => void }) {
  if (!result || result.alertLevel === 'normal') return null;
  
  const bgColor = result.alertLevel === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
  const textColor = result.alertLevel === 'critical' ? 'text-red-800' : 'text-amber-800';
  const icon = result.alertLevel === 'critical' ? '⚠️' : 'ℹ️';
  
  return (
    <div className={`${bgColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <p className={`font-semibold ${textColor} mb-1`}>{result.message}</p>
          {result.recommendation && (
            <p className={`text-sm ${textColor} opacity-90`}>{result.recommendation}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function VitalSuccess({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">✅</span>
        <p className="flex-1 text-green-800 font-medium">{message}</p>
        <button
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VitalsPage() {
  const router = useRouter();
  const patientId = useAuthStore((state) => state.patientId);
  
  // State
  const [selectedType, setSelectedType] = useState<VitalType>('blood_glucose');
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState(''); // For blood pressure diastolic
  const [notes, setNotes] = useState('');
  const [validationResult, setValidationResult] = useState<VitalValidationResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentReadings, setRecentReadings] = useState<VitalReading[]>([]);

  const config = VITAL_CONFIG[selectedType];

  // Reset form when type changes
  useEffect(() => {
    setValue('');
    setValue2('');
    setNotes('');
    setValidationResult(null);
    setShowSuccess(false);
  }, [selectedType]);

  // Handle form submission
  const handleSubmit = async () => {
    // Basic input validation
    const numValue = parseFloat(value);
    if (!value || isNaN(numValue)) {
      setValidationResult({
        isValid: false,
        alertLevel: 'warning',
        message: 'Please enter a valid number.',
      });
      return;
    }

    // For blood pressure, validate second value
    let numValue2: number | undefined;
    if (config.hasSecondValue) {
      numValue2 = parseFloat(value2);
      if (!value2 || isNaN(numValue2)) {
        setValidationResult({
          isValid: false,
          alertLevel: 'warning',
          message: 'Please enter both systolic and diastolic values.',
        });
        return;
      }
      if (numValue <= numValue2) {
        setValidationResult({
          isValid: false,
          alertLevel: 'warning',
          message: 'Systolic (top number) should be higher than diastolic (bottom number).',
        });
        return;
      }
    }

    // Validate the value
    const result = validateVital(selectedType, numValue, numValue2);
    setValidationResult(result);

    // ❌ Don't save if plausibility check failed (data entry error)
    if (!result.isValid) {
      return; // Show the error, let user correct
    }

    // ✅ SAVE - Value passed plausibility check (may still have clinical alerts)
    setIsSubmitting(true);
    try {
      if (!patientId) {
        throw new Error('Patient ID not found. Please log in again.');
      }

      // Map vital type to database enum
      const vitalTypeMap: Record<VitalType, string> = {
        blood_glucose: 'blood_glucose',
        blood_pressure: 'blood_pressure',
        heart_rate: 'heart_rate',
        oxygen_saturation: 'oxygen_saturation',
        temperature: 'temperature',
        weight: 'weight',
        respiratory_rate: 'respiratory_rate',
        peak_flow: 'peak_flow',
      };

      // Save to Supabase
      const { data: savedVital, error: saveError } = await supabase
        .from('vitals')
        .insert({
          patient_id: patientId,
          type: vitalTypeMap[selectedType],
          value: numValue.toString(),
          value_secondary: numValue2 ? numValue2.toString() : null,
          unit: config.unit,
          source: 'manual',
          measured_at: new Date().toISOString(),
          notes: notes || null,
          is_abnormal: result.alertLevel !== 'normal',
          abnormal_reason: result.alertLevel !== 'normal' ? result.message : null,
        })
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      // Create local reading for UI
      const newReading: VitalReading = {
        id: savedVital.id,
        type: selectedType,
        value: numValue,
        ...(numValue2 !== undefined && { value2: numValue2 }),
        unit: config.unit,
        timestamp: new Date(savedVital.measured_at),
        ...(notes && { notes }),
      };

      // Add to recent readings
      setRecentReadings(prev => [newReading, ...prev].slice(0, 10));

      // Show success feedback (briefly)
      if (result.alertLevel === 'normal') {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }

      // Clear form for next entry
      setValue('');
      setValue2('');
      setNotes('');

      // If provider needs notification, create alert in database
      if (result.notifyProvider) {
        try {
          await supabase.from('alerts').insert({
            patient_id: patientId,
            type: 'vital_alert',
            priority: result.alertLevel === 'critical' ? 'high' : 'medium',
            message: result.message,
            details: {
              vital_type: selectedType,
              value: numValue,
              value2: numValue2,
              recommendation: result.recommendation,
            },
            status: 'active',
          });
        } catch (alertError) {
          console.error('Failed to create alert:', alertError);
          // Don't fail the vital save if alert creation fails
        }
      }

    } catch (error) {
      console.error('Failed to save vital:', error);
      setValidationResult({
        isValid: false,
        alertLevel: 'warning',
        message: 'Failed to save. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Record Vitals</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Vital Type Selector */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Vital Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(VITAL_CONFIG).map(([type, cfg]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as VitalType)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedType === type
                    ? 'bg-teal-100 border-2 border-teal-500 text-teal-700'
                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl block mb-1">{cfg.icon}</span>
                <span className="text-xs font-medium">{cfg.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Value Entry */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h2 className="font-semibold text-gray-900">{config.label}</h2>
              <p className="text-sm text-gray-500">Normal: {config.normalRange}</p>
            </div>
          </div>

          {/* Validation Alert - Shows inline, never blocks */}
          <VitalAlert 
            result={validationResult} 
            onDismiss={() => setValidationResult(null)} 
          />

          {/* Success Message */}
          {showSuccess && (
            <VitalSuccess 
              message="Vital recorded successfully!" 
              onDismiss={() => setShowSuccess(false)} 
            />
          )}

          {/* Input Fields */}
          <div className="space-y-4">
            <div className={config.hasSecondValue ? 'grid grid-cols-2 gap-4' : ''}>
              <div>
                {config.hasSecondValue && (
                  <label className="block text-sm text-gray-600 mb-1">Systolic (top)</label>
                )}
                <div className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={config.placeholder}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    inputMode="decimal"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {config.unit}
                  </span>
                </div>
              </div>

              {config.hasSecondValue && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Diastolic (bottom)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={value2}
                      onChange={(e) => setValue2(e.target.value)}
                      placeholder="e.g., 80"
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      inputMode="decimal"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {config.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional context..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Reading'}
            </button>
          </div>
        </section>

        {/* Recent Readings */}
        {recentReadings.length > 0 && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Readings</h3>
            <div className="space-y-2">
              {recentReadings.map((reading) => {
                const readingConfig = VITAL_CONFIG[reading.type];
                const result = validateVital(reading.type, reading.value, reading.value2);
                return (
                  <div
                    key={reading.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.alertLevel === 'critical'
                        ? 'bg-red-50'
                        : result.alertLevel === 'warning'
                        ? 'bg-amber-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{readingConfig.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reading.value}
                          {reading.value2 && `/${reading.value2}`}
                          <span className="text-gray-500 text-sm ml-1">{reading.unit}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {reading.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        result.alertLevel === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : result.alertLevel === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {result.alertLevel === 'normal' ? 'Normal' : result.alertLevel === 'warning' ? 'Monitor' : 'Alert'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
