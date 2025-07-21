import { z } from "zod";
import {
  PropertyType,
  PropertyCategory,
  PropertyPurpose,
  PropertyCondition,
  FurnishingStatus,
  Currency,
  AvailabilityStatus,
  InspectionType,
  OwnershipType,
  LegalStatus,
  ContactPreference,
  UserRole,
  AccountType,
} from "@prisma/client";

/**
 * Worldwide phone number validation (supports international numbers from any country)
 */
export const worldwidePhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (phone) => {
      // Remove all non-digit characters except +
      const cleanPhone = phone.replace(/[^\d+]/g, "");

      // Check if it's a valid international phone number
      // Supports: +1234567890, +44123456789, +2348012345678, etc.
      const internationalPattern = /^\+[1-9]\d{1,14}$/;

      // Also support local formats that can be converted to international
      const localPatterns = [
        /^[1-9]\d{9,14}$/, // 10-15 digits starting with 1-9
        /^0[1-9]\d{8,13}$/, // Local format starting with 0
      ];

      return internationalPattern.test(cleanPhone) || localPatterns.some(pattern => pattern.test(cleanPhone));
    },
    {
      message: "Please enter a valid phone number",
    }
  )
  .transform((phone) => {
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    // If it already has +, return as is
    if (cleanPhone.startsWith("+")) {
      return cleanPhone;
    }

    // If it starts with 0, remove the 0 (common local format)
    if (cleanPhone.startsWith("0")) {
      return cleanPhone.slice(1);
    }

    // For other formats, assume it's a valid number
    return cleanPhone;
  });

/**
 * Nigerian phone number validation (supports +234, 234, 0, and direct numbers)
 */
export const nigerianPhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (phone) => {
      // Remove all non-digit characters
      const cleanPhone = phone.replace(/\D/g, "");

      // Check if it's a valid Nigerian phone number
      // Supports: +2348012345678, 2348012345678, 08012345678, 8012345678
      const patterns = [
        /^\+234[789][01]\d{8}$/, // +234 format
        /^234[789][01]\d{8}$/,   // 234 format
        /^0[789][01]\d{8}$/,     // 0 format
        /^[789][01]\d{8}$/,      // Direct format
      ];

      return patterns.some(pattern => pattern.test(cleanPhone));
    },
    {
      message: "Please enter a valid Nigerian phone number",
    }
  )
  .transform((phone) => {
    // Normalize to +234 format
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("234")) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith("0")) {
      return `+234${cleanPhone.slice(1)}`;
    } else if (cleanPhone.length === 10) {
      return `+234${cleanPhone}`;
    }
    return phone;
  });

/**
 * NIN (National Identification Number) validation
 */
export const ninSchema = z
  .string()
  .length(11, "NIN must be exactly 11 digits")
  .regex(/^\d{11}$/, "NIN must contain only digits");

/**
 * Nigerian currency validation (NGN in kobo)
 */
export const nigerianCurrencySchema = z
  .number()
  .min(100, "Minimum amount is ₦1 (100 kobo)")
  .max(1000000000, "Maximum amount is ₦10,000,000 (1 billion kobo)");

/**
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: worldwidePhoneSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]*$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  role: z.nativeEnum(UserRole).default(UserRole.SEEKER),
  accountType: z.nativeEnum(AccountType).default(AccountType.INDIVIDUAL),
});

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Property creation schema - Step 1: Basic Info
 */
export const propertyBasicInfoSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200),
  description: z.string().min(50, "Description must be at least 50 characters").max(2000),
  type: z.nativeEnum(PropertyType),
  category: z.nativeEnum(PropertyCategory),
  purpose: z.nativeEnum(PropertyPurpose),
});

/**
 * Property creation schema - Step 2: Location
 */
