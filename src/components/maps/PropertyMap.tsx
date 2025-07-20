'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
  propertyTitle: string;
  zoom?: number;
  showNearbyAmenities?: boolean;
  className?: string;
}

interface Amenity {
  name: string;
  distance: number;
  coordinates: { lat: number; lng: number };
  type: 'school' | 'hospital' | 'market' | 'transportation';
}

export default function PropertyMap({
  latitude,
  longitude,
  address,
  propertyTitle,
  zoom = 15,
  showNearbyAmenities = true,
  className = 'w-full h-96'
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        // Add property marker
        const propertyMarker = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstance,
          title: propertyTitle,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#7C0302"/>
                <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          }
        });

        // Add info window for property
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 5px 0; color: #7C0302; font-weight: bold;">${propertyTitle}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
            </div>
          `
        });

        propertyMarker.addListener('click', () => {
          infoWindow.open(mapInstance, propertyMarker);
        });

        setMap(mapInstance);

        // Find nearby amenities if enabled
        if (showNearbyAmenities) {
          await findNearbyAmenities(mapInstance, latitude, longitude);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map. Please try again.');
        setLoading(false);
      }
    };

    initMap();
  }, [latitude, longitude, address, propertyTitle, zoom, showNearbyAmenities]);

  const findNearbyAmenities = async (
    mapInstance: google.maps.Map,
    lat: number,
    lng: number
  ) => {
    try {
      const service = new google.maps.places.PlacesService(mapInstance);
      const amenities: Amenity[] = [];

      // Search for schools
      service.nearbySearch({
        location: { lat, lng },
        radius: 5000,
        type: 'school'
      }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          results.slice(0, 3).forEach(place => {
            if (place.geometry?.location) {
              const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(lat, lng),
                place.geometry.location
              );

              amenities.push({
                name: place.name || 'School',
                distance: distance,
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                },
                type: 'school'
              });

              // Add marker for school
              new google.maps.Marker({
                position: place.geometry.location,
                map: mapInstance,
                title: place.name || 'School',
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#4CAF50"/>
                      <path d="M12 6L16 10L12 14L8 10L12 6Z" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(24, 24),
                  anchor: new google.maps.Point(12, 12)
                }
              });
            }
          });
        }
      });

      // Search for hospitals
      service.nearbySearch({
        location: { lat, lng },
        radius: 5000,
        type: 'hospital'
      }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          results.slice(0, 3).forEach(place => {
            if (place.geometry?.location) {
              const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(lat, lng),
                place.geometry.location
              );

              amenities.push({
                name: place.name || 'Hospital',
                distance: distance,
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                },
                type: 'hospital'
              });

              // Add marker for hospital
              new google.maps.Marker({
                position: place.geometry.location,
                map: mapInstance,
                title: place.name || 'Hospital',
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#F44336"/>
                      <path d="M12 6L16 10L12 14L8 10L12 6Z" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(24, 24),
                  anchor: new google.maps.Point(12, 12)
                }
              });
            }
          });
        }
      });

      // Search for markets
      service.nearbySearch({
        location: { lat, lng },
        radius: 5000,
        keyword: 'market'
      }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          results.slice(0, 3).forEach(place => {
            if (place.geometry?.location) {
              const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(lat, lng),
                place.geometry.location
              );

              amenities.push({
                name: place.name || 'Market',
                distance: distance,
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                },
                type: 'market'
              });

              // Add marker for market
              new google.maps.Marker({
                position: place.geometry.location,
                map: mapInstance,
                title: place.name || 'Market',
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#FF9800"/>
                      <path d="M12 6L16 10L12 14L8 10L12 6Z" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(24, 24),
                  anchor: new google.maps.Point(12, 12)
                }
              });
            }
          });
        }
      });

      setAmenities(amenities);
    } catch (error) {
      console.error('Error finding nearby amenities:', error);
    }
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
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
    );
  }

  return (
    <div className="space-y-4">
      <div ref={mapRef} className={className} />
      
      {showNearbyAmenities && amenities.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Nearby Amenities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {amenities
              .sort((a, b) => a.distance - b.distance)
              .slice(0, 8)
              .map((amenity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <div className={`w-3 h-3 rounded-full ${
                    amenity.type === 'school' ? 'bg-green-500' :
                    amenity.type === 'hospital' ? 'bg-red-500' :
                    amenity.type === 'market' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{amenity.name}</p>
                    <p className="text-xs text-gray-500">{formatDistance(amenity.distance)} away</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 