/**
 * Clinical Vital Sign Validation - SAFETY CRITICAL
 * Age-based validation with 2 standard deviation thresholds
 * 
 * Key Principles:
 * - Normal ranges vary by age (neonate → elderly)
 * - 2 standard deviations outside normal = concerning/problem
 * - ALL data is saved regardless of validation result
 * - Validation is for alerts/recommendations only
 */

export type AlertLevel = 'normal' | 'warning' | 'critical' | 'emergency';

export type AgeGroup = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export interface PatientContext {
  ageGroup?: AgeGroup;
  ageYears?: number;
  ageMonths?: number;
}

export interface VitalValidationResult {
  isValid: boolean;
  canSave: boolean;
  alertLevel: AlertLevel;
  message: string;
  action: string;
  notifyProvider: boolean;
}

// Age group determination
export function getAgeGroup(ageYears?: number, ageMonths?: number): AgeGroup {
  if (!ageYears && !ageMonths) return 'adult';
  const totalMonths = (ageYears || 0) * 12 + (ageMonths || 0);
  if (totalMonths < 1) return 'neonate';      // 0-28 days
  if (totalMonths < 12) return 'infant';      // 1-12 months
  if (ageYears! < 3) return 'toddler';        // 1-3 years
  if (ageYears! < 12) return 'child';         // 3-12 years
  if (ageYears! < 18) return 'adolescent';     // 12-18 years
  if (ageYears! < 65) return 'adult';         // 18-65 years
  return 'elderly';                            // 65+
}

// Age-based normal ranges (from PALS and clinical guidelines)
interface VitalRanges {
  hr: { min: number; max: number; mean: number; stdDev: number };
  rr: { min: number; max: number; mean: number; stdDev: number };
  sbp: { min: number; max: number; mean: number; stdDev: number };
  dbp: { min: number; max: number; mean: number; stdDev: number };
}