export const propertyLocationSchema = z.object({
  location: z.string().min(5, "Location must be at least 5 characters"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  lga: z.string().min(2, "Local Government Area is required"),
  streetAddress: z.string().min(10, "Street address must be at least 10 characters"),
  landmark: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

/**
 * Property creation schema - Step 3: Details
 */
export const propertyDetailsSchema = z.object({
  price: nigerianCurrencySchema,
  currency: z.nativeEnum(Currency).default(Currency.NGN),
  isNegotiable: z.boolean().default(false),
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  toilets: z.number().min(0).max(20).optional(),
  sizeInSqm: z.number().min(1).max(100000).optional(),
  sizeInHectares: z.number().min(0.01).max(10000).optional(),
  parkingSpaces: z.number().min(0).max(50).default(0),
  yearBuilt: z.number().min(1900).max(new Date().getFullYear()).optional(),
  floorLevel: z.number().min(0).max(100).optional(),
  totalFloors: z.number().min(1).max(100).optional(),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  furnishingStatus: z.nativeEnum(FurnishingStatus).optional(),
  condition: z.nativeEnum(PropertyCondition),
});

/**
 * Property creation schema - Step 4: Media
 */
export const propertyMediaSchema = z.object({
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required").max(20),
  videos: z.array(z.string().url("Invalid video URL")).max(10).optional(),
  virtualTourUrl: z.string().url("Invalid virtual tour URL").optional(),
  floorPlanUrl: z.string().url("Invalid floor plan URL").optional(),
});

/**
 * Property creation schema - Step 5: Legal
 */
export const propertyLegalSchema = z.object({
  titleDocuments: z
    .record(z.boolean())
    .refine(val => Object.keys(val).length > 0, {
      message: "At least one document type must be selected",
    }),
  ownershipType: z.nativeEnum(OwnershipType),
  legalStatus: z.nativeEnum(LegalStatus).default(LegalStatus.CLEAR),
});

/**
 * Property creation schema - Step 6: Availability
 */
export const propertyAvailabilitySchema = z.object({
  availabilityStatus: z.nativeEnum(AvailabilityStatus).default(AvailabilityStatus.AVAILABLE),
  availableFrom: z.date().optional(),
  inspectionType: z.nativeEnum(InspectionType).default(InspectionType.BY_APPOINTMENT),
});

/**
 * Complete property creation schema
 */
export const propertyCreationSchema = propertyBasicInfoSchema
  .merge(propertyLocationSchema)
  .merge(propertyDetailsSchema)
  .merge(propertyMediaSchema)
  .merge(propertyLegalSchema)
  .merge(propertyAvailabilitySchema);

/**
 * Property search/filter schema
 */
export const propertySearchSchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(PropertyType).optional(),
  category: z.nativeEnum(PropertyCategory).optional(),
  purpose: z.nativeEnum(PropertyPurpose).optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  condition: z.nativeEnum(PropertyCondition).optional(),
  furnishingStatus: z.nativeEnum(FurnishingStatus).optional(),
  availabilityStatus: z.nativeEnum(AvailabilityStatus).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  sortBy: z.enum(["price", "createdAt", "viewCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Property inquiry schema
 */
export const propertyInquirySchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
  inquiryType: z.enum(["GENERAL_INFO", "VIEWING_REQUEST", "PRICE_INQUIRY", "PURCHASE_INTENT", "RENTAL_APPLICATION", "INVESTMENT_INQUIRY"] as const),
  contactPreference: z.nativeEnum(ContactPreference),
  intendedUse: z.string().optional(),
  budget: nigerianCurrencySchema.optional(),
  timeframe: z.string().optional(),
  financingNeeded: z.boolean().default(false),
});

/**
 * User profile update schema
 */
export const userProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: worldwidePhoneSchema.optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  experience: z.number().min(0).max(50).optional(),
  specialization: z.array(z.string()).max(10).optional(),
  streetAddress: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  lga: z.string().max(100).optional(),
  businessName: z.string().max(100).optional(),
  cacNumber: z.string().max(50).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
  }).partial().optional(),
  contactPreference: z.nativeEnum(ContactPreference).optional(),
  availabilityHours: z.record(z.any()).optional(),
  emailNotifications: z.object({
    inquiries: z.boolean().optional(),
    updates: z.boolean().optional(),
    marketing: z.boolean().optional(),
  }).partial().optional(),
  smsNotifications: z.boolean().optional(),
  profileVisibility: z.boolean().optional(),
  showContactInfo: z.boolean().optional(),
});

/**
 * API Response schemas
 */
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
}); 