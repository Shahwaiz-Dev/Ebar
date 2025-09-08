import { Loader } from '@googlemaps/js-api-loader';

// Google Maps API configuration
export const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  libraries: ['places', 'geometry'] as const,
  version: 'weekly' as const,
};

// Initialize Google Maps Loader
export const loader = new Loader({
  apiKey: GOOGLE_MAPS_CONFIG.apiKey,
  version: GOOGLE_MAPS_CONFIG.version,
  libraries: GOOGLE_MAPS_CONFIG.libraries,
});

// Load Google Maps API
export const loadGoogleMaps = async () => {
  try {
    const google = await loader.load();
    return google;
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
};

// Types for Google Maps integration
export interface PlaceResult {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  types: string[];
  rating?: number;
  price_level?: number;
  photos?: Array<{
    getUrl: (opts?: { maxWidth: number; maxHeight: number }) => string;
  }>;
}

export interface AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

// Utility functions for Google Maps
export const getPlaceDetails = async (placeId: string, google: typeof window.google) => {
  const service = new google.maps.places.PlacesService(document.createElement('div'));
  
  return new Promise<PlaceResult>((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: ['place_id', 'formatted_address', 'name', 'geometry', 'types', 'rating', 'price_level', 'photos'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place as PlaceResult);
        } else {
          reject(new Error(`Place details request failed: ${status}`));
        }
      }
    );
  });
};

export const createAutocompleteService = (google: typeof window.google) => {
  return new google.maps.places.AutocompleteService();
};

export const createPlacesService = (google: typeof window.google, map: google.maps.Map) => {
  return new google.maps.places.PlacesService(map);
};

// Geocoding functions
export const geocodeAddress = async (address: string, google: typeof window.google) => {
  const geocoder = new google.maps.Geocoder();
  
  return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results) {
        resolve(results);
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

export const reverseGeocode = async (lat: number, lng: number, google: typeof window.google) => {
  const geocoder = new google.maps.Geocoder();
  
  return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results) {
        resolve(results);
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
};

// Distance calculation
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  google: typeof window.google
) => {
  const point1 = new google.maps.LatLng(lat1, lng1);
  const point2 = new google.maps.LatLng(lat2, lng2);
  
  return google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
};

// Convert meters to miles
export const metersToMiles = (meters: number) => {
  return meters * 0.000621371;
};

// Convert meters to kilometers
export const metersToKilometers = (meters: number) => {
  return meters / 1000;
};
