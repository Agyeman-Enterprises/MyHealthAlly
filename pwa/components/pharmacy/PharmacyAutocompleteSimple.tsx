'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { env } from '@/lib/env';

export interface Pharmacy {
  placeId: string;
  name: string;
  address: string;
  formattedAddress: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // in miles
}

interface PharmacyAutocompleteProps {
  value: Pharmacy | null;
  onChange: (pharmacy: Pharmacy | null) => void;
  onLocationChange?: (location: { lat: number; lng: number } | null) => void;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

// Google Maps API type definitions
interface GoogleMapsWindow extends Window {
    google?: {
      maps?: {
        places?: {
          AutocompleteService: new () => AutocompleteService;
          PlacesService: new (element: HTMLElement) => PlacesService;
          PlacesServiceStatus: { OK: string };
        };
        LatLng: new (lat: number, lng: number) => LatLng;
      };
    };
  }

  interface AutocompleteService {
    getPlacePredictions(request: AutocompleteRequest, callback: (predictions: AutocompletePrediction[] | null, status: string) => void): void;
  }

  interface PlacesService {
    getDetails(request: PlacesDetailsRequest, callback: (place: PlaceResult | null, status: string) => void): void;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  interface AutocompleteRequest {
    input: string;
    types?: string[];
    componentRestrictions?: { country: string };
    location?: LatLng;
    radius?: number;
  }

  interface AutocompletePrediction {
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }

