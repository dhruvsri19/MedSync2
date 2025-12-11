
/**
 * Emergency Service
 * Handles mapping of countries to emergency numbers (prioritizing Ambulance/Medical).
 * Defaults to 112 (International GSM Emergency Number) if unknown.
 */

// Priority: Medical/Ambulance > General Emergency
export const EMERGENCY_NUMBERS: Record<string, string> = {
  'United States': '911',
  'United Kingdom': '999',
  'Canada': '911',
  'Australia': '000',
  'India': '112', // 108 is also Ambulance, but 112 is standard unified
  'New Zealand': '111',
  'Japan': '119', // 119 for Ambulance/Fire (110 is Police)
  'China': '120', // 120 for Ambulance
  'Brazil': '192', // SAMU (Medical)
  'France': '15', // SAMU (Medical) - 112 also works
  'Germany': '112',
  'Italy': '118', // Medical Emergency
  'Russia': '103', // Ambulance
  'South Africa': '10177', // Ambulance/Fire
  'South Korea': '119',
  'Mexico': '911',
  'Argentina': '107', // Ambulance
  'Spain': '112',
  'Netherlands': '112',
  'Sweden': '112',
  'Switzerland': '144', // Ambulance
  'Turkey': '112',
  'Indonesia': '118', // Ambulance
  'Singapore': '995', // Ambulance/Fire
  'Thailand': '1669', // Medical Emergency
  'Vietnam': '115', // Ambulance
  'Philippines': '911',
  'Malaysia': '999',
};

// Map TimeZones to Countries (Approximation for auto-detect)
const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  'America/New_York': 'United States',
  'America/Los_Angeles': 'United States',
  'America/Chicago': 'United States',
  'America/Denver': 'United States',
  'America/Phoenix': 'United States',
  'Europe/London': 'United Kingdom',
  'Asia/Kolkata': 'India',
  'Australia/Sydney': 'Australia',
  'Australia/Melbourne': 'Australia',
  'Australia/Perth': 'Australia',
  'America/Toronto': 'Canada',
  'America/Vancouver': 'Canada',
  'Europe/Berlin': 'Germany',
  'Europe/Paris': 'France',
  'Asia/Tokyo': 'Japan',
  'Asia/Shanghai': 'China',
  'Asia/Singapore': 'Singapore',
  // Add more as needed
};

export const getRecommendedEmergencyNumber = (country: string): string => {
  return EMERGENCY_NUMBERS[country] || '112';
};

export const detectCountryFromTimeZone = (): string | null => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // 1. Try direct match
    if (TIMEZONE_COUNTRY_MAP[timeZone]) {
      return TIMEZONE_COUNTRY_MAP[timeZone];
    }
    
    // 2. Try Heuristic Fallbacks based on region prefix
    if (timeZone.startsWith('America/')) {
        if (timeZone.includes('Canada') || timeZone.includes('Vancouver') || timeZone.includes('Toronto')) return 'Canada';
        if (timeZone.includes('Sao_Paulo')) return 'Brazil';
        if (timeZone.includes('Mexico')) return 'Mexico';
        return 'United States'; // Broad default for America/
    }
    if (timeZone.startsWith('Europe/')) {
        if (timeZone.includes('London')) return 'United Kingdom';
        if (timeZone.includes('Paris')) return 'France';
        if (timeZone.includes('Berlin')) return 'Germany';
        if (timeZone.includes('Rome')) return 'Italy';
        if (timeZone.includes('Madrid')) return 'Spain';
        return 'United Kingdom'; // Broad default
    }
    if (timeZone.startsWith('Australia/')) return 'Australia';
    if (timeZone.startsWith('Asia/Kolkata')) return 'India';
    
    return null;
  } catch (e) {
    console.warn("Could not detect timezone", e);
    return null;
  }
};
