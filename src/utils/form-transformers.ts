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
  // console.log('Original form data:', formData);
  // console.log('Condition field value:', formData.condition);
  // console.log('Condition field type:', typeof formData.condition);

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

  // Map property types - only use valid enum values
  const typeMap: Record<string, string> = {
    'APARTMENT': 'APARTMENT',
    'HOUSE': 'HOUSE',
    'VILLA': 'VILLA',
    'LAND': 'LAND',
    'COMMERCIAL': 'COMMERCIAL',
    'DUPLEX': 'DUPLEX',
    'STUDIO': 'STUDIO',
    'PENTHOUSE': 'PENTHOUSE',
    // Map invalid types to valid ones
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

  // Map condition - ensure all values are valid enum values
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

  // Handle date formatting for availableFrom
  let availableFrom: Date | undefined;
  if (formData.availableFrom) {
    try {
      // Handle different date formats
      if (typeof formData.availableFrom === 'string') {
        // If it's already a date string, parse it
        availableFrom = new Date(formData.availableFrom);
      } else if (formData.availableFrom instanceof Date) {
        availableFrom = formData.availableFrom;
      }
    } catch (error) {
      console.warn('Invalid date format for availableFrom:', formData.availableFrom);
      availableFrom = undefined;
    }
  }

  // Ensure numeric fields are numbers
  const bedrooms = typeof formData.bedrooms === 'number' ? formData.bedrooms :
    typeof formData.bedrooms === 'string' ? parseInt(formData.bedrooms) || undefined : undefined;

  const bathrooms = typeof formData.bathrooms === 'number' ? formData.bathrooms :
    typeof formData.bathrooms === 'string' ? parseInt(formData.bathrooms) || undefined : undefined;

  const toilets = typeof formData.toilets === 'number' ? formData.toilets :
    typeof formData.toilets === 'string' ? parseInt(formData.toilets) || undefined : undefined;

  const parkingSpaces = typeof formData.parkingSpaces === 'number' ? formData.parkingSpaces :
    typeof formData.parkingSpaces === 'string' ? parseInt(formData.parkingSpaces) || 0 : 0;

  const yearBuilt = typeof formData.yearBuilt === 'number' ? formData.yearBuilt :
    typeof formData.yearBuilt === 'string' ? parseInt(formData.yearBuilt) || undefined : undefined;

  const floorLevel = typeof formData.floorLevel === 'number' ? formData.floorLevel :
    typeof formData.floorLevel === 'string' ? parseInt(formData.floorLevel) || undefined : undefined;

  const totalFloors = typeof formData.totalFloors === 'number' ? formData.totalFloors :
    typeof formData.totalFloors === 'string' ? parseInt(formData.totalFloors) || undefined : undefined;

  // Handle area calculations
  const area = typeof formData.area === 'number' ? formData.area :
    typeof formData.area === 'string' ? parseFloat(formData.area) || undefined : undefined;

  const sizeInSqm = formData.areaUnit === 'sqm' ? area :
    formData.areaUnit === 'sqft' ? (area || 0) * 0.0929 :
      formData.areaUnit === 'acres' ? (area || 0) * 4046.86 :
        area;

  const sizeInHectares = formData.areaUnit === 'acres' ? (area || 0) * 0.404686 :
    formData.areaUnit === 'sqm' ? (area || 0) / 10000 :
      formData.areaUnit === 'sqft' ? (area || 0) * 0.0929 / 10000 :
        undefined;

  // Handle coordinates
  const latitude = typeof formData.latitude === 'number' ? formData.latitude :
    typeof formData.latitude === 'string' ? parseFloat(formData.latitude) || undefined : undefined;

  const longitude = typeof formData.longitude === 'number' ? formData.longitude :
    typeof formData.longitude === 'string' ? parseFloat(formData.longitude) || undefined : undefined;

  const transformedData = {
    // Basic Info
    title: formData.title || '',
    description: formData.description || '',
    type: typeMap[formData.type] as any || 'HOUSE',
    category: categoryMap[formData.category] as any || 'PROPERTY_SALE',
    purpose: purposeMap[formData.category] as any || 'FOR_SALE',

    // Location
    location: formData.address || '',
    state: formData.state || '',
    city: formData.city || '',
    lga: formData.lga || '',
    streetAddress: formData.address || '',
    landmark: formData.landmark || '',
    latitude,
    longitude,

    // Details
    price: priceInKobo,
    currency: 'NGN' as const,
    isNegotiable: Boolean(formData.isNegotiable),
    bedrooms,
    bathrooms,
    toilets,
    sizeInSqm,
    sizeInHectares,
    parkingSpaces,
    yearBuilt,
    floorLevel,
    totalFloors,
    features: features.length > 0 ? features : ['Basic amenities'],
    furnishingStatus: furnishingMap[formData.furnishingStatus] as any || 'UNFURNISHED',
    condition: formData.condition ? conditionMap[formData.condition] as any : 'NEW',

    // Media
    images: imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/400x300?text=Property+Image'],
    videos: videoUrls,
    virtualTourUrl: formData.virtualTourUrl && formData.virtualTourUrl.trim() !== '' ? formData.virtualTourUrl : undefined,
    floorPlanUrl: formData.floorPlanUrl && formData.floorPlanUrl.trim() !== '' ? formData.floorPlanUrl : undefined,

    // Legal
    titleDocuments: Object.keys(titleDocuments).length > 0 ? titleDocuments : { titleDeed: true },
    ownershipType: formData.ownershipType || 'PERSONAL',
    legalStatus: formData.legalStatus || 'CLEAR',

    // Availability
    availabilityStatus: formData.isAvailable ? 'AVAILABLE' : 'OCCUPIED',
    availableFrom,
    inspectionType: inspectionType as any || 'BY_APPOINTMENT',
  };

  // console.log('Transformed data:', transformedData);
  return transformedData;
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
  // Note: condition field is not available in the frontend form, so we skip validation
  // if (!formData.condition) {
  //   errors.push('Property condition is required');
  // }

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
      // Note: condition field is not available in the frontend form, so we skip validation
      // if (!formData.condition) {
      //   errors.push('Property condition is required');
      // }
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