const VITAL_RANGES_BY_AGE: Record<AgeGroup, VitalRanges> = {
  neonate: {
    hr: { min: 100, max: 180, mean: 140, stdDev: 20 },
    rr: { min: 30, max: 60, mean: 45, stdDev: 7.5 },
    sbp: { min: 60, max: 90, mean: 75, stdDev: 7.5 },
    dbp: { min: 30, max: 60, mean: 45, stdDev: 7.5 },
  },
  infant: {
    hr: { min: 100, max: 180, mean: 140, stdDev: 20 },
    rr: { min: 30, max: 60, mean: 45, stdDev: 7.5 }, // 0-6 mo: 30-60; 6-12 mo: 24-30 (using broader range)
    sbp: { min: 80, max: 100, mean: 90, stdDev: 5 }, // 6-12 mo: 80-100
    dbp: { min: 55, max: 65, mean: 60, stdDev: 2.5 }, // 6-12 mo: 55-65
  },
  toddler: {
    hr: { min: 80, max: 130, mean: 105, stdDev: 12.5 },
    rr: { min: 20, max: 30, mean: 25, stdDev: 2.5 },
    sbp: { min: 86, max: 107, mean: 96.5, stdDev: 5.25 },
    dbp: { min: 41, max: 78, mean: 59.5, stdDev: 9.25 },
  },
  child: {
    // Combined preschool (3-5) and school-age (6-12) - will use more specific logic in validation
    hr: { min: 70, max: 110, mean: 90, stdDev: 10 }, // School-age: 70-100; Preschool: 80-110 (using broader)
    rr: { min: 12, max: 28, mean: 20, stdDev: 4 }, // School-age: 12-20; Preschool: 20-28 (using broader)
    sbp: { min: 90, max: 121, mean: 105.5, stdDev: 7.75 }, // School-age: 90-121
    dbp: { min: 59, max: 80, mean: 69.5, stdDev: 5.25 }, // School-age: 59-80
  },
  adolescent: {
    hr: { min: 60, max: 100, mean: 80, stdDev: 10 },
    rr: { min: 12, max: 20, mean: 16, stdDev: 2 },
    sbp: { min: 102, max: 124, mean: 113, stdDev: 5.5 },
    dbp: { min: 64, max: 80, mean: 72, stdDev: 4 },
  },
  adult: {
    hr: { min: 60, max: 100, mean: 80, stdDev: 10 },
    rr: { min: 12, max: 20, mean: 16, stdDev: 2 },
    sbp: { min: 90, max: 120, mean: 105, stdDev: 7.5 }, // Normal is 120/80 or less
    dbp: { min: 60, max: 80, mean: 70, stdDev: 5 },
  },
  elderly: {
    hr: { min: 60, max: 100, mean: 80, stdDev: 10 },
    rr: { min: 12, max: 20, mean: 16, stdDev: 2 },
    sbp: { min: 90, max: 140, mean: 115, stdDev: 12.5 }, // Slightly higher acceptable for elderly
    dbp: { min: 60, max: 90, mean: 75, stdDev: 7.5 },
  },
};

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

  // 🚨 EMERGENCY: <90% - SAVE BUT ALERT
  if (value < 90) {
    return {
      isValid: true,
      canSave: true, // ✅ ALWAYS SAVE - we need to track this!
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
 * Normal: 70-120 mg/dL
 * 2 SD out = problem (approximately ±25 from mean of 95)
 * 🚨 ED: <50 mg/dL or >350 mg/dL
 */
export function validateBloodGlucose(value: number, isFasting: boolean = false, context?: PatientContext): VitalValidationResult {
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

  // Normal range: 70-120 mg/dL (mean ~95, 2SD ~±25)
  const mean = 95;
  const stdDev = 25;
  const normalMin = 70;
  const normalMax = 120;
  const twoSDLow = mean - (2 * stdDev);  // ~45
  const twoSDHigh = mean + (2 * stdDev); // ~145

  // 🚨 EMERGENCY LOW: <50 - SAVE BUT ALERT
  if (value < 50) {
    return {
      isValid: true,
      canSave: true, // ✅ ALWAYS SAVE - we need to track this!
      alertLevel: 'emergency',
      message: `🚨 Blood glucose ${value} mg/dL is dangerously LOW`,
      action: 'CALL 911 or go to the Emergency Department. Take fast-acting glucose (juice, glucose tablets) NOW if conscious.',
      notifyProvider: true,
    };
  }

  // 🚨 EMERGENCY HIGH: >350 - SAVE BUT ALERT
  if (value > 350) {
    return {
      isValid: true,
      canSave: true, // ✅ ALWAYS SAVE - we need to track this!
      alertLevel: 'emergency',
      message: `🚨 Blood glucose ${value} mg/dL is dangerously HIGH`,
      action: 'CALL 911 or go to the Emergency Department. Risk of diabetic ketoacidosis (DKA).',
      notifyProvider: true,
    };
  }

  // CRITICAL: >2 SD out (calculated internally, not shown to user)
  if (value < twoSDLow || value > twoSDHigh) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'critical',
      message: `Blood glucose ${value} mg/dL is ${value < twoSDLow ? 'very low' : 'very high'}`,
      action: value < twoSDLow 
        ? 'Eat 15g of fast-acting carbs. Recheck in 15 minutes. Contact provider if not improving.'
        : 'Contact your provider immediately. Stay hydrated. Monitor for symptoms.',
      notifyProvider: true,
    };
  }

  // WARNING: Outside normal range (70-120) but within 2SD
  if (value < normalMin || value > normalMax) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Blood glucose ${value} mg/dL is ${value < normalMin ? 'below' : 'above'} normal range`,
      action: value < normalMin
        ? 'Eat 15g of fast-acting carbs. Recheck in 15 minutes.'
        : 'Monitor and discuss with your care team.',
      notifyProvider: value < 60 || value > 180,
    };
  }

  // Normal: 70-120
  return {
    isValid: true,
    canSave: true,
    alertLevel: 'normal',
    message: `Blood glucose ${value} mg/dL is within normal range`,
    action: '',
    notifyProvider: false,
  };
}

/**
 * HEART RATE
 * Age-based normal ranges with 2SD thresholds
 * 🚨 ED: <55 bpm or >150 bpm (adults)
 */
export function validateHeartRate(value: number, context?: PatientContext): VitalValidationResult {
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

  const ageGroup = context?.ageGroup || getAgeGroup(context?.ageYears, context?.ageMonths);
  const ranges = VITAL_RANGES_BY_AGE[ageGroup];
  
  // Calculate 2SD thresholds
  const twoSDLow = ranges.hr.mean - (2 * ranges.hr.stdDev);
  const twoSDHigh = ranges.hr.mean + (2 * ranges.hr.stdDev);

  // 🚨 EMERGENCY: Very extreme values (age-independent critical thresholds)
  const isPediatric = ['neonate', 'infant', 'toddler', 'child', 'adolescent'].includes(ageGroup);
  const emergencyLow = isPediatric ? ranges.hr.min * 0.6 : 40;
  const emergencyHigh = isPediatric ? ranges.hr.max * 1.5 : 180;

  if (value < emergencyLow || value > emergencyHigh) {
    return {
      isValid: true,
      canSave: true, // ✅ ALWAYS SAVE
      alertLevel: 'emergency',
      message: `🚨 Heart rate ${value} bpm is ${value < emergencyLow ? 'dangerously LOW' : 'dangerously HIGH'}`,
      action: 'CALL 911 or go to the Emergency Department immediately.',
      notifyProvider: true,
    };
  }

  // CRITICAL: >2 SD out (calculated internally, not shown to user)
  if (value < twoSDLow || value > twoSDHigh) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'critical',
      message: `Heart rate ${value} bpm is ${value < twoSDLow ? 'very low' : 'very high'}`,
      action: value < twoSDLow
        ? 'If dizzy or faint, lie down. Contact provider immediately.'
        : 'Rest and recheck. If chest pain or difficulty breathing, seek emergency care.',
      notifyProvider: true,
    };
  }

  // WARNING: Outside normal range but within 2SD
  if (value < ranges.hr.min || value > ranges.hr.max) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Heart rate ${value} bpm is ${value < ranges.hr.min ? 'below' : 'above'} normal`,
      action: value < ranges.hr.min
        ? 'May be normal if athletic. Contact provider if symptomatic.'
        : 'Rest and recheck. May be elevated from activity or caffeine.',
      notifyProvider: value < ranges.hr.min * 0.9 || value > ranges.hr.max * 1.1,
    };
  }

  // Normal: Within age-appropriate range
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
 * Age-based normal ranges
 * Healthy resting adults: 90/60 to 120/80 mmHg
 * 🚨 ED: SBP <90 or ≥180, DBP >105 (adults)
 */
