/**
 * Clinical Vital Sign Validation System v2.0
 * MyHealth Ally - Context-Aware, Evidence-Based Thresholds
 * 
 * Key Features:
 * - Age-specific normal ranges (infant → adult)
 * - Disease-specific baselines (COPD, CHD, Asthma)
 * - Trend analysis (change from baseline)
 * - Pattern recognition (asthma triad: ↓SpO2 + ↑RR + ↑HR)
 * - Peak flow with personal best zones
 * - NEVER blocks saving
 * 
 * Sources:
 * - AAP Pediatric Vital Signs Guidelines
 * - British Thoracic Society Oxygen Guidelines
 * - ADA 2025 Diabetes Standards of Care
 * - PALS Guidelines 2015
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AlertLevel = 'normal' | 'warning' | 'critical';

export type AgeGroup = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export type ChronicCondition = 
  | 'none'
  | 'copd'
  | 'copd_severe'
  | 'asthma'
  | 'chd_cyanotic'      // Cyanotic congenital heart disease
  | 'chd_acyanotic'     // Acyanotic congenital heart disease
  | 'heart_failure'
  | 'diabetes_type1'
  | 'diabetes_type2'
  | 'hypertension'
  | 'obesity';

export interface PatientContext {
  ageGroup: AgeGroup;
  ageYears?: number;
  ageMonths?: number;       // For infants
  conditions: ChronicCondition[];
  baselineSpO2?: number;    // Known baseline for COPD/CHD patients
  baselineHR?: number;
  baselineBP?: { systolic: number; diastolic: number };
  peakFlowPersonalBest?: number;  // For asthmatics
  heightInches?: number;    // For peak flow prediction
}

export interface VitalValidationResult {
  isValid: boolean;
  alertLevel: AlertLevel;
  message: string;
  recommendation: string;
  notifyProvider: boolean;
  showEmergencyOptions: boolean;
  trendAlert?: string;      // If this represents a significant change
  patternAlert?: string;    // If part of a concerning pattern
}

export interface TrendData {
  previousValue: number;
  previousTimestamp: Date;
  values24h?: number[];     // Values in last 24 hours for pattern detection
}

// ============================================================================
// AGE GROUP UTILITIES
// ============================================================================

export function getAgeGroup(ageYears: number, ageMonths?: number): AgeGroup {
  const totalMonths = (ageYears * 12) + (ageMonths || 0);
  
  if (totalMonths < 1) return 'neonate';        // 0-28 days
  if (totalMonths < 12) return 'infant';        // 1-12 months
  if (ageYears < 3) return 'toddler';           // 1-3 years
  if (ageYears < 12) return 'child';            // 3-12 years
  if (ageYears < 18) return 'adolescent';       // 12-18 years
  if (ageYears < 65) return 'adult';            // 18-65 years
  return 'elderly';                              // 65+
}

// ============================================================================
// NORMAL RANGES BY AGE (Based on PALS Guidelines & Pediatric Literature)
// ============================================================================

interface VitalRanges {
  hr: { min: number; max: number };
  rr: { min: number; max: number };
  sbp: { min: number; max: number };
  dbp: { min: number; max: number };
  spo2: { min: number };
}

const VITAL_RANGES_BY_AGE: Record<AgeGroup, VitalRanges> = {
  neonate: {
    hr: { min: 100, max: 160 },
    rr: { min: 30, max: 60 },
    sbp: { min: 60, max: 90 },
    dbp: { min: 30, max: 60 },
    spo2: { min: 95 },  // <95% is concerning in neonates!
  },
  infant: {
    hr: { min: 100, max: 160 },
    rr: { min: 25, max: 50 },
    sbp: { min: 70, max: 100 },
    dbp: { min: 35, max: 65 },
    spo2: { min: 95 },
  },
  toddler: {
    hr: { min: 80, max: 130 },
    rr: { min: 20, max: 40 },
    sbp: { min: 80, max: 110 },
    dbp: { min: 40, max: 70 },
    spo2: { min: 95 },
  },
  child: {
    hr: { min: 70, max: 110 },
    rr: { min: 15, max: 30 },
    sbp: { min: 90, max: 120 },
    dbp: { min: 55, max: 80 },
    spo2: { min: 95 },
  },
  adolescent: {
    hr: { min: 60, max: 100 },
    rr: { min: 12, max: 20 },
    sbp: { min: 100, max: 130 },
    dbp: { min: 60, max: 85 },
    spo2: { min: 95 },
  },
  adult: {
    hr: { min: 60, max: 100 },
    rr: { min: 12, max: 20 },
    sbp: { min: 90, max: 140 },
    dbp: { min: 60, max: 90 },
    spo2: { min: 95 },
  },
  elderly: {
    hr: { min: 60, max: 100 },
    rr: { min: 12, max: 22 },
    sbp: { min: 100, max: 150 },  // Slightly higher acceptable for elderly
    dbp: { min: 60, max: 90 },
    spo2: { min: 94 },  // May be slightly lower baseline
  },
};

// ============================================================================
// DISEASE-SPECIFIC OXYGEN TARGETS
// Based on British Thoracic Society Guidelines
// ============================================================================

function getSpO2Targets(context: PatientContext): { min: number; max: number; critical: number } {
  // COPD patients: 88-92% is TARGET, not concerning
  if (context.conditions.includes('copd_severe')) {
    return { min: 85, max: 92, critical: 82 };  // 85-92% acceptable
  }
  if (context.conditions.includes('copd')) {
    return { min: 88, max: 92, critical: 85 };  // 88-92% target
  }
  
  // Cyanotic CHD: May have baseline 75-85%
  if (context.conditions.includes('chd_cyanotic')) {
    const baseline = context.baselineSpO2 || 80;
    return { 
      min: Math.max(75, baseline - 5), 
      max: 95, 
      critical: Math.max(70, baseline - 10) 
    };
  }
  
  // Pediatric patients: <95% is always concerning
  if (['neonate', 'infant', 'toddler', 'child'].includes(context.ageGroup)) {
    return { min: 95, max: 100, critical: 92 };
  }
  
  // Asthmatics: <95% with symptoms is concerning
  if (context.conditions.includes('asthma')) {
    return { min: 95, max: 100, critical: 92 };
  }
  
  // Standard adult
  return { min: 95, max: 100, critical: 90 };
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

function analyzeTrend(
  currentValue: number,
  trend: TrendData | undefined,
  significantChangePercent: number = 10
): { hasTrend: boolean; direction: 'up' | 'down' | 'stable'; message: string } {
  if (!trend?.previousValue) {
    return { hasTrend: false, direction: 'stable', message: '' };
  }
  
  const change = currentValue - trend.previousValue;
  const percentChange = Math.abs(change / trend.previousValue) * 100;
  
  if (percentChange < significantChangePercent) {
    return { hasTrend: false, direction: 'stable', message: '' };
  }
  
  const timeDiff = Date.now() - trend.previousTimestamp.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  const direction = change > 0 ? 'up' : 'down';
  const timeStr = hoursDiff < 24 
    ? `${Math.round(hoursDiff)} hours` 
    : `${Math.round(hoursDiff / 24)} days`;
  
  return {
    hasTrend: true,
    direction,
    message: `This is ${direction === 'up' ? 'an increase' : 'a decrease'} of ${percentChange.toFixed(0)}% from your reading ${timeStr} ago.`,
  };
}

// ============================================================================
// HEART RATE VALIDATION
// ============================================================================

export function validateHeartRate(
  value: number,
  context: PatientContext = { ageGroup: 'adult', conditions: [] },
  trend?: TrendData
): VitalValidationResult {
  if (isNaN(value) || value <= 0 || value > 300) {
    return {
      isValid: false,
      alertLevel: 'warning',
      message: 'Please enter a valid heart rate.',
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  const ranges = VITAL_RANGES_BY_AGE[context.ageGroup];
  const trendAnalysis = analyzeTrend(value, trend, 20);
  
  // Age-adjusted thresholds
  const criticalLow = Math.floor(ranges.hr.min * 0.7);   // 70% of min
  const warningLow = Math.floor(ranges.hr.min * 0.85);   // 85% of min
  const warningHigh = Math.ceil(ranges.hr.max * 1.15);   // 115% of max
  const criticalHigh = Math.ceil(ranges.hr.max * 1.3);   // 130% of max

  let result: VitalValidationResult;

  // CRITICAL LOW
  if (value < criticalLow) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Heart rate of ${value} bpm is very low for ${context.ageGroup === 'adult' ? 'an adult' : 'this age group'}.`,
      recommendation: context.ageGroup === 'adult' && value >= 40
        ? 'If you feel dizzy, faint, or short of breath, seek medical attention. This may be normal if you are very athletic.'
        : 'This needs medical evaluation. If there are any symptoms, seek care immediately.',
      notifyProvider: true,
      showEmergencyOptions: value < criticalLow * 0.8,
    };
  }
  // CRITICAL HIGH
  else if (value > criticalHigh) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Heart rate of ${value} bpm is significantly elevated.`,
      recommendation: 'Rest and recheck. If you have chest pain, difficulty breathing, or feel faint, seek emergency care.',
      notifyProvider: true,
      showEmergencyOptions: value > criticalHigh * 1.2,
    };
  }
  // WARNING LOW
  else if (value < warningLow) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Heart rate of ${value} bpm is below normal range.`,
      recommendation: 'Monitor how you feel. Report any dizziness or fatigue to your care team.',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }
  // WARNING HIGH
  else if (value > warningHigh) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Heart rate of ${value} bpm is elevated.`,
      recommendation: 'Could be from activity, caffeine, or stress. Rest and recheck in 15 minutes.',
      notifyProvider: value > ranges.hr.max * 1.25,
      showEmergencyOptions: false,
    };
  }
  // NORMAL
  else {
    result = {
      isValid: true,
      alertLevel: 'normal',
      message: `Heart rate of ${value} bpm is within normal range.`,
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  // Add trend information
  if (trendAnalysis.hasTrend) {
    result.trendAlert = trendAnalysis.message;
    if (trendAnalysis.direction === 'up' && value > ranges.hr.max) {
      result.notifyProvider = true;
    }
  }

  return result;
}

// ============================================================================
// OXYGEN SATURATION (SpO2) VALIDATION
// Disease-aware with COPD/CHD adjustments
// ============================================================================

export function validateSpO2(
  value: number,
  context: PatientContext = { ageGroup: 'adult', conditions: [] },
  trend?: TrendData
): VitalValidationResult {
  if (isNaN(value) || value < 0 || value > 100) {
    return {
      isValid: false,
      alertLevel: 'warning',
      message: 'Please enter a valid oxygen saturation (0-100%).',
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  const targets = getSpO2Targets(context);
  const trendAnalysis = analyzeTrend(value, trend, 3); // 3% change is significant for SpO2
  
  const isPediatric = ['neonate', 'infant', 'toddler', 'child'].includes(context.ageGroup);
  const hasCOPD = context.conditions.includes('copd') || context.conditions.includes('copd_severe');
  const hasCHD = context.conditions.includes('chd_cyanotic');
  const hasAsthma = context.conditions.includes('asthma');

  let result: VitalValidationResult;

  // CRITICAL - Below critical threshold
  if (value < targets.critical) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Oxygen saturation of ${value}% is low${hasCOPD ? ' even for COPD' : ''}.`,
      recommendation: isPediatric
        ? 'This is concerning. Seek medical evaluation promptly. If there is difficulty breathing or blue lips, call 911.'
        : hasCOPD
          ? 'This is below your safe range. Use supplemental oxygen if prescribed. If struggling to breathe, seek emergency care.'
          : 'Sit upright and take slow deep breaths. If you have difficulty breathing or feel confused, seek emergency care.',
      notifyProvider: true,
      showEmergencyOptions: value < targets.critical - 5,
    };
  }
  // WARNING - Below minimum but above critical
  else if (value < targets.min) {
    // Special handling for COPD - 88-92% is their target!
    if (hasCOPD && value >= 88 && value <= 92) {
      result = {
        isValid: true,
        alertLevel: 'normal',
        message: `Oxygen saturation of ${value}% is within your target range for COPD.`,
        recommendation: 'This is your therapeutic target. Higher oxygen levels can actually be harmful for you.',
        notifyProvider: false,
        showEmergencyOptions: false,
      };
    } 
    // CHD - check against known baseline
    else if (hasCHD && context.baselineSpO2 && value >= context.baselineSpO2 - 3) {
      result = {
        isValid: true,
        alertLevel: 'normal',
        message: `Oxygen saturation of ${value}% is close to your baseline.`,
        recommendation: 'This is typical for your heart condition.',
        notifyProvider: false,
        showEmergencyOptions: false,
      };
    }
    else {
      result = {
        isValid: true,
        alertLevel: 'warning',
        message: `Oxygen saturation of ${value}% is below ${isPediatric ? 'normal for children' : 'normal'}.`,
        recommendation: isPediatric
          ? 'This needs attention. Check positioning of the sensor. If truly low, contact your pediatrician.'
          : 'Take slow deep breaths and recheck. Ensure pulse oximeter is positioned correctly.',
        notifyProvider: isPediatric || value < 93,
        showEmergencyOptions: false,
      };
    }
  }
  // NORMAL
  else {
    result = {
      isValid: true,
      alertLevel: 'normal',
      message: `Oxygen saturation of ${value}% is normal.`,
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  // Trend analysis - sudden drops are always concerning
  if (trendAnalysis.hasTrend && trendAnalysis.direction === 'down') {
    result.trendAlert = trendAnalysis.message;
    if (value < targets.min + 2) {
      result.alertLevel = 'warning';
      result.notifyProvider = true;
      result.recommendation += ' The downward trend should be monitored.';
    }
  }

  return result;
}

// ============================================================================
// BLOOD PRESSURE VALIDATION
// Age-adjusted ranges
// ============================================================================

export function validateBloodPressure(
  systolic: number,
  diastolic: number,
  context: PatientContext = { ageGroup: 'adult', conditions: [] },
  trend?: TrendData
): VitalValidationResult {
  if (isNaN(systolic) || isNaN(diastolic) || systolic <= 0 || diastolic <= 0) {
    return {
      isValid: false,
      alertLevel: 'warning',
      message: 'Please enter valid blood pressure values.',
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  if (systolic <= diastolic) {
    return {
      isValid: false,
      alertLevel: 'warning',
      message: 'Systolic (top number) should be higher than diastolic (bottom number).',
      recommendation: 'Please re-measure.',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  const ranges = VITAL_RANGES_BY_AGE[context.ageGroup];
  const isPediatric = ['neonate', 'infant', 'toddler', 'child', 'adolescent'].includes(context.ageGroup);
  const hasHypertension = context.conditions.includes('hypertension');

  // Critical thresholds
  const criticalHighSBP = isPediatric ? ranges.sbp.max + 20 : 180;
  const criticalHighDBP = isPediatric ? ranges.dbp.max + 15 : 120;
  const criticalLowSBP = isPediatric ? ranges.sbp.min - 15 : 90;

  let result: VitalValidationResult;

  // CRITICAL HIGH (Hypertensive Crisis)
  if (systolic >= criticalHighSBP || diastolic >= criticalHighDBP) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is very high.`,
      recommendation: 'Wait 5 minutes and re-measure. If still elevated, or if you have headache, vision changes, or chest pain, seek emergency care.',
      notifyProvider: true,
      showEmergencyOptions: systolic >= 200 || diastolic >= 130,
    };
  }
  // CRITICAL LOW
  else if (systolic < criticalLowSBP) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is low.`,
      recommendation: 'If you feel dizzy or faint, lie down with legs elevated. Stay hydrated. Seek care if symptoms persist.',
      notifyProvider: true,
      showEmergencyOptions: systolic < 80,
    };
  }
  // WARNING HIGH
  else if (systolic > ranges.sbp.max || diastolic > ranges.dbp.max) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is elevated.`,
      recommendation: hasHypertension
        ? 'This is above your target. Take medications as prescribed and monitor closely.'
        : 'Rest for 5 minutes and recheck. Reduce sodium and stress. Discuss with your care team.',
      notifyProvider: systolic > ranges.sbp.max + 10 || diastolic > ranges.dbp.max + 10,
      showEmergencyOptions: false,
    };
  }
  // WARNING LOW
  else if (systolic < ranges.sbp.min + 10 || diastolic < ranges.dbp.min + 5) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is on the low side.`,
      recommendation: 'This may be normal for you. Stay hydrated and rise slowly from sitting.',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }
  // NORMAL
  else {
    result = {
      isValid: true,
      alertLevel: 'normal',
      message: `Blood pressure of ${systolic}/${diastolic} mmHg is within healthy range.`,
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  return result;
}

// ============================================================================
// RESPIRATORY RATE VALIDATION
// Age-adjusted with asthma awareness
// ============================================================================

export function validateRespiratoryRate(
  value: number,
  context: PatientContext = { ageGroup: 'adult', conditions: [] },
  trend?: TrendData
): VitalValidationResult {
  if (isNaN(value) || value <= 0 || value > 80) {
    return {
      isValid: false,
      alertLevel: 'warning',
      message: 'Please enter a valid respiratory rate.',
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  const ranges = VITAL_RANGES_BY_AGE[context.ageGroup];
  const isPediatric = ['neonate', 'infant', 'toddler', 'child'].includes(context.ageGroup);
  const hasAsthma = context.conditions.includes('asthma');
  
  const criticalLow = Math.floor(ranges.rr.min * 0.6);
  const criticalHigh = Math.ceil(ranges.rr.max * 1.5);

  let result: VitalValidationResult;

  // CRITICAL LOW
  if (value < criticalLow) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Respiratory rate of ${value} breaths/min is very low.`,
      recommendation: 'This is unusually slow. Check for responsiveness. Seek immediate medical attention.',
      notifyProvider: true,
      showEmergencyOptions: true,
    };
  }
  // CRITICAL HIGH
  else if (value > criticalHigh) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Respiratory rate of ${value} breaths/min indicates respiratory distress.`,
      recommendation: hasAsthma
        ? 'Use rescue inhaler immediately. If no improvement in 15 minutes, seek emergency care.'
        : 'This indicates difficulty breathing. Seek medical attention.',
      notifyProvider: true,
      showEmergencyOptions: isPediatric || value > criticalHigh * 1.2,
    };
  }
  // WARNING LOW
  else if (value < ranges.rr.min) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Respiratory rate of ${value} breaths/min is below normal.`,
      recommendation: 'May be normal when very relaxed. Recheck if feeling unusual.',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }
  // WARNING HIGH
  else if (value > ranges.rr.max) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Respiratory rate of ${value} breaths/min is elevated.`,
      recommendation: hasAsthma
        ? 'Check your peak flow. Consider rescue inhaler if needed.'
        : 'Could be from activity or anxiety. Rest and recheck.',
      notifyProvider: value > ranges.rr.max * 1.25,
      showEmergencyOptions: false,
    };
  }
  // NORMAL
  else {
    result = {
      isValid: true,
      alertLevel: 'normal',
      message: `Respiratory rate of ${value} breaths/min is normal.`,
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  // Trend alert for asthmatics
  if (hasAsthma && trend && analyzeTrend(value, trend, 20).hasTrend) {
    const trendInfo = analyzeTrend(value, trend, 20);
    if (trendInfo.direction === 'up') {
      result.trendAlert = trendInfo.message;
      result.patternAlert = 'Rising respiratory rate in asthma may indicate worsening control. Check peak flow.';
    }
  }

  return result;
}

// ============================================================================
// PEAK FLOW VALIDATION (For Asthmatics)
// Uses personal best for zone calculations
// ============================================================================

export function validatePeakFlow(
  value: number,
  context: PatientContext = { ageGroup: 'adult', conditions: ['asthma'] },
  trend?: TrendData
): VitalValidationResult {
  if (isNaN(value) || value < 50 || value > 900) {
    return {
      isValid: false,
      alertLevel: 'warning',
      message: 'Please enter a valid peak flow (50-900 L/min).',
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  // Use personal best if available, otherwise estimate based on height/age
  const personalBest = context.peakFlowPersonalBest || estimatePeakFlow(context);
  
  const greenZone = personalBest * 0.80;   // 80-100% = Green
  const yellowZone = personalBest * 0.50;  // 50-80% = Yellow
  // Below 50% = Red

  const percentOfBest = (value / personalBest) * 100;

  let result: VitalValidationResult;

  // RED ZONE: <50% of personal best - EMERGENCY
  if (value < yellowZone) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Peak flow of ${value} L/min is in the RED ZONE (${percentOfBest.toFixed(0)}% of best).`,
      recommendation: 'Use rescue inhaler immediately. If no improvement in 15 minutes, seek emergency care or call 911.',
      notifyProvider: true,
      showEmergencyOptions: true,
    };
  }
  // YELLOW ZONE: 50-80% of personal best - CAUTION
  else if (value < greenZone) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Peak flow of ${value} L/min is in the YELLOW ZONE (${percentOfBest.toFixed(0)}% of best).`,
      recommendation: 'Airways are narrowing. Use rescue inhaler per your action plan. Contact your care team if not improving.',
      notifyProvider: percentOfBest < 60,
      showEmergencyOptions: false,
    };
  }
  // GREEN ZONE: 80-100% of personal best - ALL CLEAR
  else {
    result = {
      isValid: true,
      alertLevel: 'normal',
      message: `Peak flow of ${value} L/min is in the GREEN ZONE (${percentOfBest.toFixed(0)}% of best).`,
      recommendation: 'Asthma is well controlled. Continue current medications.',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  // Check for declining trend
  if (trend) {
    const trendInfo = analyzeTrend(value, trend, 15);
    if (trendInfo.hasTrend && trendInfo.direction === 'down') {
      result.trendAlert = trendInfo.message;
      if (percentOfBest < 70) {
        result.patternAlert = 'Declining peak flow trend may indicate worsening asthma control.';
        result.notifyProvider = true;
      }
    }
  }

  return result;
}

function estimatePeakFlow(context: PatientContext): number {
  // Rough estimates based on height (when personal best unknown)
  // These are approximate - personal best is always preferred
  const height = context.heightInches || 66; // Default 5'6"
  
  if (context.ageGroup === 'child') {
    // Children: roughly height-based, varies widely
    return Math.round((height - 40) * 5 + 150);
  }
  
  // Adults: very rough estimate
  return Math.round(height * 7);  // ~460 for 5'6"
}

// ============================================================================
// TEMPERATURE VALIDATION
// ============================================================================

export function validateTemperature(
  value: number,
  context: PatientContext = { ageGroup: 'adult', conditions: [] }
): VitalValidationResult {
  if (isNaN(value) || value < 85 || value > 115) {
    return {
      isValid: false,
      alertLevel: 'warning',
      message: 'Please enter a valid temperature (85-115°F).',
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  const isPediatric = ['neonate', 'infant', 'toddler', 'child'].includes(context.ageGroup);
  const isNeonate = context.ageGroup === 'neonate';

  // Fever thresholds
  const lowGradeFever = isPediatric ? 100.4 : 99.5;
  const moderateFever = 101.5;
  const highFever = isPediatric ? 102.2 : 103;
  const criticalFever = 104;
  
  // Hypothermia thresholds
  const mildHypothermia = 97;
  const moderateHypothermia = 95;
  const severeHypothermia = 93;

  let result: VitalValidationResult;

  // CRITICAL HIGH FEVER
  if (value > criticalFever) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Temperature of ${value}°F is a high fever.`,
      recommendation: isPediatric
        ? 'Give fever reducers as directed. Seek medical care promptly. Cool compresses may help.'
        : 'Take fever reducers. If fever persists or you have other symptoms, seek medical attention.',
      notifyProvider: true,
      showEmergencyOptions: value > 105,
    };
  }
  // CRITICAL HYPOTHERMIA
  else if (value < severeHypothermia) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Temperature of ${value}°F is dangerously low.`,
      recommendation: 'Warm up gradually with blankets. Seek emergency care if confused or symptoms persist.',
      notifyProvider: true,
      showEmergencyOptions: value < 91,
    };
  }
  // WARNING - FEVER
  else if (value >= lowGradeFever) {
    const severity = value >= highFever ? 'high' : value >= moderateFever ? 'moderate' : 'low-grade';
    result = {
      isValid: true,
      alertLevel: value >= highFever ? 'critical' : 'warning',
      message: `Temperature of ${value}°F indicates a ${severity} fever.`,
      recommendation: isNeonate
        ? 'Fever in newborns needs medical evaluation. Contact your pediatrician.'
        : 'Rest and stay hydrated. Fever reducers may help. Monitor symptoms.',
      notifyProvider: isPediatric || value >= highFever,
      showEmergencyOptions: false,
    };
  }
  // WARNING - LOW TEMPERATURE
  else if (value < moderateHypothermia) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Temperature of ${value}°F is below normal.`,
      recommendation: 'Warm up gradually. If you cannot warm up or feel confused, seek care.',
      notifyProvider: value < 94,
      showEmergencyOptions: false,
    };
  }
  // SLIGHTLY LOW
  else if (value < mildHypothermia) {
    result = {
      isValid: true,
      alertLevel: 'normal',
      message: `Temperature of ${value}°F is slightly below normal.`,
      recommendation: 'May be normal for you or due to thermometer placement.',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }
  // NORMAL
  else {
    result = {
      isValid: true,
      alertLevel: 'normal',
      message: `Temperature of ${value}°F is normal.`,
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  return result;
}

// ============================================================================
// BLOOD GLUCOSE VALIDATION
// Based on ADA 2025 Standards
// ============================================================================

export function validateBloodGlucose(
  value: number,
  isFasting: boolean = false,
  context: PatientContext = { ageGroup: 'adult', conditions: [] }
): VitalValidationResult {
  if (isNaN(value) || value <= 0) {
    return {
      isValid: false,
      alertLevel: 'warning',
      message: 'Please enter a valid blood glucose value.',
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  const hasDiabetes = context.conditions.includes('diabetes_type1') || 
                      context.conditions.includes('diabetes_type2');
  const isType1 = context.conditions.includes('diabetes_type1');

  let result: VitalValidationResult;

  // CRITICAL LOW: <54 mg/dL (Level 2 Hypoglycemia)
  if (value < 54) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Blood glucose of ${value} mg/dL is low.`,
      recommendation: value < 40
        ? 'This is very low. Take 15-20g fast-acting carbs NOW. If confused or unable to swallow, someone should give glucagon or call 911.'
        : 'Follow 15-15 rule: Take 15g fast-acting carbs, wait 15 minutes, recheck. Repeat if still low.',
      notifyProvider: true,
      showEmergencyOptions: value < 40,
    };
  }
  // WARNING LOW: 54-69 mg/dL (Level 1 Hypoglycemia)
  else if (value < 70) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Blood glucose of ${value} mg/dL is below target.`,
      recommendation: 'Have a small snack with carbs. Recheck in 15-30 minutes.',
      notifyProvider: value < 60,
      showEmergencyOptions: false,
    };
  }
  // CRITICAL HIGH: >400 mg/dL
  else if (value > 400) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Blood glucose of ${value} mg/dL is very high.`,
      recommendation: isType1
        ? 'Check ketones. If positive or feeling unwell (nausea, vomiting, fruity breath), seek emergency care immediately.'
        : 'Stay hydrated. Take medications as prescribed. If feeling unwell, seek medical attention.',
      notifyProvider: true,
      showEmergencyOptions: value > 500,
    };
  }
  // WARNING HIGH: 251-400 mg/dL
  else if (value > 250) {
    result = {
      isValid: true,
      alertLevel: 'critical',
      message: `Blood glucose of ${value} mg/dL is elevated.`,
      recommendation: isType1
        ? 'Check ketones if you have test strips. Stay hydrated. Contact your care team.'
        : 'Stay hydrated. Take medications as prescribed. Monitor for symptoms.',
      notifyProvider: true,
      showEmergencyOptions: false,
    };
  }
  // ELEVATED: 181-250 mg/dL
  else if (value > 180) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Blood glucose of ${value} mg/dL is above target.`,
      recommendation: isFasting
        ? 'Fasting glucose should be 80-130 mg/dL. Discuss patterns with your care team.'
        : 'Post-meal elevations happen. Stay active, hydrate, monitor your next reading.',
      notifyProvider: value > 200,
      showEmergencyOptions: false,
    };
  }
  // ELEVATED FASTING
  else if (isFasting && value > 130 && hasDiabetes) {
    result = {
      isValid: true,
      alertLevel: 'warning',
      message: `Fasting glucose of ${value} mg/dL is above target.`,
      recommendation: 'Target is 80-130 mg/dL fasting. Monitor trends and discuss with care team.',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }
  // NORMAL
  else {
    result = {
      isValid: true,
      alertLevel: 'normal',
      message: `Blood glucose of ${value} mg/dL is within target.`,
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  return result;
}

// ============================================================================
// WEIGHT VALIDATION (with change detection)
// ============================================================================

export function validateWeight(
  value: number,
  previousValue?: number,
  daysSincePrevious?: number,
  context: PatientContext = { ageGroup: 'adult', conditions: [] }
): VitalValidationResult {
  if (isNaN(value) || value < 2 || value > 800) {
    return {
      isValid: false,
      alertLevel: 'warning',
      message: 'Please enter a valid weight.',
      recommendation: '',
      notifyProvider: false,
      showEmergencyOptions: false,
    };
  }

  const hasHeartFailure = context.conditions.includes('heart_failure');

  // Check for rapid weight change
  if (previousValue && daysSincePrevious && daysSincePrevious <= 7) {
    const change = value - previousValue;
    const absChange = Math.abs(change);
    const direction = change > 0 ? 'gain' : 'loss';

    // Heart failure patients: 3+ lb gain in 2 days is concerning
    if (hasHeartFailure && change > 0) {
      if (absChange >= 3 && daysSincePrevious <= 2) {
        return {
          isValid: true,
          alertLevel: 'critical',
          message: `Weight gain of ${absChange.toFixed(1)} lbs in ${daysSincePrevious} day(s).`,
          recommendation: 'Rapid weight gain may indicate fluid retention. Contact your care team today. Watch for shortness of breath or ankle swelling.',
          notifyProvider: true,
          showEmergencyOptions: false,
        };
      }
      if (absChange >= 5 && daysSincePrevious <= 7) {
        return {
          isValid: true,
          alertLevel: 'warning',
          message: `Weight gain of ${absChange.toFixed(1)} lbs this week.`,
          recommendation: 'This may indicate fluid retention. Monitor for swelling and shortness of breath. Contact your care team.',
          notifyProvider: true,
          showEmergencyOptions: false,
        };
      }
    }

    // General rapid change thresholds
    if (absChange >= 10 && daysSincePrevious <= 7) {
      return {
        isValid: true,
        alertLevel: 'critical',
        message: `Weight ${direction} of ${absChange.toFixed(1)} lbs in ${daysSincePrevious} day(s).`,
        recommendation: direction === 'gain'
          ? 'Rapid weight gain may indicate fluid retention or other issues. Contact your care team.'
          : 'Rapid weight loss needs evaluation. Ensure adequate nutrition. Contact your care team.',
        notifyProvider: true,
        showEmergencyOptions: false,
      };
    }

    if (absChange >= 5 && daysSincePrevious <= 7) {
      return {
        isValid: true,
        alertLevel: 'warning',
        message: `Weight ${direction} of ${absChange.toFixed(1)} lbs in ${daysSincePrevious} day(s).`,
        recommendation: 'Monitor daily. If trend continues, discuss with your care team.',
        notifyProvider: absChange >= 7,
        showEmergencyOptions: false,
      };
    }
  }

  return {
    isValid: true,
    alertLevel: 'normal',
    message: `Weight of ${value} lbs recorded.`,
    recommendation: '',
    notifyProvider: false,
    showEmergencyOptions: false,
  };
}

// ============================================================================
// PATTERN DETECTION - Asthma Triad
// Low SpO2 + High RR + High HR = concerning pattern
// ============================================================================

export interface VitalSet {
  spo2?: number;
  heartRate?: number;
  respiratoryRate?: number;
  peakFlow?: number;
}

export function detectAsthmaPattern(
  vitals: VitalSet,
  context: PatientContext
): { isPattern: boolean; severity: AlertLevel; message: string } {
  if (!context.conditions.includes('asthma')) {
    return { isPattern: false, severity: 'normal', message: '' };
  }

  const ranges = VITAL_RANGES_BY_AGE[context.ageGroup];
  let concernCount = 0;
  const concerns: string[] = [];

  // Check SpO2
  if (vitals.spo2 && vitals.spo2 < 95) {
    concernCount++;
    concerns.push(`SpO2 ${vitals.spo2}%`);
  }

  // Check respiratory rate
  if (vitals.respiratoryRate && vitals.respiratoryRate > ranges.rr.max) {
    concernCount++;
    concerns.push(`RR ${vitals.respiratoryRate}`);
  }

  // Check heart rate
  if (vitals.heartRate && vitals.heartRate > ranges.hr.max) {
    concernCount++;
    concerns.push(`HR ${vitals.heartRate}`);
  }

  // Check peak flow if available
  if (vitals.peakFlow && context.peakFlowPersonalBest) {
    const percentBest = (vitals.peakFlow / context.peakFlowPersonalBest) * 100;
    if (percentBest < 50) {
      concernCount += 2; // Peak flow <50% is very concerning
      concerns.push(`Peak Flow ${percentBest.toFixed(0)}%`);
    } else if (percentBest < 80) {
      concernCount++;
      concerns.push(`Peak Flow ${percentBest.toFixed(0)}%`);
    }
  }

  if (concernCount >= 2) {
    return {
      isPattern: true,
      severity: concernCount >= 3 ? 'critical' : 'warning',
      message: `Asthma pattern detected (${concerns.join(', ')}). Use rescue inhaler. If no improvement, seek care.`,
    };
  }

  return { isPattern: false, severity: 'normal', message: '' };
}

// ============================================================================
// STYLING HELPERS
// ============================================================================

export function getAlertStyles(level: AlertLevel): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (level) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
      };
    case 'warning':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: 'text-amber-600',
      };
    default:
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-600',
      };
  }
}
