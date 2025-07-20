import { Loader } from '@googlemaps/js-api-loader';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Nigerian location data
export interface NigerianLocation {
  state: string;
  lga: string;
  ward?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  landmarks?: string[];
  localNames?: {
    hausa?: string;
    pidgin?: string;
  };
}

// Major Nigerian cities with coordinates
export const NIGERIAN_CITIES: NigerianLocation[] = [
  {
    state: 'Lagos',
    lga: 'Lagos Island',
    coordinates: { lat: 6.5244, lng: 3.3792 },
    landmarks: ['Victoria Island', 'Lagos Harbour', 'National Museum'],
    localNames: {
      hausa: 'Lagos',
      pidgin: 'Lagos'
    }
  },
  {
    state: 'Lagos',
    lga: 'Lekki',
    coordinates: { lat: 6.4361, lng: 3.4708 },
    landmarks: ['Lekki Conservation Centre', 'Lekki Toll Gate', 'Lekki Phase 1'],
    localNames: {
      hausa: 'Lekki',
      pidgin: 'Lekki'
    }
  },
  {
    state: 'Lagos',
    lga: 'Victoria Island',
    coordinates: { lat: 6.4281, lng: 3.4219 },
    landmarks: ['Eko Hotel', 'Bar Beach', 'Falomo Bridge'],
    localNames: {
      hausa: 'Victoria Island',
      pidgin: 'V.I.'
    }
  },
  {
    state: 'Abuja',
    lga: 'Municipal Area Council',
    coordinates: { lat: 9.0820, lng: 7.3981 },
    landmarks: ['Aso Rock', 'National Assembly', 'Presidential Villa'],
    localNames: {
      hausa: 'Abuja',
      pidgin: 'Abuja'
    }
  },
  {
    state: 'Kano',
    lga: 'Municipal',
    coordinates: { lat: 11.9914, lng: 8.5317 },
    landmarks: ['Kano City Walls', 'Gidan Makama Museum', 'Kano Emirate'],
    localNames: {
      hausa: 'Kano',
      pidgin: 'Kano'
    }
  },
  {
    state: 'Rivers',
    lga: 'Port Harcourt',
    coordinates: { lat: 4.8156, lng: 7.0498 },
    landmarks: ['Port Harcourt Refinery', 'Port Harcourt Airport', 'Garden City'],
    localNames: {
      hausa: 'Port Harcourt',
      pidgin: 'Port Harcourt'
    }
  },
  {
    state: 'Oyo',
    lga: 'Ibadan North',
    coordinates: { lat: 7.3961, lng: 3.8969 },
    landmarks: ['University of Ibadan', 'Cocoa House', 'Mapo Hall'],
    localNames: {
      hausa: 'Ibadan',
      pidgin: 'Ibadan'
    }
  }
];

// Initialize Google Maps loader
const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry']
});

// Load Google Maps API
export const loadGoogleMaps = async (): Promise<typeof google> => {
  try {
    const google = await loader.load();
    return google;
  } catch (error) {
    console.error('Failed to load Google Maps:', error);
    throw error;
  }
};

// Type declarations for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

// Property location interface
export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  nearbyAmenities?: {
    schools: Array<{ name: string; distance: number; coordinates: { lat: number; lng: number } }>;
    hospitals: Array<{ name: string; distance: number; coordinates: { lat: number; lng: number } }>;
    markets: Array<{ name: string; distance: number; coordinates: { lat: number; lng: number } }>;
    transportation: Array<{ name: string; distance: number; coordinates: { lat: number; lng: number } }>;
  };
}