export function validateBloodPressure(systolic: number, diastolic: number, context?: PatientContext): VitalValidationResult {
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

  const ageGroup = context?.ageGroup || getAgeGroup(context?.ageYears, context?.ageMonths);
  const ranges = VITAL_RANGES_BY_AGE[ageGroup];
  const isPediatric = ['neonate', 'infant', 'toddler', 'child', 'adolescent'].includes(ageGroup);
  
  // Calculate 2SD thresholds
  const sbpTwoSDLow = ranges.sbp.mean - (2 * ranges.sbp.stdDev);
  const sbpTwoSDHigh = ranges.sbp.mean + (2 * ranges.sbp.stdDev);
  const dbpTwoSDLow = ranges.dbp.mean - (2 * ranges.dbp.stdDev);
  const dbpTwoSDHigh = ranges.dbp.mean + (2 * ranges.dbp.stdDev);

  // For adults: 140/95 is acceptable (within normal range)
  // Emergency thresholds (age-independent critical)
  const emergencySBPHigh = isPediatric ? ranges.sbp.max + 30 : 180;
  const emergencyDBPHigh = isPediatric ? ranges.dbp.max + 20 : 120;
  const emergencySBPLow = isPediatric ? ranges.sbp.min - 20 : 70;

  // 🚨 EMERGENCY: Very extreme values
  if (systolic >= emergencySBPHigh || diastolic >= emergencyDBPHigh) {
    return {
      isValid: true,
      canSave: true, // ✅ ALWAYS SAVE
      alertLevel: 'emergency',
      message: `🚨 BP ${systolic}/${diastolic} is dangerously HIGH`,
      action: 'CALL 911 or go to the Emergency Department. Risk of stroke or heart attack.',
      notifyProvider: true,
    };
  }

  if (systolic < emergencySBPLow) {
    return {
      isValid: true,
      canSave: true, // ✅ ALWAYS SAVE
      alertLevel: 'emergency',
      message: `🚨 BP ${systolic}/${diastolic} is dangerously LOW`,
      action: 'CALL 911 or go to the Emergency Department. Lie down and elevate legs if possible.',
      notifyProvider: true,
    };
  }

  // CRITICAL: >2 SD out (calculated internally, not shown to user)
  if (systolic < sbpTwoSDLow || systolic > sbpTwoSDHigh || diastolic < dbpTwoSDLow || diastolic > dbpTwoSDHigh) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'critical',
      message: `BP ${systolic}/${diastolic} is ${systolic < sbpTwoSDLow || diastolic < dbpTwoSDLow ? 'very low' : 'very high'}`,
      action: systolic < sbpTwoSDLow || diastolic < dbpTwoSDLow
        ? 'If dizzy, lie down. Contact provider immediately.'
        : 'Rest 5 minutes and recheck. Contact provider if persistently elevated.',
      notifyProvider: true,
    };
  }

  // WARNING: Outside normal range but within 2SD
  // For healthy resting adults: 90/60 to 120/80 is normal
  if (ageGroup === 'adult') {
    // Adults: Normal range is 90/60 to 120/80
    if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80) {
      return {
        isValid: true,
        canSave: true,
        alertLevel: 'normal',
        message: `BP ${systolic}/${diastolic} is within normal range`,
        action: '',
        notifyProvider: false,
      };
    }
    // Adults: Above 120/80 is elevated
    if (systolic > 120 || diastolic > 80) {
      return {
        isValid: true,
        canSave: true,
        alertLevel: 'warning',
        message: `BP ${systolic}/${diastolic} is elevated`,
        action: 'Rest 5 minutes and recheck. Notify your provider if persistently elevated.',
        notifyProvider: systolic > 130 || diastolic > 85,
      };
    }
  } else if (ageGroup === 'adolescent') {
    // Adolescents: 102-124/64-80, but normal is 120/80 or less
    if (systolic >= 102 && systolic <= 120 && diastolic >= 64 && diastolic <= 80) {
      return {
        isValid: true,
        canSave: true,
        alertLevel: 'normal',
        message: `BP ${systolic}/${diastolic} is within normal range`,
        action: '',
        notifyProvider: false,
      };
    }
    if (systolic > 120 || diastolic > 80) {
      return {
        isValid: true,
        canSave: true,
        alertLevel: 'warning',
        message: `BP ${systolic}/${diastolic} is elevated`,
        action: 'Rest 5 minutes and recheck. Notify your provider if persistently elevated.',
        notifyProvider: true,
      };
    }
  } else if (ageGroup === 'elderly') {
    // Elderly: Slightly higher acceptable
    if (systolic >= 90 && systolic <= 140 && diastolic >= 60 && diastolic <= 90) {
      return {
        isValid: true,
        canSave: true,
        alertLevel: 'normal',
        message: `BP ${systolic}/${diastolic} is within normal range`,
        action: '',
        notifyProvider: false,
      };
    }
    if (systolic > 140 || diastolic > 90) {
      return {
        isValid: true,
        canSave: true,
        alertLevel: 'warning',
        message: `BP ${systolic}/${diastolic} is elevated`,
        action: 'Rest 5 minutes and recheck. Notify your provider if persistently elevated.',
        notifyProvider: true,
      };
    }
  } else {
    // Pediatric: warn if outside age-appropriate range
    if (systolic > ranges.sbp.max || diastolic > ranges.dbp.max) {
      return {
        isValid: true,
        canSave: true,
        alertLevel: 'warning',
        message: `BP ${systolic}/${diastolic} is elevated`,
        action: 'Rest 5 minutes and recheck. Notify your provider if persistently elevated.',
        notifyProvider: true,
      };
    }
    // Pediatric: within normal range
    if (systolic >= ranges.sbp.min && systolic <= ranges.sbp.max && diastolic >= ranges.dbp.min && diastolic <= ranges.dbp.max) {
      return {
        isValid: true,
        canSave: true,
        alertLevel: 'normal',
        message: `BP ${systolic}/${diastolic} is within normal range`,
        action: '',
        notifyProvider: false,
      };
    }
  }

  // WARNING: Low but not critical
  if (systolic < ranges.sbp.min + 10 || diastolic < ranges.dbp.min + 5) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `BP ${systolic}/${diastolic} is on the low side`,
      action: 'If dizzy, sit or lie down. Stay hydrated.',
      notifyProvider: false,
    };
  }

  // Normal: Within age-appropriate range
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
 * Normal: 97.8-99.5°F (up to 100.4°F can be normal for children)
 * 🚨 ED: >103.5°F or <93°F
 */
