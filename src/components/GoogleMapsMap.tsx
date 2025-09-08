import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, X, Check } from 'lucide-react';
import { loadGoogleMaps, reverseGeocode, PlaceResult } from '@/lib/googleMaps';
import { cn } from '@/lib/utils';

interface GoogleMapsMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onPlaceSelect?: (place: PlaceResult) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  height?: string;
  className?: string;
  showCurrentLocation?: boolean;
  allowLocationSelection?: boolean;
  selectedLocation?: { lat: number; lng: number } | null;
}

export const GoogleMapsMap = ({
  onLocationSelect,
  onPlaceSelect,
  initialCenter = { lat: 0, lng: 0 },
  initialZoom = 2,
  height = "400px",
  className,
  showCurrentLocation = true,
  allowLocationSelection = true,
  selectedLocation = null
}: GoogleMapsMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [google, setGoogle] = useState<typeof window.google | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        const googleMaps = await loadGoogleMaps();
        setGoogle(googleMaps);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        setIsLoading(false);
      }
    };

    initGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!google || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Add click listener for location selection
    if (allowLocationSelection) {
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          handleLocationClick(lat, lng);
        }
      });
    }

    // Add marker for selected location
    if (selectedLocation) {
      addMarker(selectedLocation.lat, selectedLocation.lng);
    }

    // Get current location if enabled
    if (showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });
          
          // Center map on current location if no initial center
          if (initialCenter.lat === 0 && initialCenter.lng === 0) {
            map.setCenter({ lat, lng });
            map.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  }, [google, initialCenter, initialZoom, allowLocationSelection, showCurrentLocation, selectedLocation]);

  // Handle location click
  const handleLocationClick = async (lat: number, lng: number) => {
    if (!google) return;

    try {
      setIsSelecting(true);
      
      // Add marker
      addMarker(lat, lng);
      
      // Get address
      const results = await reverseGeocode(lat, lng, google);
      const address = results[0]?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      setSelectedAddress(address);
      onLocationSelect(lat, lng, address);
    } catch (error) {
      console.error('Error getting address:', error);
      setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsSelecting(false);
    }
  };

  // Add marker to map
  const addMarker = (lat: number, lng: number) => {
    if (!google || !mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Add new marker
    markerRef.current = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: 'Selected Location',
      animation: google.maps.Animation.DROP,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ef4444"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 24)
      }
    });
  };

  // Center map on current location
  const centerOnCurrentLocation = () => {
    if (!google || !mapInstanceRef.current || !currentLocation) return;

    mapInstanceRef.current.setCenter(currentLocation);
    mapInstanceRef.current.setZoom(15);
    addMarker(currentLocation.lat, currentLocation.lng);
    handleLocationClick(currentLocation.lat, currentLocation.lng);
  };

  // Clear selection
  const clearSelection = () => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    setSelectedAddress('');
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!google) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load map</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Select Location</CardTitle>
          <div className="flex gap-2">
            {showCurrentLocation && currentLocation && (
              <Button
                variant="outline"
                size="sm"
                onClick={centerOnCurrentLocation}
                className="text-xs"
              >
                <Navigation className="h-3 w-3 mr-1" />
                My Location
              </Button>
            )}
            {selectedAddress && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={mapRef}
          style={{ height }}
          className="w-full rounded-b-lg"
        />
        
        {/* Selected location info */}
        {selectedAddress && (
          <div className="p-3 border-t bg-muted/50">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedAddress}</p>
                {isSelecting && (
                  <p className="text-xs text-muted-foreground">Getting address...</p>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            </div>
          </div>
        )}
        
        {/* Instructions */}
        {allowLocationSelection && !selectedAddress && (
          <div className="p-3 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Click on the map to select a location
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