  interface PlacesDetailsRequest {
    placeId: string;
    fields: string[];
  }

interface PlaceResult {
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  geometry?: {
    location?: LatLng;
  };
}

// Load Google Maps API script
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    const googleWindow = window as GoogleMapsWindow;
    if (googleWindow.google?.maps) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
};

export function PharmacyAutocomplete({
  value,
  onChange,
  onLocationChange,
  label = 'Preferred Pharmacy',
  error,
  required = false,
  className = '',
}: PharmacyAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<AutocompleteService | null>(null);
  const placesServiceRef = useRef<PlacesService | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load Google Maps API
  useEffect(() => {
    const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapsError('Google Maps API key not configured');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        const googleWindow = window as GoogleMapsWindow;
        if (googleWindow.google?.maps?.places) {
          autocompleteServiceRef.current = new googleWindow.google.maps.places.AutocompleteService();
          placesServiceRef.current = new googleWindow.google.maps.places.PlacesService(
            document.createElement('div')
          );
          setMapsLoaded(true);
        } else {
          setMapsError('Google Maps Places API not available');
        }
      })
      .catch((err) => {
        setMapsError(err instanceof Error ? err.message : 'Failed to load Google Maps');
      });
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          onLocationChange?.(location);
        },
        () => {
          // Geolocation failed - continue without location
        }
      );
    }
  }, [onLocationChange]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get detailed pharmacy information
  const getPharmacyDetails = (placeId: string): Promise<Partial<Pharmacy>> => {
    return new Promise((resolve) => {
      if (!placesServiceRef.current) {
        resolve({});
        return;
      }

      const request = {
        placeId,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'geometry'],
      };

      placesServiceRef.current.getDetails(request, (place: PlaceResult | null, status: string) => {
        const googleWindow = window as GoogleMapsWindow;
        if (status === googleWindow.google?.maps?.places?.PlacesServiceStatus.OK && place) {
          const result: Partial<Pharmacy> = {};
          if (place.name) result.name = place.name;
          if (place.formatted_address) result.formattedAddress = place.formatted_address;
          if (place.formatted_phone_number) result.phone = place.formatted_phone_number;
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          if (lat !== undefined) result.latitude = lat;
          if (lng !== undefined) result.longitude = lng;
          resolve(result);
        } else {
          resolve({});
        }
      });
    });
  };

  // Search pharmacies using Google Places API
  const searchPharmacies = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!mapsLoaded || !autocompleteServiceRef.current) {
      setMapsError('Google Maps not loaded');
      return;
    }

    setIsLoading(true);

    try {
      const googleWindow = window as GoogleMapsWindow;
      const request: AutocompleteRequest = {
        input: query,
        types: ['pharmacy', 'drugstore'],
        componentRestrictions: { country: 'us' },
      };

      if (userLocation && googleWindow.google?.maps?.LatLng) {
        request.location = new googleWindow.google.maps.LatLng(userLocation.lat, userLocation.lng);
        request.radius = 50000; // 50km radius
      }

      autocompleteServiceRef.current.getPlacePredictions(request, (predictions: AutocompletePrediction[] | null, status: string) => {
        if (status === googleWindow.google?.maps?.places?.PlacesServiceStatus.OK && predictions) {
          const pharmacySuggestions = predictions.map((prediction) => ({
            placeId: prediction.place_id,
            name: prediction.structured_formatting.main_text,
            address: prediction.structured_formatting.secondary_text || '',
            formattedAddress: prediction.structured_formatting.secondary_text || '',
            latitude: undefined,
            longitude: undefined,
            distance: undefined,
          }));

          // Get details for each pharmacy to get coordinates and distance
          Promise.all(
            pharmacySuggestions.map((pharmacy) =>
              getPharmacyDetails(pharmacy.placeId).then((details) => {
                const enrichedPharmacy: Pharmacy = {
                  placeId: pharmacy.placeId,
                  name: pharmacy.name,
                  address: pharmacy.address,
                  formattedAddress: pharmacy.formattedAddress,
                };
                if (details.phone) enrichedPharmacy.phone = details.phone;
                if (details.latitude !== undefined) enrichedPharmacy.latitude = details.latitude;
                if (details.longitude !== undefined) enrichedPharmacy.longitude = details.longitude;
                return enrichedPharmacy;
              })
            )
          ).then((enriched) => {
            // Sort by distance if location available
            const enrichedWithDistance: Pharmacy[] = enriched.map((pharmacy) => {
              const enrichedPharmacy: Pharmacy = {
                placeId: pharmacy.placeId,
                name: pharmacy.name,
                address: pharmacy.address,
                formattedAddress: pharmacy.formattedAddress,
              };
              if (pharmacy.phone) enrichedPharmacy.phone = pharmacy.phone;
              if (pharmacy.latitude !== undefined) enrichedPharmacy.latitude = pharmacy.latitude;
              if (pharmacy.longitude !== undefined) enrichedPharmacy.longitude = pharmacy.longitude;
              if (userLocation && pharmacy.latitude !== undefined && pharmacy.longitude !== undefined) {
                enrichedPharmacy.distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  pharmacy.latitude,
                  pharmacy.longitude
                );
              }
              return enrichedPharmacy;
            });
            if (userLocation) {
              enrichedWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
            }
            setSuggestions(enrichedWithDistance);
            setShowSuggestions(true);
          });
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Error searching pharmacies:', err);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      onChange(null);
      setSuggestions([]);
      setShowSuggestions(false);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      return;
    }

    // Debounce search
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      searchPharmacies(query);
      debounceTimeoutRef.current = null;
    }, 300);
  };

  // Handle pharmacy selection
  const handleSelectPharmacy = async (pharmacy: Pharmacy) => {
    // Get full details if not already loaded
    if (pharmacy.latitude === undefined || pharmacy.phone === undefined) {
      const details = await getPharmacyDetails(pharmacy.placeId);
      const fullPharmacy: Pharmacy = {
        placeId: pharmacy.placeId,
        name: details.name ?? pharmacy.name,
        address: pharmacy.address,
        formattedAddress: details.formattedAddress ?? pharmacy.formattedAddress,
        ...(details.phone ? { phone: details.phone } : {}),
        ...(details.latitude !== undefined ? { latitude: details.latitude } : {}),
        ...(details.longitude !== undefined ? { longitude: details.longitude } : {}),
      };
      
      if (userLocation && fullPharmacy.latitude !== undefined && fullPharmacy.longitude !== undefined) {
        fullPharmacy.distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          fullPharmacy.latitude,
          fullPharmacy.longitude
        );
      }
      
      onChange(fullPharmacy);
      setSearchQuery(fullPharmacy.name);
    } else {
      onChange(pharmacy);
      setSearchQuery(pharmacy.name);
    }
    
    setShowSuggestions(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={inputRef}
        label={label}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={mapsError ? "Enter pharmacy name manually" : "Search for a pharmacy (e.g., CVS, Walgreens)..."}
        {...((error || mapsError) ? { error: String(error || mapsError || '') } : {})}
        required={required}
        enableVoice={false}
        icon={
          isLoading ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )
        }
      />

      {mapsError && (
        <p className="text-xs text-amber-600 mt-1">
          ⚠️ Auto-complete unavailable. You can still type the pharmacy name manually.
        </p>
      )}

      {value && (
        <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-navy-600">{value.name}</p>
              <p className="text-sm text-gray-600 mt-1">{value.formattedAddress}</p>
              {value.phone && (
                <p className="text-sm text-gray-500 mt-1">📞 {value.phone}</p>
              )}
              {value.distance !== undefined && (
                <p className="text-xs text-primary-600 mt-1">📍 {value.distance.toFixed(1)} miles away</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setSearchQuery('');
              }}
              className="text-gray-400 hover:text-gray-600 ml-2"
              aria-label="Clear pharmacy"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((pharmacy) => (
            <button
              key={pharmacy.placeId}
              type="button"
              onClick={() => handleSelectPharmacy(pharmacy)}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-navy-600">{pharmacy.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{pharmacy.formattedAddress}</p>
                  {pharmacy.distance !== undefined && (
                    <p className="text-xs text-primary-600 mt-1">📍 {pharmacy.distance.toFixed(1)} miles away</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && searchQuery.length >= 2 && !isLoading && mapsLoaded && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500">No pharmacies found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}

