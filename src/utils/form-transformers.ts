import { PropertyCreationData } from "@/types/api";
import { toKobo } from "./api";

/**
 * Transform frontend form data to API format
 */
export function transformFormDataToApi(
  formData: any,
  imageUrls: string[] = [],
  videoUrls: string[] = []
): PropertyCreationData {
  // Map category from frontend to API format
  const categoryMap: Record<string, string> = {
    'SHORT_STAYS': 'SHORT_STAY',
    'LONG_TERM_RENTALS': 'LONG_TERM_RENTAL',
    'LANDED_PROPERTIES': 'LANDED_PROPERTY',
    'PROPERTY_SALES': 'PROPERTY_SALE'
  };

  // Map purpose based on category
  const purposeMap: Record<string, string> = {
    'SHORT_STAYS': 'SHORT_STAY',
    'LONG_TERM_RENTALS': 'FOR_RENT',
    'LANDED_PROPERTIES': 'FOR_SALE',
    'PROPERTY_SALES': 'FOR_SALE'
  };

  // Map property types
  const typeMap: Record<string, string> = {
    'APARTMENT': 'APARTMENT',
    'HOUSE': 'HOUSE',
    'VILLA': 'VILLA',
    'LAND': 'LAND',
    'COMMERCIAL': 'COMMERCIAL',
    'OFFICE': 'COMMERCIAL',
    'SHOP': 'COMMERCIAL',
    'WAREHOUSE': 'COMMERCIAL'
  };

  // Map furnishing status
  const furnishingMap: Record<string, string> = {
    'FURNISHED': 'FURNISHED',
    'SEMI_FURNISHED': 'SEMI_FURNISHED',
    'UNFURNISHED': 'UNFURNISHED'
  };

  // Map condition
  const conditionMap: Record<string, string> = {
    'NEW': 'NEW',
    'OLD': 'OLD',
    'RENOVATED': 'RENOVATED',
    'UNDER_CONSTRUCTION': 'UNDER_CONSTRUCTION',
    'NEEDS_RENOVATION': 'NEEDS_RENOVATION'
  };

  // Convert price from formatted string to kobo
  const priceInKobo = toKobo(parseFloat(formData.price.replace(/,/g, '')) || 0);

  // Build title documents object
  const titleDocuments: Record<string, boolean> = {};
  if (formData.hasTitleDeed) titleDocuments.titleDeed = true;
  if (formData.hasSurveyPlan) titleDocuments.surveyPlan = true;
  if (formData.hasBuildingApproval) titleDocuments.buildingApproval = true;
  if (formData.hasCertificateOfOccupancy) titleDocuments.certificateOfOccupancy = true;
  if (formData.hasDeedOfAssignment) titleDocuments.deedOfAssignment = true;
  if (formData.hasPowerOfAttorney) titleDocuments.powerOfAttorney = true;

  // Transform amenities to features
  const features = formData.amenities || [];

  // Map viewing preferences to inspection type
  let inspectionType = 'BY_APPOINTMENT';
  if (formData.viewingPreferences?.includes('ANYTIME')) {
    inspectionType = 'ANYTIME';
  } else if (formData.viewingPreferences?.includes('WEEKENDS_ONLY')) {
    inspectionType = 'WEEKENDS_ONLY';
  } else if (formData.viewingPreferences?.includes('WEEKDAYS_ONLY')) {
    inspectionType = 'WEEKDAYS_ONLY';
  } else if (formData.viewingPreferences?.includes('VIRTUAL_ONLY')) {
    inspectionType = 'VIRTUAL_ONLY';
  }

  return {
    // Basic Info
    title: formData.title,
    description: formData.description,
    type: typeMap[formData.type] as any,
    category: categoryMap[formData.category] as any,
    purpose: purposeMap[formData.category] as any,

    // Location
    location: formData.address,
    state: formData.state,
    city: formData.city,
    lga: formData.lga,
    streetAddress: formData.address,
    landmark: formData.landmark,
    latitude: formData.latitude,
    longitude: formData.longitude,

    // Details
    price: priceInKobo,
    currency: 'NGN',
    isNegotiable: formData.isNegotiable || false,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    toilets: formData.toilets,
    sizeInSqm: formData.areaUnit === 'sqm' ? formData.area : 
               formData.areaUnit === 'sqft' ? (formData.area || 0) * 0.0929 : 
               formData.areaUnit === 'acres' ? (formData.area || 0) * 4046.86 : 
               formData.area,
    sizeInHectares: formData.areaUnit === 'acres' ? (formData.area || 0) * 0.404686 : 
                    formData.areaUnit === 'sqm' ? (formData.area || 0) / 10000 : 
                    formData.areaUnit === 'sqft' ? (formData.area || 0) * 0.0929 / 10000 : 
                    undefined,
    parkingSpaces: formData.parkingSpaces || 0,
    yearBuilt: formData.yearBuilt,
    floorLevel: formData.floorLevel,
    totalFloors: formData.totalFloors,
    features: features,
    furnishingStatus: furnishingMap[formData.furnishingStatus] as any,
    condition: conditionMap[formData.condition] as any,

    // Media
    images: imageUrls,
    videos: videoUrls,
    virtualTourUrl: formData.virtualTourUrl,
    floorPlanUrl: formData.floorPlanUrl,

    // Legal
    titleDocuments: titleDocuments,
    ownershipType: formData.ownershipType || 'PERSONAL',
    legalStatus: formData.legalStatus || 'CLEAR',

    // Availability
    availabilityStatus: formData.isAvailable ? 'AVAILABLE' : 'OCCUPIED',
    availableFrom: formData.availableFrom ? new Date(formData.availableFrom) : undefined,
    inspectionType: inspectionType as any,
  };
}

