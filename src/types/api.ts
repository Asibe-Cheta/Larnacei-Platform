import {
  UserRole,
  AccountType,
  VerificationLevel,
  KYCStatus,
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
  InquiryType,
  InquiryStatus,
  ModerationStatus,
  BookingStatus,
  PaymentStatus,
  NotificationType,
  VideoType,
} from "@prisma/client";

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Types
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: UserRole;
  accountType: AccountType;
  isVerified: boolean;
  verificationLevel: VerificationLevel;
  kycStatus: KYCStatus;
  bio: string | null;
  location: string | null;
  experience: number | null;
  specialization: string[];
  socialLinks: any | null;
  contactPreference: ContactPreference;
  availabilityHours: any | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    properties: number;
    bookings: number;
    reviews: number;
    inquiries: number;
    favorites: number;
  };
}

export interface UserRegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  accountType?: AccountType;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserProfileUpdateData {
  name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  experience?: number;
  specialization?: string[];
  socialLinks?: Record<string, string>;
  contactPreference?: ContactPreference;
  availabilityHours?: any;
}

// Property Types
export interface PropertyBasicInfo {
  title: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  purpose: PropertyPurpose;
}

export interface PropertyLocation {
  location: string;
  state: string;
  city: string;
  lga: string;
  streetAddress: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyDetails {
  price: number; // In kobo
  currency: Currency;
  isNegotiable: boolean;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  sizeInSqm?: number;
  sizeInHectares?: number;
  parkingSpaces: number;
  yearBuilt?: number;
  floorLevel?: number;
  totalFloors?: number;
  features: string[];
  furnishingStatus?: FurnishingStatus;
  condition: PropertyCondition;
}

export interface PropertyMedia {
  images: string[];
  videos?: string[];
  virtualTourUrl?: string;
  floorPlanUrl?: string;
}

export interface PropertyLegal {
  titleDocuments: Record<string, boolean>;
  ownershipType: OwnershipType;
  legalStatus: LegalStatus;
}

export interface PropertyAvailability {
  availabilityStatus: AvailabilityStatus;
  availableFrom?: Date;
  inspectionType: InspectionType;
}

export interface PropertyCreationData extends
  PropertyBasicInfo,
  PropertyLocation,
  PropertyDetails,
  PropertyMedia,
  PropertyLegal,
  PropertyAvailability {}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  purpose: PropertyPurpose;
  location: string;
  state: string;
  city: string;
  lga: string;
  streetAddress: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number;
  currency: Currency;
  isNegotiable: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  sizeInSqm: number | null;
  sizeInHectares: number | null;
  parkingSpaces: number;
  yearBuilt: number | null;
  floorLevel: number | null;
  totalFloors: number | null;
  features: string[];
  furnishingStatus: FurnishingStatus | null;
  condition: PropertyCondition;
  availabilityStatus: AvailabilityStatus;
  availableFrom: Date | null;
  inspectionType: InspectionType;
  titleDocuments: any;
  ownershipType: OwnershipType;
  legalStatus: LegalStatus;
  virtualTourUrl: string | null;
  floorPlanUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  moderationStatus: ModerationStatus;
  viewCount: number;
  inquiryCount: number;
  favoriteCount: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: UserProfile;
  images?: PropertyImage[];
  videos?: PropertyVideo[];
  _count?: {
    images: number;
    videos: number;
    reviews: number;
    inquiries: number;
  };
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  isPrimary: boolean;
  propertyId: string;
  createdAt: Date;
}

export interface PropertyVideo {
  id: string;
  url: string;
  title: string | null;
  type: VideoType;
  propertyId: string;
  createdAt: Date;
}

export interface PropertySearchFilters {
  query?: string;
  type?: PropertyType;
  category?: PropertyCategory;
  purpose?: PropertyPurpose;
  state?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  condition?: PropertyCondition;
  furnishingStatus?: FurnishingStatus;
  availabilityStatus?: AvailabilityStatus;
  page?: number;
  limit?: number;
  sortBy?: "price" | "createdAt" | "viewCount";
  sortOrder?: "asc" | "desc";
}

// Property Inquiry Types
export interface PropertyInquiryData {
  message: string;
  inquiryType: InquiryType;
  contactPreference: ContactPreference;
  intendedUse?: string;
  budget?: number;
  timeframe?: string;
  financingNeeded: boolean;
}

export interface PropertyInquiry {
  id: string;
  message: string;
  inquiryType: InquiryType;
  contactPreference: ContactPreference;
  intendedUse: string | null;
  budget: number | null;
  timeframe: string | null;
  financingNeeded: boolean;
  status: InquiryStatus;
  propertyId: string;
  inquirerId: string;
  createdAt: Date;
  updatedAt: Date;
  property?: {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: Currency;
  };
  inquirer?: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    isVerified: boolean;
    verificationLevel: VerificationLevel;
  };
}

// Booking Types
export interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  serviceFee: number;
  cleaningFee: number;
  taxes: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paystackPaymentId: string | null;
  propertyId: string;
  guestId: string;
  createdAt: Date;
  updatedAt: Date;
  property?: Property;
  guest?: UserProfile;
}

// Review Types
export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  propertyId: string;
  authorId: string;
  createdAt: Date;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: string;
  createdAt: Date;
}

// Admin Types
export interface AdminPropertySummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
}

export interface UserPropertySummary {
  total: number;
  active: number;
  pending: number;
  rejected: number;
  inactive: number;
}

// API Request/Response Types
export interface PropertyCreationRequest {
  data: PropertyCreationData;
}

export interface PropertyCreationResponse extends ApiResponse<Property> {}

export interface PropertySearchResponse extends PaginatedResponse<Property> {}

export interface PropertyDetailsResponse extends ApiResponse<Property> {}

export interface PropertyInquiryRequest {
  data: PropertyInquiryData;
}

export interface PropertyInquiryResponse extends ApiResponse<PropertyInquiry> {}

export interface PropertyInquiriesResponse extends PaginatedResponse<PropertyInquiry> {}

export interface UserRegistrationRequest {
  data: UserRegistrationData;
}

export interface UserRegistrationResponse extends ApiResponse<UserProfile> {}

export interface UserLoginRequest {
  data: UserLoginData;
}

export interface UserProfileResponse extends ApiResponse<UserProfile> {}

export interface UserProfileUpdateRequest {
  data: UserProfileUpdateData;
}

export interface UserProfileUpdateResponse extends ApiResponse<UserProfile> {}

export interface UserPropertiesResponse extends PaginatedResponse<Property> {
  summary: UserPropertySummary;
}

export interface AdminPropertiesResponse extends PaginatedResponse<Property> {
  summary: AdminPropertySummary;
}

export interface PropertyModerationRequest {
  propertyId: string;
  moderationStatus: ModerationStatus;
  reason?: string;
}

export interface PropertyModerationResponse extends ApiResponse<Property> {}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  validationErrors?: ValidationError[];
}

// Utility Types
export type CurrencyFormat = "NGN" | "USD" | "GBP" | "EUR";

export interface PriceDisplay {
  amount: number;
  currency: Currency;
  formatted: string;
  inKobo: number;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
} 