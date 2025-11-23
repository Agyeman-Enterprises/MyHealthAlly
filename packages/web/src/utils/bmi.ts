/**
 * Calculate BMI from weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Get BMI category label
 */
export function getBMICategory(bmi: number): {
  label: string;
  status: 'underweight' | 'normal' | 'overweight' | 'obese';
  color: string;
} {
  if (bmi < 18.5) {
    return { label: 'Underweight', status: 'underweight', color: 'var(--color-warning)' };
  } else if (bmi < 25) {
    return { label: 'Normal', status: 'normal', color: 'var(--color-success)' };
  } else if (bmi < 30) {
    return { label: 'Overweight', status: 'overweight', color: 'var(--color-warning)' };
  } else {
    return { label: 'Obese', status: 'obese', color: 'var(--color-danger)' };
  }
}

/**
 * Convert weight from lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

/**
 * Convert weight from kg to lbs
 */
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

/**
 * Convert height from inches to cm
 */
export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

/**
 * Convert height from cm to inches
 */
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