/**
 * Validate form data before submission
 */
export function validateFormData(formData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Step 1: Basic Info
  if (!formData.title || formData.title.length < 10) {
    errors.push('Property title must be at least 10 characters');
  }
  if (!formData.description || formData.description.length < 50) {
    errors.push('Property description must be at least 50 characters');
  }
  if (!formData.price || parseFloat(formData.price.replace(/,/g, '')) < 100000) {
    errors.push('Property price must be at least ₦100,000');
  }

  // Step 2: Location
  if (!formData.address || formData.address.length < 10) {
    errors.push('Street address must be at least 10 characters');
  }
  if (!formData.city) {
    errors.push('City is required');
  }
  if (!formData.state) {
    errors.push('State is required');
  }
  if (!formData.lga) {
    errors.push('Local Government Area is required');
  }

  // Step 3: Details
  if (!formData.amenities || formData.amenities.length === 0) {
    errors.push('At least one feature/amenity is required');
  }

  // Step 4: Media
  if (!formData.images || formData.images.length === 0) {
    errors.push('At least one property image is required');
  }

  // Step 5: Legal
  const hasAnyDocument = formData.hasTitleDeed || formData.hasSurveyPlan || 
                        formData.hasBuildingApproval || formData.hasCertificateOfOccupancy ||
                        formData.hasDeedOfAssignment || formData.hasPowerOfAttorney;
  if (!hasAnyDocument) {
    errors.push('At least one legal document type must be selected');
  }

  // Step 6: Availability
  if (!formData.contactPhone) {
    errors.push('Contact phone number is required');
  }
  if (!formData.contactEmail) {
    errors.push('Contact email is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format form data for display
 */
export function formatFormDataForDisplay(formData: any) {
  return {
    ...formData,
    price: formData.price ? `₦${formData.price}` : 'Not specified',
    area: formData.area ? `${formData.area} ${formData.areaUnit}` : 'Not specified',
    amenities: formData.amenities?.join(', ') || 'None specified',
    availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toLocaleDateString() : 'Immediately',
  };
}

/**
 * Get step validation status
 */
export function getStepValidationStatus(step: number, formData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (step) {
    case 1:
      if (!formData.title || formData.title.length < 10) {
        errors.push('Property title must be at least 10 characters');
      }
      if (!formData.description || formData.description.length < 50) {
        errors.push('Property description must be at least 50 characters');
      }
      if (!formData.price || parseFloat(formData.price.replace(/,/g, '')) < 100000) {
        errors.push('Property price must be at least ₦100,000');
      }
      break;

    case 2:
      if (!formData.address || formData.address.length < 10) {
        errors.push('Street address must be at least 10 characters');
      }
      if (!formData.city) {
        errors.push('City is required');
      }
      if (!formData.state) {
        errors.push('State is required');
      }
      if (!formData.lga) {
        errors.push('Local Government Area is required');
      }
      break;

    case 3:
      if (!formData.amenities || formData.amenities.length === 0) {
        errors.push('At least one feature/amenity is required');
      }
      break;

    case 4:
      if (!formData.images || formData.images.length === 0) {
        errors.push('At least one property image is required');
      }
      break;

    case 5:
      const hasAnyDocument = formData.hasTitleDeed || formData.hasSurveyPlan || 
                            formData.hasBuildingApproval || formData.hasCertificateOfOccupancy ||
                            formData.hasDeedOfAssignment || formData.hasPowerOfAttorney;
      if (!hasAnyDocument) {
        errors.push('At least one legal document type must be selected');
      }
      break;

    case 6:
      if (!formData.contactPhone) {
        errors.push('Contact phone number is required');
      }
      if (!formData.contactEmail) {
        errors.push('Contact email is required');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 