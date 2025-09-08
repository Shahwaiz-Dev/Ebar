import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import { loadGoogleMaps, createAutocompleteService, getPlaceDetails, PlaceResult, AutocompletePrediction } from '@/lib/googleMaps';
import { cn } from '@/lib/utils';

interface GoogleMapsSearchProps {
  onPlaceSelect: (place: PlaceResult) => void;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
  className?: string;
  showMapButton?: boolean;
  onMapClick?: () => void;
}

export const GoogleMapsSearch = ({
  onPlaceSelect,
  onLocationSelect,
  placeholder = "Search for a location...",
  className,
  showMapButton = false,
  onMapClick
}: GoogleMapsSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [google, setGoogle] = useState<typeof window.google | null>(null);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Initialize Google Maps
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        const googleMaps = await loadGoogleMaps();
        setGoogle(googleMaps);
        setAutocompleteService(createAutocompleteService(googleMaps));
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    initGoogleMaps();
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim() || !autocompleteService) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    // Debounce search requests
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const request = {
          input: value,
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: [] }, // Search globally
        };

        autocompleteService.getPlacePredictions(request, (predictions, status) => {
          setIsLoading(false);
          if (status === google?.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        });
      } catch (error) {
        console.error('Error getting predictions:', error);
        setIsLoading(false);
      }
    }, 300);
  }, [autocompleteService, google]);

  // Handle place selection
  const handlePlaceSelect = async (prediction: AutocompletePrediction) => {
    if (!google) return;

    try {
      setIsLoading(true);
      const place = await getPlaceDetails(prediction.place_id, google);
      
      setSearchTerm(place.formatted_address);
      setShowPredictions(false);
      setPredictions([]);
      
      onPlaceSelect(place);
      
      // Also call location select if provided
      if (onLocationSelect) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onLocationSelect(lat, lng, place.formatted_address);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to close predictions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        predictionsRef.current &&
        !predictionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setPredictions([]);
    setShowPredictions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setShowPredictions(true)}
          className="pl-10 pr-20"
          disabled={!google}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {showMapButton && onMapClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMapClick}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <Navigation className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Predictions Dropdown */}
      {showPredictions && predictions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {predictions.map((prediction) => (
              <div
                key={prediction.place_id}
                className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                onClick={() => handlePlaceSelect(prediction)}
              >
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
                <div className="flex gap-1">
                  {prediction.types.slice(0, 2).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
};
