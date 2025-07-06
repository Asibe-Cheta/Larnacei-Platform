import { Currency } from '@prisma/client';

/**
 * Format price in Nigerian currency (kobo to naira)
 */
export function formatPrice(priceInKobo: number, currency: Currency = Currency.NGN): string {
  if (currency === Currency.NGN) {
    const priceInNaira = priceInKobo / 100;
    
    if (priceInNaira >= 1000000) {
      return `₦${(priceInNaira / 1000000).toFixed(1)}M`;
    } else if (priceInNaira >= 1000) {
      return `₦${(priceInNaira / 1000).toFixed(1)}K`;
    } else {
      return `₦${priceInNaira.toLocaleString()}`;
    }
  } else if (currency === Currency.USD) {
    const priceInDollars = priceInKobo / 100;
    return `$${priceInDollars.toLocaleString()}`;
  } else if (currency === Currency.GBP) {
    const priceInPounds = priceInKobo / 100;
    return `£${priceInPounds.toLocaleString()}`;
  }
  
  return `${priceInKobo.toLocaleString()}`;
}

/**
 * Format price with full currency display
 */
export function formatFullPrice(priceInKobo: number, currency: Currency = Currency.NGN): string {
  if (currency === Currency.NGN) {
    const priceInNaira = priceInKobo / 100;
    return `₦${priceInNaira.toLocaleString()}`;
  } else if (currency === Currency.USD) {
    const priceInDollars = priceInKobo / 100;
    return `$${priceInDollars.toLocaleString()}`;
  } else if (currency === Currency.GBP) {
    const priceInPounds = priceInKobo / 100;
    return `£${priceInPounds.toLocaleString()}`;
  }
  
  return `${priceInKobo.toLocaleString()}`;
}

/**
 * Format property size
 */
export function formatPropertySize(sizeInSqm?: number, sizeInHectares?: number): string {
  if (sizeInHectares) {
    return `${sizeInHectares} hectares`;
  } else if (sizeInSqm) {
    return `${sizeInSqm.toLocaleString()} sqm`;
  }
  return 'Size not specified';
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Format Nigerian phone numbers
  if (cleanPhone.startsWith('234')) {
    const number = cleanPhone.slice(3);
    return `+234 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  } else if (cleanPhone.startsWith('0')) {
    const number = cleanPhone.slice(1);
    return `+234 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  } else if (cleanPhone.length === 10) {
    return `+234 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
  }
  
  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

/**
 * Format number with appropriate suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
} 