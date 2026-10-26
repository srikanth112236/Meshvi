import { Country } from 'country-state-city';

export interface CountryPhoneInfo {
  isoCode: string;
  name: string;
  flag: string;
  dialCode: string;
}

export interface PhoneValidationRule {
  countryCode: string;
  dialCode: string;
  name: string;
  minLength: number;
  maxLength: number;
  pattern: RegExp;
  placeholder: string;
  formatExample: string;
  errorMessage: string;
}

// Priority countries shown at the top of the selector
const PRIORITY_ISO_CODES = ['IN', 'US', 'GB', 'AU', 'SG', 'AE', 'CA', 'DE', 'SA', 'FR', 'JP'];

// Specialized country rules
const COUNTRY_SPECIFIC_RULES: Record<string, Partial<PhoneValidationRule>> = {
  IN: {
    minLength: 10,
    maxLength: 10,
    pattern: /^[6-9]\d{9}$/,
    placeholder: '98765 43210',
    formatExample: '+91 98765 43210',
    errorMessage: 'India mobile numbers must be 10 digits starting with 6, 7, 8, or 9.',
  },
  US: {
    minLength: 10,
    maxLength: 10,
    pattern: /^[2-9]\d{2}[2-9]\d{6}$/,
    placeholder: '(415) 890-2410',
    formatExample: '+1 (415) 890-2410',
    errorMessage: 'US numbers must be 10 digits with a valid area code (e.g. 415 890 2410).',
  },
  CA: {
    minLength: 10,
    maxLength: 10,
    pattern: /^[2-9]\d{2}[2-9]\d{6}$/,
    placeholder: '(416) 555-0199',
    formatExample: '+1 (416) 555-0199',
    errorMessage: 'Canada numbers must be 10 digits with a valid area code.',
  },
  GB: {
    minLength: 10,
    maxLength: 11,
    pattern: /^(?:7\d{9}|\d{10,11})$/,
    placeholder: '7911 123456',
    formatExample: '+44 7911 123456',
    errorMessage: 'UK mobile numbers must be 10-11 digits (e.g. 7911 123456).',
  },
  AU: {
    minLength: 9,
    maxLength: 9,
    pattern: /^(?:4\d{8}|\d{9})$/,
    placeholder: '412 345 678',
    formatExample: '+61 412 345 678',
    errorMessage: 'Australian mobile numbers must be 9 digits (e.g. 412 345 678).',
  },
  SG: {
    minLength: 8,
    maxLength: 8,
    pattern: /^[89]\d{7}$/,
    placeholder: '9123 4567',
    formatExample: '+65 9123 4567',
    errorMessage: 'Singapore mobile numbers must be 8 digits starting with 8 or 9.',
  },
  AE: {
    minLength: 9,
    maxLength: 9,
    pattern: /^5\d{8}$/,
    placeholder: '50 123 4567',
    formatExample: '+971 50 123 4567',
    errorMessage: 'UAE mobile numbers must be 9 digits starting with 5 (e.g. 50 123 4567).',
  },
  DE: {
    minLength: 10,
    maxLength: 11,
    pattern: /^1[567]\d{8,9}$/,
    placeholder: '151 23456789',
    formatExample: '+49 151 23456789',
    errorMessage: 'German mobile numbers must be 10-11 digits starting with 15, 16, or 17.',
  },
  SA: {
    minLength: 9,
    maxLength: 9,
    pattern: /^5\d{8}$/,
    placeholder: '50 123 4567',
    formatExample: '+966 50 123 4567',
    errorMessage: 'Saudi mobile numbers must be 9 digits starting with 5.',
  },
};

/**
 * Get curated, sorted list of all countries with phone dial codes
 */
export const getAllCountryPhoneInfos = (): CountryPhoneInfo[] => {
  const all = Country.getAllCountries();
  const list: CountryPhoneInfo[] = [];

  for (const c of all) {
    if (!c.phonecode) continue;
    const cleanDigits = c.phonecode.replace(/[^\d]/g, '');
    if (!cleanDigits) continue;
    list.push({
      isoCode: c.isoCode,
      name: c.name,
      flag: c.flag,
      dialCode: `+${cleanDigits}`,
    });
  }

  // Sort priority countries first, then alphabetical
  return list.sort((a, b) => {
    const aPriority = PRIORITY_ISO_CODES.indexOf(a.isoCode);
    const bPriority = PRIORITY_ISO_CODES.indexOf(b.isoCode);

    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;

    return a.name.localeCompare(b.name);
  });
};

/**
 * Get phone validation rule for a specific country ISO code
 */
export const getPhoneRuleForCountry = (isoCode: string): PhoneValidationRule => {
  const upperIso = (isoCode || 'IN').toUpperCase();
  const country = Country.getCountryByCode(upperIso);
  const cleanDigits = (country?.phonecode || '91').replace(/[^\d]/g, '') || '91';
  const dialCode = `+${cleanDigits}`;
  const name = country?.name || 'Country';

  const specific = COUNTRY_SPECIFIC_RULES[upperIso];
  if (specific) {
    return {
      countryCode: upperIso,
      dialCode: specific.dialCode || dialCode,
      name,
      minLength: specific.minLength ?? 7,
      maxLength: specific.maxLength ?? 15,
      pattern: specific.pattern ?? /^\d{7,15}$/,
      placeholder: specific.placeholder || 'Mobile phone number',
      formatExample: specific.formatExample || `${dialCode} 9876543210`,
      errorMessage: specific.errorMessage || `Invalid phone number for ${name}.`,
    };
  }

  // Generic ITU-T E.164 rule
  return {
    countryCode: upperIso,
    dialCode,
    name,
    minLength: 7,
    maxLength: 15,
    pattern: /^\d{7,15}$/,
    placeholder: 'Mobile phone number',
    formatExample: `${dialCode} 123456789`,
    errorMessage: `Phone number for ${name} must be between 7 and 15 digits.`,
  };
};

