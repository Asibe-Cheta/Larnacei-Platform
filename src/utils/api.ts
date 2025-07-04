import { Currency } from "@prisma/client";
import { PriceDisplay } from "@/types/api";

/**
 * Format price from kobo to naira with proper currency formatting
 * @param priceInKobo - Price in kobo (smallest currency unit)
 * @param currency - Currency type
 * @returns Formatted price object
 */
export function formatPrice(priceInKobo: number, currency: Currency = Currency.NGN): PriceDisplay {
  const amount = priceInKobo / 100; // Convert kobo to naira
  
  let formatted: string;
  
  switch (currency) {
    case Currency.NGN:
      formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
      break;
    case Currency.USD:
      formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
      break;
    case Currency.GBP:
      formatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
      break;
    case Currency.EUR:
      formatted = new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
      break;
    default:
      formatted = `${amount.toLocaleString()} ${currency}`;
  }
  
  return {
    amount,
    currency,
    formatted,
    inKobo: priceInKobo,
  };
}

/**
 * Convert naira amount to kobo
 * @param amount - Amount in naira
 * @returns Amount in kobo
 */
export function toKobo(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert kobo amount to naira
 * @param kobo - Amount in kobo
 * @returns Amount in naira
 */
export function toNaira(kobo: number): number {
  return kobo / 100;
}

/**
 * Format Nigerian phone number to standard format
 * @param phone - Phone number in any format
 * @returns Formatted phone number
 */
export function formatNigerianPhone(phone: string): string {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Convert to +234 format
  if (cleanPhone.startsWith("234")) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith("0")) {
    return `+234${cleanPhone.slice(1)}`;
  } else if (cleanPhone.length === 10) {
    return `+234${cleanPhone}`;
  }
  
  return phone;
}

/**
 * Validate Nigerian phone number
 * @param phone - Phone number to validate
 * @returns True if valid Nigerian phone number
 */
export function isValidNigerianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  
  const patterns = [
    /^\+234[789][01]\d{8}$/, // +234 format
    /^234[789][01]\d{8}$/,   // 234 format
    /^0[789][01]\d{8}$/,     // 0 format
    /^[789][01]\d{8}$/,      // Direct format
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
}

/**
 * Validate NIN (National Identification Number)
 * @param nin - NIN to validate
 * @returns True if valid NIN
 */
export function isValidNIN(nin: string): boolean {
  return /^\d{11}$/.test(nin);
}

/**
 * Create API error response
 * @param message - Error message
 * @param status - HTTP status code
 * @param error - Error details
 * @returns Error response object
 */
export function createApiError(message: string, status: number = 500, error?: string) {
  return {
    success: false,
    message,
    error,
    status,
  };
}

/**
 * Create API success response
 * @param data - Response data
 * @param message - Success message
 * @returns Success response object
 */
export function createApiSuccess<T>(data: T, message: string = "Success") {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Create paginated API response
 * @param data - Response data array
 * @param pagination - Pagination metadata
 * @param message - Success message
 * @returns Paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  message: string = "Data fetched successfully"
) {
  return {
    success: true,
    message,
    data,
    pagination,
  };
}

/**
 * Handle API errors and return appropriate response
 * @param error - Error object
 * @returns Error response object
 */
export function handleApiError(error: any) {
  console.error("API Error:", error);
  
  if (error.name === "ZodError") {
    return createApiError(
      "Validation error",
      400,
      error.errors.map((e: any) => e.message).join(", ")
    );
  }
  
  if (error.code === "P2002") {
    return createApiError(
      "Duplicate entry",
      409,
      "A record with this information already exists"
    );
  }
  
  if (error.code === "P2025") {
    return createApiError(
      "Record not found",
      404,
      "The requested record was not found"
    );
  }
  
  return createApiError(
    "Internal server error",
    500,
    error.message || "An unexpected error occurred"
  );
}

/**
 * Build query string from filters object
 * @param filters - Filter object
 * @returns Query string
 */
export function buildQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v.toString()));
      } else {
        params.set(key, value.toString());
      }
    }
  });
  
  return params.toString();
}

/**
 * Parse query string to filters object
 * @param queryString - Query string
 * @returns Filters object
 */
export function parseQueryString(queryString: string): Record<string, any> {
  const params = new URLSearchParams(queryString);
  const filters: Record<string, any> = {};
  
  params.forEach((value, key) => {
    // Handle array parameters
    if (filters[key]) {
      if (Array.isArray(filters[key])) {
        filters[key].push(value);
      } else {
        filters[key] = [filters[key], value];
      }
    } else {
      // Try to parse numbers
      const numValue = Number(value);
      filters[key] = isNaN(numValue) ? value : numValue;
    }
  });
  
  return filters;
}

/**
 * Generate pagination metadata
 * @param page - Current page
 * @param limit - Items per page
 * @param total - Total items
 * @returns Pagination metadata
 */
export function generatePagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Sanitize user input for database queries
 * @param input - User input
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/[&]/g, "&amp;") // Escape ampersands
    .replace(/["]/g, "&quot;") // Escape quotes
    .replace(/[']/g, "&#x27;") // Escape apostrophes
    .replace(/[/]/g, "&#x2F;"); // Escape forward slashes
}

/**
 * Generate a random string for IDs or tokens
 * @param length - Length of the string
 * @returns Random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Format date to Nigerian locale
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatNigerianDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param date - Date to get relative time for
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
} 