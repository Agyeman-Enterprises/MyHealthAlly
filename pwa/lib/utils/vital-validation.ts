/**
 * Clinical Vital Sign Validation - SAFETY CRITICAL
 * 
 * Thresholds provided by clinical team:
 * 
 * 🚨 CALL 911 OR GO TO ED:
 * - Temperature: >103.5°F or <93°F
 * - Blood Glucose: <50 mg/dL or >350 mg/dL
 * - SpO2: <90%
 * - Heart Rate: <55 bpm or >150 bpm
 * - Systolic BP: <90 mmHg or ≥180 mmHg
 * - Diastolic BP: >105 mmHg
 */

export type AlertLevel = 'normal' | 'warning' | 'critical' | 'emergency';

export interface VitalValidationResult {
  isValid: boolean;
  canSave: boolean;
  alertLevel: AlertLevel;
  message: string;
  action: string;
  notifyProvider: boolean;
}

/**
 * OXYGEN SATURATION (SpO2)
 * 🚨 ED: <90%
 */
export function validateSpO2(value: number): VitalValidationResult {
  if (isNaN(value) || value < 0 || value > 100) {
    return {
      isValid: false,
      canSave: false,
      alertLevel: 'warning',
      message: 'Please enter a valid SpO2 (0-100%)',
      action: '',
      notifyProvider: false,
    };
  }

  // 🚨 EMERGENCY: <90%
  if (value < 90) {
    return {
      isValid: true,
      canSave: false, // BLOCKED
      alertLevel: 'emergency',
      message: `🚨 SpO2 ${value}% is critically low`,
      action: 'CALL 911 or go to the Emergency Department immediately.',
      notifyProvider: true,
    };
  }

  // Warning: 90-94%
  if (value < 95) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `SpO2 ${value}% is below normal`,
      action: 'Monitor closely. Contact your provider if it drops below 90%.',
      notifyProvider: true,
    };
  }

  // Normal: 95-100%
  return {
    isValid: true,
    canSave: true,
    alertLevel: 'normal',
    message: `SpO2 ${value}% is normal`,
    action: '',
    notifyProvider: false,
  };
}

/**
 * BLOOD GLUCOSE
 * 🚨 ED: <50 mg/dL or >350 mg/dL
 */
export function validateBloodGlucose(value: number, isFasting: boolean = false): VitalValidationResult {
  if (isNaN(value) || value <= 0) {
    return {
      isValid: false,
      canSave: false,
      alertLevel: 'warning',
      message: 'Please enter a valid blood glucose value',
      action: '',
      notifyProvider: false,
    };
  }

  // 🚨 EMERGENCY LOW: <50
  if (value < 50) {
    return {
      isValid: true,
      canSave: false, // BLOCKED
      alertLevel: 'emergency',
      message: `🚨 Blood glucose ${value} mg/dL is dangerously LOW`,
      action: 'CALL 911 or go to the Emergency Department. Take fast-acting glucose (juice, glucose tablets) NOW if conscious.',
      notifyProvider: true,
    };
  }

  // 🚨 EMERGENCY HIGH: >350
  if (value > 350) {
    return {
      isValid: true,
      canSave: false, // BLOCKED
      alertLevel: 'emergency',
      message: `🚨 Blood glucose ${value} mg/dL is dangerously HIGH`,
      action: 'CALL 911 or go to the Emergency Department. Risk of diabetic ketoacidosis (DKA).',
      notifyProvider: true,
    };
  }

  // Warning LOW: 50-70
  if (value < 70) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Blood glucose ${value} mg/dL is low`,
      action: 'Eat 15g of fast-acting carbs. Recheck in 15 minutes.',
      notifyProvider: true,
    };
  }

  // Warning HIGH: >250
  if (value > 250) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Blood glucose ${value} mg/dL is elevated`,
      action: 'Contact your provider. Stay hydrated.',
      notifyProvider: true,
    };
  }

  // Elevated: >180 or fasting >126
  if (value > 180 || (isFasting && value > 126)) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Blood glucose ${value} mg/dL is above target`,
      action: 'Monitor and discuss with your care team.',
      notifyProvider: false,
    };
  }

  // Normal
  return {
    isValid: true,
    canSave: true,
    alertLevel: 'normal',
    message: `Blood glucose ${value} mg/dL is within range`,
    action: '',
    notifyProvider: false,
  };
}

/**
 * HEART RATE
 * 🚨 ED: <55 bpm or >150 bpm
 */
export function validateHeartRate(value: number): VitalValidationResult {
  if (isNaN(value) || value <= 0 || value > 300) {
    return {
      isValid: false,
      canSave: false,
      alertLevel: 'warning',
      message: 'Please enter a valid heart rate',
      action: '',
      notifyProvider: false,
    };
  }

  // 🚨 EMERGENCY LOW: <55
  if (value < 55) {
    return {
      isValid: true,
      canSave: false, // BLOCKED
      alertLevel: 'emergency',
      message: `🚨 Heart rate ${value} bpm is dangerously LOW`,
      action: 'CALL 911 or go to the Emergency Department. If dizzy or faint, lie down immediately.',
      notifyProvider: true,
    };
  }

  // 🚨 EMERGENCY HIGH: >150
  if (value > 150) {
    return {
      isValid: true,
      canSave: false, // BLOCKED
      alertLevel: 'emergency',
      message: `🚨 Heart rate ${value} bpm is dangerously HIGH`,
      action: 'CALL 911 or go to the Emergency Department. Sit or lie down, try to stay calm.',
      notifyProvider: true,
    };
  }

  // Warning: 55-60 or 100-150
  if (value < 60 || value > 100) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Heart rate ${value} bpm is outside normal range`,
      action: value < 60 
        ? 'May be normal if athletic. Contact provider if symptomatic.'
        : 'Rest and recheck. May be elevated from activity or caffeine.',
      notifyProvider: value < 60 || value > 120,
    };
  }

  // Normal: 60-100
  return {
    isValid: true,
    canSave: true,
    alertLevel: 'normal',
    message: `Heart rate ${value} bpm is normal`,
    action: '',
    notifyProvider: false,
  };
}

