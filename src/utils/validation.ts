// Nigerian phone number validation
export const validateNigerianPhone = (phone: string): boolean => {
  let cleaned = phone.trim();
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  cleaned = cleaned.replace(/\D/g, '');

  // Accept +234XXXXXXXXXX, 234XXXXXXXXXX, 080XXXXXXXXX, 8XXXXXXXXX
  if (cleaned.length === 13 && cleaned.startsWith('234')) {
    return true;
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return true;
  }
  if (cleaned.length === 10 && /^[789][01]\d{8}$/.test(cleaned)) {
    return true;
  }
  return false;
};

// Format Nigerian phone number to international format (+234XXXXXXXXXX)
export const formatNigerianPhone = (phone: string): string => {
  let cleaned = phone.trim();
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  cleaned = cleaned.replace(/\D/g, '');

  if (cleaned.length === 13 && cleaned.startsWith('234')) {
    return '+'.concat(cleaned);
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return '+234' + cleaned.substring(1);
  }
  if (cleaned.length === 10 && /^[789][01]\d{8}$/.test(cleaned)) {
    return '+234' + cleaned;
  }
  return phone; // Return as is if can't format
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// NIN validation (11 digits)
export const validateNIN = (nin: string): boolean => {
  const cleaned = nin.replace(/\D/g, '');
  return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
};

// BVN validation (11 digits)
export const validateBVN = (bvn: string): boolean => {
  const cleaned = bvn.replace(/\D/g, '');
  return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
};

// Nigerian states
export const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Common Nigerian LGAs (Local Government Areas) - you can expand this
export const nigerianLGAs: Record<string, string[]> = {
  'Lagos': [
    'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry',
    'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe',
    'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu',
    'Surulere'
  ],
  'Abuja': [
    'Abaji', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'
  ],
  'Rivers': [
    'Abua-Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru',
    'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana',
    'Obio-Akpor', 'Ogba-Egbema-Ndoni', 'Ogu-Bolo', 'Okrika', 'Omuma', 'Opobo-Nkoro',
    'Oyigbo', 'Port Harcourt', 'Tai'
  ]
};

// Property price validation
export const validatePropertyPrice = (price: string): boolean => {
  const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
  return !isNaN(numericPrice) && numericPrice > 0;
};

// Format Nigerian currency
export const formatNigerianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}; 