/**
 * Clean user-entered digits and strip redundant country code / leading zeros
 */
export const cleanSubscriberDigits = (input: string, dialCode: string): string => {
  if (!input) return '';
  let cleaned = input.trim();

  // Strip dial code if user typed it (e.g. "+91 98765" -> "98765")
  const rawDialDigits = dialCode.replace(/[^\d]/g, '');
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.replace(/[^\d]/g, '');
    if (digitsOnly.startsWith(rawDialDigits)) {
      cleaned = digitsOnly.slice(rawDialDigits.length);
    }
  }

  // Remove non-digit characters
  let digits = cleaned.replace(/[^\d]/g, '');

  // If starts with raw dial digits without +, remove it if it exceeds min length
  if (digits.startsWith(rawDialDigits) && digits.length > rawDialDigits.length + 6) {
    digits = digits.slice(rawDialDigits.length);
  }

  // Strip leading 0 (national trunk prefix like 09876... or 07911...)
  if (digits.startsWith('0') && digits.length > 8) {
    digits = digits.replace(/^0+/, '');
  }

  return digits;
};

/**
 * Format national subscriber digits into clean spaced visual string
 */
export const formatSubscriberDigits = (digits: string, countryIso: string): string => {
  if (!digits) return '';
  const upperIso = (countryIso || '').toUpperCase();

  if (upperIso === 'IN' && digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if ((upperIso === 'US' || upperIso === 'CA') && digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (upperIso === 'GB' && (digits.length === 10 || digits.length === 11)) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  if (upperIso === 'AU' && digits.length === 9) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (upperIso === 'SG' && digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  if (upperIso === 'AE' && digits.length === 9) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  // Generic formatting: groups of 3 or 4
  if (digits.length > 7) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  return digits;
};

export interface PhoneValidationResult {
  isValid: boolean;
  rawDigits: string;
  formattedNumber: string; // e.g. "+91 98765 43210"
  dialCode: string;
  errorMessage?: string;
}

/**
 * Validate phone number against country rule
 */
export const validatePhoneNumber = (
  input: string,
  countryIso: string,
  customDialCode?: string
): PhoneValidationResult => {
  const rule = getPhoneRuleForCountry(countryIso);
  const effectiveDialCode = customDialCode || rule.dialCode;

  if (!input || !input.trim()) {
    return {
      isValid: false,
      rawDigits: '',
      formattedNumber: '',
      dialCode: effectiveDialCode,
      errorMessage: `Phone number is mandatory. Please provide a verified mobile number.`,
    };
  }

  const digits = cleanSubscriberDigits(input, effectiveDialCode);

  if (!digits) {
    return {
      isValid: false,
      rawDigits: '',
      formattedNumber: '',
      dialCode: effectiveDialCode,
      errorMessage: `Please enter valid digits for your mobile phone.`,
    };
  }

  if (digits.length < rule.minLength) {
    return {
      isValid: false,
      rawDigits: digits,
      formattedNumber: `${effectiveDialCode} ${digits}`,
      dialCode: effectiveDialCode,
      errorMessage: `${rule.name} number is too short (${digits.length}/${rule.minLength} digits).`,
    };
  }

  if (digits.length > rule.maxLength) {
    return {
      isValid: false,
      rawDigits: digits,
      formattedNumber: `${effectiveDialCode} ${digits}`,
      dialCode: effectiveDialCode,
      errorMessage: `${rule.name} number is too long (${digits.length}/${rule.maxLength} digits).`,
    };
  }

  if (!rule.pattern.test(digits)) {
    return {
      isValid: false,
      rawDigits: digits,
      formattedNumber: `${effectiveDialCode} ${digits}`,
      dialCode: effectiveDialCode,
      errorMessage: rule.errorMessage,
    };
  }

  const visualDigits = formatSubscriberDigits(digits, countryIso);
  const fullFormatted = `${effectiveDialCode} ${visualDigits}`.trim();

  return {
    isValid: true,
    rawDigits: digits,
    formattedNumber: fullFormatted,
    dialCode: effectiveDialCode,
  };
};

/**
 * Parse an existing international number into countryIso, dialCode, subscriber digits
 */
export const parseExistingPhoneNumber = (
  fullNumber?: string | null,
  fallbackIso: string = 'SG'
): { countryIso: string; dialCode: string; subscriberDigits: string } => {
  if (!fullNumber || !fullNumber.trim()) {
    const rule = getPhoneRuleForCountry(fallbackIso);
    return { countryIso: fallbackIso, dialCode: rule.dialCode, subscriberDigits: '' };
  }

  const trimmed = fullNumber.trim();
  const allCountries = getAllCountryPhoneInfos();

  // Sort dial codes by length descending to match longest prefix first (+971 before +97, etc.)
  const sortedByDialLen = [...allCountries].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );

  for (const c of sortedByDialLen) {
    if (trimmed.startsWith(c.dialCode)) {
      const rest = trimmed.slice(c.dialCode.length).trim();
      return {
        countryIso: c.isoCode,
        dialCode: c.dialCode,
        subscriberDigits: rest.replace(/[^\d]/g, ''),
      };
    }
  }

  const rule = getPhoneRuleForCountry(fallbackIso);
  return {
    countryIso: fallbackIso,
    dialCode: rule.dialCode,
    subscriberDigits: trimmed.replace(/[^\d]/g, ''),
  };
};