/**
 * BLOOD PRESSURE
 * 🚨 ED: SBP <90 or ≥180, DBP >105
 */
export function validateBloodPressure(systolic: number, diastolic: number): VitalValidationResult {
  if (isNaN(systolic) || isNaN(diastolic) || systolic <= 0 || diastolic <= 0) {
    return {
      isValid: false,
      canSave: false,
      alertLevel: 'warning',
      message: 'Please enter valid blood pressure values',
      action: '',
      notifyProvider: false,
    };
  }

  if (systolic <= diastolic) {
    return {
      isValid: false,
      canSave: false,
      alertLevel: 'warning',
      message: 'Systolic must be higher than diastolic',
      action: 'The top number should be larger than the bottom number.',
      notifyProvider: false,
    };
  }

  // 🚨 EMERGENCY: SBP ≥180 or DBP >105
  if (systolic >= 180 || diastolic > 105) {
    return {
      isValid: true,
      canSave: false, // BLOCKED
      alertLevel: 'emergency',
      message: `🚨 BP ${systolic}/${diastolic} is dangerously HIGH`,
      action: 'CALL 911 or go to the Emergency Department. Risk of stroke or heart attack.',
      notifyProvider: true,
    };
  }

  // 🚨 EMERGENCY: SBP <90
  if (systolic < 90) {
    return {
      isValid: true,
      canSave: false, // BLOCKED
      alertLevel: 'emergency',
      message: `🚨 BP ${systolic}/${diastolic} is dangerously LOW`,
      action: 'CALL 911 or go to the Emergency Department. Lie down and elevate legs if possible.',
      notifyProvider: true,
    };
  }

  // Warning HIGH: SBP 140-179 or DBP 90-105
  if (systolic >= 140 || diastolic >= 90) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `BP ${systolic}/${diastolic} is elevated`,
      action: 'Rest 5 minutes and recheck. Notify your provider if persistently elevated.',
      notifyProvider: true,
    };
  }

  // Warning LOW: SBP 90-100
  if (systolic < 100) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `BP ${systolic}/${diastolic} is on the low side`,
      action: 'If dizzy, sit or lie down. Stay hydrated.',
      notifyProvider: false,
    };
  }

  // Normal
  return {
    isValid: true,
    canSave: true,
    alertLevel: 'normal',
    message: `BP ${systolic}/${diastolic} is within normal range`,
    action: '',
    notifyProvider: false,
  };
}

/**
 * TEMPERATURE
 * 🚨 ED: >103.5°F or <93°F
 */
export function validateTemperature(value: number): VitalValidationResult {
  if (isNaN(value) || value < 85 || value > 110) {
    return {
      isValid: false,
      canSave: false,
      alertLevel: 'warning',
      message: 'Please enter a valid temperature (85-110°F)',
      action: '',
      notifyProvider: false,
    };
  }

  // 🚨 EMERGENCY HIGH: >103.5
  if (value > 103.5) {
    return {
      isValid: true,
      canSave: false, // BLOCKED
      alertLevel: 'emergency',
      message: `🚨 Temperature ${value}°F is dangerously HIGH`,
      action: 'CALL 911 or go to the Emergency Department. Apply cool compresses, stay hydrated.',
      notifyProvider: true,
    };
  }

  // 🚨 EMERGENCY LOW: <93
  if (value < 93) {
    return {
      isValid: true,
      canSave: false, // BLOCKED
      alertLevel: 'emergency',
      message: `🚨 Temperature ${value}°F is dangerously LOW`,
      action: 'CALL 911 or go to the Emergency Department. Warm up gradually with blankets.',
      notifyProvider: true,
    };
  }

  // Warning: Fever 100.4-103.5
  if (value >= 100.4) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Temperature ${value}°F indicates fever`,
      action: 'Take fever reducers as directed. Rest and stay hydrated.',
      notifyProvider: value >= 102,
    };
  }

  // Warning: Low 93-95
  if (value < 95) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Temperature ${value}°F is below normal`,
      action: 'Warm up gradually. Seek care if not improving.',
      notifyProvider: true,
    };
  }

  // Normal: 95-100.4
  return {
    isValid: true,
    canSave: true,
    alertLevel: 'normal',
    message: `Temperature ${value}°F is normal`,
    action: '',
    notifyProvider: false,
  };
}

/**
 * WEIGHT (no emergency thresholds, just validation)
 */
export function validateWeight(value: number): VitalValidationResult {
  if (isNaN(value) || value < 20 || value > 800) {
    return {
      isValid: false,
      canSave: false,
      alertLevel: 'warning',
      message: 'Please enter a valid weight (20-800 lbs)',
      action: '',
      notifyProvider: false,
    };
  }

  return {
    isValid: true,
    canSave: true,
    alertLevel: 'normal',
    message: `Weight ${value} lbs recorded`,
    action: '',
    notifyProvider: false,
  };
}

/**
 * Get styling for alert levels
 */
export function getAlertStyles(level: AlertLevel) {
  switch (level) {
    case 'emergency':
      return {
        bg: 'bg-red-600',
        text: 'text-white',
        border: 'border-red-700',
      };
    case 'critical':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
      };
    case 'warning':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
      };
    default:
      return {
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-300',
      };
  }
}
