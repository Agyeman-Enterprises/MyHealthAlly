/**
 * Field Validation Utilities
 * 
 * CANON RULE: Once a field is coded, it MUST be auto-validated for content.
 * This file provides validation for all common form fields.
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  formatted?: string; // Formatted/cleaned version of input
}

/**
 * Validate and format US phone number
 * Accepts: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890
 */
export function validatePhone(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'Phone number is required' };
  }

  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Handle +1 country code
  const normalized = digits.startsWith('1') && digits.length === 11 
    ? digits.slice(1) 
    : digits;

  if (normalized.length !== 10) {
    return { 
      isValid: false, 
      message: 'Please enter a valid 10-digit phone number' 
    };
  }

  // Format as (###) ###-####
  const formatted = `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;

  return { isValid: true, formatted };
}

/**
 * Validate email address
 */
export function validateEmail(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(value.trim())) {
    return { 
      isValid: false, 
      message: 'Please enter a valid email address' 
    };
  }

  return { isValid: true, formatted: value.trim().toLowerCase() };
}

/**
 * Validate US ZIP code (5 digits or ZIP+4)
 */
export function validateZipCode(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'ZIP code is required' };
  }

  const cleaned = value.replace(/\s/g, '');
  
  // 5-digit ZIP
  if (/^\d{5}$/.test(cleaned)) {
    return { isValid: true, formatted: cleaned };
  }
  
  // ZIP+4 format
  if (/^\d{5}-?\d{4}$/.test(cleaned)) {
    const digits = cleaned.replace(/-/g, '');
    return { isValid: true, formatted: `${digits.slice(0, 5)}-${digits.slice(5)}` };
  }

  return { 
    isValid: false, 
    message: 'Please enter a valid 5-digit ZIP code' 
  };
}

/**
 * Validate US state (2-letter abbreviation or full name)
 */
const US_STATES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
  // Territories
  'AS': 'American Samoa', 'GU': 'Guam', 'MP': 'Northern Mariana Islands',
  'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'FM': 'Federated States of Micronesia',
  'MH': 'Marshall Islands', 'PW': 'Palau',
};

export function validateState(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'State is required' };
  }

  const input = value.trim().toUpperCase();
  
  // Check if it's a valid abbreviation
  if (US_STATES[input]) {
    return { isValid: true, formatted: input };
  }

  // Check if it's a full state name
  const abbrev = Object.entries(US_STATES).find(
    ([, name]) => name.toUpperCase() === input
  )?.[0];

  if (abbrev) {
    return { isValid: true, formatted: abbrev };
  }

  return { 
    isValid: false, 
    message: 'Please enter a valid US state or territory' 
  };
}

/**
 * Validate date of birth
 */
export function validateDateOfBirth(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'Date of birth is required' };
  }

  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }

  const today = new Date();
  const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  
  if (date > today) {
    return { isValid: false, message: 'Date of birth cannot be in the future' };
  }

  if (date < minDate) {
    return { isValid: false, message: 'Please enter a valid date of birth' };
  }

  return { isValid: true, formatted: date.toISOString().split('T')[0] };
}

/**
 * Validate Social Security Number (for intake forms)
 * Note: SSN should be handled with extreme care and encryption
 */
export function validateSSN(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'SSN is required' };
  }

  const digits = value.replace(/\D/g, '');

  if (digits.length !== 9) {
    return { 
      isValid: false, 
      message: 'SSN must be 9 digits' 
    };
  }

  // Basic validation - no all zeros in any group
  const area = digits.slice(0, 3);
  const group = digits.slice(3, 5);
  const serial = digits.slice(5);

  if (area === '000' || group === '00' || serial === '0000') {
    return { 
      isValid: false, 
      message: 'Please enter a valid SSN' 
    };
  }

  // Format as ###-##-#### (masked for display: ***-**-####)
  const formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;

  return { isValid: true, formatted };
}

/**
 * Validate insurance ID
 */
export function validateInsuranceId(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'Insurance ID is required' };
  }

  const cleaned = value.trim().toUpperCase();

  if (cleaned.length < 5 || cleaned.length > 20) {
    return { 
      isValid: false, 
      message: 'Insurance ID should be between 5-20 characters' 
    };
  }

  return { isValid: true, formatted: cleaned };
}

/**
 * Validate name (first, last, etc.)
 */
export function validateName(value: string, fieldName: string = 'Name'): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const cleaned = value.trim();

  if (cleaned.length < 2) {
    return { 
      isValid: false, 
      message: `${fieldName} must be at least 2 characters` 
    };
  }

  // Check for invalid characters (only letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(cleaned)) {
    return { 
      isValid: false, 
      message: `${fieldName} contains invalid characters` 
    };
  }

  // Capitalize first letter of each word
  const formatted = cleaned
    .toLowerCase()
    .replace(/(?:^|\s|'|-)\S/g, (char) => char.toUpperCase());

  return { isValid: true, formatted };
}

/**
 * Validate address line
 */
export function validateAddress(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'Address is required' };
  }

  const cleaned = value.trim();

  if (cleaned.length < 5) {
    return { 
      isValid: false, 
      message: 'Please enter a complete address' 
    };
  }

  return { isValid: true, formatted: cleaned };
}

/**
 * Generic required field validation
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true, formatted: value.trim() };
}

/**
 * Validate numeric input within range
 */
export function validateNumber(
  value: string | number,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, message: `${fieldName} must be no more than ${max}` };
  }

  return { isValid: true, formatted: num.toString() };
}

/**
 * Create a validator that can be used with form libraries
 */
export function createValidator<T extends Record<string, unknown>>(
  validationRules: Record<keyof T, (value: unknown) => ValidationResult>
) {
  return (values: T): Record<keyof T, string | undefined> => {
    const errors: Record<string, string | undefined> = {};

    for (const [field, validate] of Object.entries(validationRules)) {
      const result = validate(values[field as keyof T]);
      if (!result.isValid) {
        errors[field] = result.message;
      }
    }

    return errors as Record<keyof T, string | undefined>;
  };
}