// Geocoding service
export const geocodeAddress = async (address: string): Promise<PropertyLocation | null> => {
  try {
    const google = await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    
    const result = await geocoder.geocode({ address });
    
    if (result.results.length > 0) {
      const location = result.results[0];
      const coords = location.geometry.location;
      
      return {
        address: location.formatted_address,
        city: extractCity(location.address_components),
        state: extractState(location.address_components),
        coordinates: {
          lat: coords.lat(),
          lng: coords.lng()
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Reverse geocoding
export const reverseGeocode = async (lat: number, lng: number): Promise<PropertyLocation | null> => {
  try {
    const google = await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    
    const result = await geocoder.geocode({
      location: { lat, lng }
    });
    
    if (result.results.length > 0) {
      const location = result.results[0];
      
      return {
        address: location.formatted_address,
        city: extractCity(location.address_components),
        state: extractState(location.address_components),
        coordinates: { lat, lng }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Find nearby amenities
export const findNearbyAmenities = async (
  lat: number, 
  lng: number, 
  radius: number = 5000
): Promise<PropertyLocation['nearbyAmenities']> => {
  try {
    const google = await loadGoogleMaps();
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );
    
    const amenities = {
      schools: [] as any[],
      hospitals: [] as any[],
      markets: [] as any[],
      transportation: [] as any[]
    };
    
    // Search for schools
    const schoolSearch = new Promise((resolve) => {
      service.nearbySearch({
        location: { lat, lng },
        radius,
        type: 'school'
      }, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          amenities.schools = results?.map(place => ({
            name: place.name || '',
            distance: google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(lat, lng),
              place.geometry?.location
            ),
            coordinates: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }
          })) || [];
        }
        resolve(null);
      });
    });
    
    // Search for hospitals
    const hospitalSearch = new Promise((resolve) => {
      service.nearbySearch({
        location: { lat, lng },
        radius,
        type: 'hospital'
      }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          amenities.hospitals = results?.map(place => ({
            name: place.name || '',
            distance: google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(lat, lng),
              place.geometry?.location
            ),
            coordinates: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }
          })) || [];
        }
        resolve(null);
      });
    });
    
    // Search for markets
    const marketSearch = new Promise((resolve) => {
      service.nearbySearch({
        location: { lat, lng },
        radius,
        keyword: 'market'
      }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          amenities.markets = results?.map(place => ({
            name: place.name || '',
            distance: google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(lat, lng),
              place.geometry?.location
            ),
            coordinates: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }
          })) || [];
        }
        resolve(null);
      });
    });
    
    // Search for transportation
    const transportSearch = new Promise((resolve) => {
      service.nearbySearch({
        location: { lat, lng },
        radius,
        type: 'transit_station'
      }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          amenities.transportation = results?.map(place => ({
            name: place.name || '',
            distance: google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(lat, lng),
              place.geometry?.location
            ),
            coordinates: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }
          })) || [];
        }
        resolve(null);
      });
    });
    
    await Promise.all([schoolSearch, hospitalSearch, marketSearch, transportSearch]);
    
    return amenities;
  } catch (error) {
    console.error('Error finding nearby amenities:', error);
    return {
      schools: [],
      hospitals: [],
      markets: [],
      transportation: []
    };
  }
};

// Calculate distance between two points
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get Nigerian location by coordinates
export const getNigerianLocation = (lat: number, lng: number): NigerianLocation | null => {
  // Find the closest Nigerian city
  let closestCity: NigerianLocation | null = null;
  let minDistance = Infinity;
  
  for (const city of NIGERIAN_CITIES) {
    const distance = calculateDistance(lat, lng, city.coordinates.lat, city.coordinates.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  }
  
  return closestCity;
};

// Extract city from address components
const extractCity = (components: google.maps.GeocoderAddressComponent[]): string => {
  const cityComponent = components.find(component => 
    component.types.includes('locality') || 
    component.types.includes('administrative_area_level_2')
  );
  return cityComponent?.long_name || '';
};

// Extract state from address components
const extractState = (components: google.maps.GeocoderAddressComponent[]): string => {
  const stateComponent = components.find(component => 
    component.types.includes('administrative_area_level_1')
  );
  return stateComponent?.long_name || '';
};

// Get directions between two points
export const getDirections = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<google.maps.DirectionsResult | null> => {
  try {
    const google = await loadGoogleMaps();
    const directionsService = new google.maps.DirectionsService();
    
    const result = await directionsService.route({
      origin: new google.maps.LatLng(origin.lat, origin.lng),
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      travelMode: google.maps.TravelMode.DRIVING
    });
    
    return result;
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
};

// Get street view data
export const getStreetView = async (
  lat: number, 
  lng: number
): Promise<{ panorama: google.maps.StreetViewPanorama | null; available: boolean }> => {
  try {
    const google = await loadGoogleMaps();
    const streetViewService = new google.maps.StreetViewService();
    
    const result = await streetViewService.getPanorama({
      location: { lat, lng },
      radius: 50
    });
    
    return {
      panorama: result.data,
      available: true
    };
  } catch (error) {
    console.error('Street view not available:', error);
    return {
      panorama: null,
      available: false
    };
  }
}; 