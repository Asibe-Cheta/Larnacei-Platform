'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Search, X } from 'lucide-react';

interface LocationPickerProps {
  value: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  };
  onChange: (location: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationPicker({
  value,
  onChange,
  placeholder = 'Search for a location...',
  className = ''
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();

        if (!mapRef.current) return;

        // Initialize map
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: value.coordinates.lat && value.coordinates.lng 
            ? { lat: value.coordinates.lat, lng: value.coordinates.lng }
            : { lat: 6.5244, lng: 3.3792 }, // Default to Lagos
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        });

        // Initialize autocomplete
        if (searchInputRef.current) {
          const autocompleteInstance = new google.maps.places.Autocomplete(searchInputRef.current, {
            types: ['geocode'],
            componentRestrictions: { country: 'ng' }, // Restrict to Nigeria
            fields: ['formatted_address', 'address_components', 'geometry']
          });

          autocompleteInstance.addListener('place_changed', () => {
            const place = autocompleteInstance.getPlace();
            if (place.geometry?.location) {
              const coords = place.geometry.location;
              const newLocation = {
                address: place.formatted_address || '',
                city: extractCity(place.address_components || []),
                state: extractState(place.address_components || []),
                coordinates: {
                  lat: coords.lat(),
                  lng: coords.lng()
                }
              };

              onChange(newLocation);
              updateMarker(mapInstance, coords);
              mapInstance.setCenter(coords);
              mapInstance.setZoom(15);
            }
          });

          setAutocomplete(autocompleteInstance);
        }

        // Add marker if coordinates exist
        if (value.coordinates.lat && value.coordinates.lng) {
          const markerInstance = new google.maps.Marker({
            position: { lat: value.coordinates.lat, lng: value.coordinates.lng },
            map: mapInstance,
            draggable: true,
            title: 'Property Location'
          });

          markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition();
            if (position) {
              reverseGeocode(position.lat(), position.lng(), mapInstance);
            }
          });

          setMarker(markerInstance);
        }

        // Add click listener to map
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            reverseGeocode(event.latLng.lat(), event.latLng.lng(), mapInstance);
          }
        });

        setMap(mapInstance);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map. Please try again.');
        setLoading(false);
      }
    };

    initMap();
  }, []);

  const updateMarker = (mapInstance: google.maps.Map, position: google.maps.LatLng) => {
    if (marker) {
      marker.setMap(null);
    }

    const newMarker = new google.maps.Marker({
      position: position,
      map: mapInstance,
      draggable: true,
      title: 'Property Location'
    });

    newMarker.addListener('dragend', () => {
      const markerPosition = newMarker.getPosition();
      if (markerPosition) {
        reverseGeocode(markerPosition.lat(), markerPosition.lng(), mapInstance);
      }
    });

    setMarker(newMarker);
  };

  const reverseGeocode = async (lat: number, lng: number, mapInstance: google.maps.Map) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results.length > 0) {
        const location = result.results[0];
        const newLocation = {
          address: location.formatted_address,
          city: extractCity(location.address_components),
          state: extractState(location.address_components),
          coordinates: { lat, lng }
        };

        onChange(newLocation);
        updateMarker(mapInstance, new google.maps.LatLng(lat, lng));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const extractCity = (components: google.maps.GeocoderAddressComponent[]): string => {
    const cityComponent = components.find(component => 
      component.types.includes('locality') || 
      component.types.includes('administrative_area_level_2')
    );
    return cityComponent?.long_name || '';
  };

  const extractState = (components: google.maps.GeocoderAddressComponent[]): string => {
    const stateComponent = components.find(component => 
      component.types.includes('administrative_area_level_1')
    );
    return stateComponent?.long_name || '';
  };

  const handleSearch = () => {
    if (autocomplete && searchInputRef.current) {
      autocomplete.getPlace();
    }
  };

  const clearLocation = () => {
    onChange({
      address: '',
      city: '',
      state: '',
      coordinates: { lat: 0, lng: 0 }
    });
    if (marker) {
      marker.setMap(null);
    }
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          defaultValue={value.address}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <button
            onClick={handleSearch}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Search className="h-4 w-4" />
          </button>
          {value.address && (
            <button
              onClick={clearLocation}
              className="p-1 text-gray-400 hover:text-red-600 ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Map Toggle */}
      <button
        onClick={() => setIsMapVisible(!isMapVisible)}
        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        {isMapVisible ? 'Hide Map' : 'Show Map'}
      </button>

      {/* Map */}
      {isMapVisible && (
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div ref={mapRef} className="w-full h-64 rounded-lg border" />
          )}

          {/* Selected Location Display */}
          {value.address && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-green-800 mb-1">Selected Location</h4>
              <p className="text-sm text-green-700">{value.address}</p>
              <p className="text-xs text-green-600 mt-1">
                {value.city && `${value.city}, `}{value.state}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-1">How to use</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Type an address in the search box above</li>
              <li>• Click anywhere on the map to set location</li>
              <li>• Drag the marker to adjust the exact position</li>
              <li>• The location will be automatically geocoded</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 