/**
 * Utility functions for handling BigInt serialization in JSON responses
 * BigInt values need special handling since they can't be directly serialized to JSON
 */

/**
 * Custom JSON replacer that converts BigInt to string
 */
export function bigintReplacer(key: string, value: any): any {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

/**
 * Serialize object with BigInt values to JSON-safe format
 */
export function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, bigintReplacer));
}

/**
 * Convert BigInt fields in objects to numbers for frontend compatibility
 * Use this when you know the BigInt values will fit in JavaScript's safe integer range
 */
export function bigintToNumber(obj: any, fields: string[] = ['price', 'amount']): any {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'bigint') {
      result[field] = Number(result[field]);
    }
  }
  
  return result;
}

/**
 * Convert price from kobo (BigInt) to naira (number) for display
 */
export function koboToNaira(kobo: bigint | number): number {
  if (typeof kobo === 'bigint') {
    return Number(kobo) / 100;
  }
  return kobo / 100;
}

/**
 * Convert price from naira (number) to kobo (BigInt) for storage
 */
export function nairaToKobo(naira: number): bigint {
  return BigInt(Math.round(naira * 100));
}