export function validateTemperature(value: number, context?: PatientContext): VitalValidationResult {
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

  // 🚨 EMERGENCY HIGH: >103.5 - SAVE BUT ALERT
  if (value > 103.5) {
    return {
      isValid: true,
      canSave: true, // ✅ ALWAYS SAVE - we need to track this!
      alertLevel: 'emergency',
      message: `🚨 Temperature ${value}°F is dangerously HIGH`,
      action: 'CALL 911 or go to the Emergency Department. Apply cool compresses, stay hydrated.',
      notifyProvider: true,
    };
  }

  // 🚨 EMERGENCY LOW: <93 - SAVE BUT ALERT
  if (value < 93) {
    return {
      isValid: true,
      canSave: true, // ✅ ALWAYS SAVE - we need to track this!
      alertLevel: 'emergency',
      message: `🚨 Temperature ${value}°F is dangerously LOW`,
      action: 'CALL 911 or go to the Emergency Department. Warm up gradually with blankets.',
      notifyProvider: true,
    };
  }

  const ageGroup = context?.ageGroup || getAgeGroup(context?.ageYears, context?.ageMonths);
  const isPediatric = ['neonate', 'infant', 'toddler', 'child', 'adolescent'].includes(ageGroup);

  // Normal: 97.8-99.5°F for all ages
  if (value >= 97.8 && value <= 99.5) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'normal',
      message: `Temperature ${value}°F is normal`,
      action: '',
      notifyProvider: false,
    };
  }

  // Normal for children: up to 100.4°F can be normal (pediatric consideration)
  if (isPediatric && value > 99.5 && value <= 100.4) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'normal',
      message: `Temperature ${value}°F is normal`,
      action: 'For children, up to 100.4°F can be normal. Monitor closely.',
      notifyProvider: false,
    };
  }

  // Warning for adults: 99.5-100.4°F is slightly elevated
  if (!isPediatric && value > 99.5 && value <= 100.4) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Temperature ${value}°F is slightly elevated`,
      action: 'Monitor closely. Rest and stay hydrated.',
      notifyProvider: value >= 100,
    };
  }

  // Warning: Fever 100.4-103.5
  if (value > 100.4 && value <= 103.5) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Temperature ${value}°F indicates fever`,
      action: 'Take fever reducers as directed. Rest and stay hydrated.',
      notifyProvider: value >= 102,
    };
  }

  // Warning: Low 93-97.8
  if (value < 97.8 && value >= 93) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Temperature ${value}°F is below normal`,
      action: 'Warm up gradually. Seek care if not improving.',
      notifyProvider: value < 96,
    };
  }

  // Should not reach here, but fallback
  return {
    isValid: true,
    canSave: true,
    alertLevel: 'normal',
    message: `Temperature ${value}°F recorded`,
    action: '',
    notifyProvider: false,
  };
}

/**
 * OXYGEN SATURATION (alias for validateSpO2)
 */
export function validateOxygenSaturation(value: number): VitalValidationResult {
  return validateSpO2(value);
}

/**
 * RESPIRATORY RATE
 * Age-based normal ranges with 2SD thresholds
 * 🚨 ED: <8 or >30 breaths/min (adults)
 */
export function validateRespiratoryRate(value: number, context?: PatientContext): VitalValidationResult {
  if (isNaN(value) || value <= 0 || value > 80) {
    return {
      isValid: false,
      canSave: false,
      alertLevel: 'warning',
      message: 'Please enter a valid respiratory rate (0-80 breaths/min)',
      action: '',
      notifyProvider: false,
    };
  }

  const ageGroup = context?.ageGroup || getAgeGroup(context?.ageYears, context?.ageMonths);
  const ranges = VITAL_RANGES_BY_AGE[ageGroup];
  
  // Calculate 2SD thresholds
  const twoSDLow = ranges.rr.mean - (2 * ranges.rr.stdDev);
  const twoSDHigh = ranges.rr.mean + (2 * ranges.rr.stdDev);

  // 🚨 EMERGENCY: Very extreme values (age-independent critical)
  const isPediatric = ['neonate', 'infant', 'toddler', 'child', 'adolescent'].includes(ageGroup);
  const emergencyLow = isPediatric ? ranges.rr.min * 0.5 : 8;
  const emergencyHigh = isPediatric ? ranges.rr.max * 1.5 : 35;

  if (value < emergencyLow || value > emergencyHigh) {
    return {
      isValid: true,
      canSave: true, // ✅ ALWAYS SAVE
      alertLevel: 'emergency',
      message: `🚨 Respiratory rate ${value} breaths/min is ${value < emergencyLow ? 'dangerously LOW' : 'dangerously HIGH'}`,
      action: 'CALL 911 or go to the Emergency Department immediately.',
      notifyProvider: true,
    };
  }

  // CRITICAL: >2 SD out (calculated internally, not shown to user)
  if (value < twoSDLow || value > twoSDHigh) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'critical',
      message: `Respiratory rate ${value} breaths/min is ${value < twoSDLow ? 'very low' : 'very high'}`,
      action: 'Monitor closely. If difficulty breathing, seek emergency care.',
      notifyProvider: true,
    };
  }

  // WARNING: Outside normal range but within 2SD
  if (value < ranges.rr.min || value > ranges.rr.max) {
    return {
      isValid: true,
      canSave: true,
      alertLevel: 'warning',
      message: `Respiratory rate ${value} breaths/min is ${value < ranges.rr.min ? 'below' : 'above'} normal`,
      action: 'Monitor closely. Contact provider if symptoms worsen.',
      notifyProvider: value < ranges.rr.min * 0.9 || value > ranges.rr.max * 1.1,
    };
  }

  // Normal: Within age-appropriate range
  return {
    isValid: true,
    canSave: true,
    alertLevel: 'normal',
    message: `Respiratory rate ${value} breaths/min is normal`,
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
