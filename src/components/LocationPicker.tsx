import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationPickerProps {
  initialAddress?: string;
  onAddressChange?: (address: string) => void;
  onCoordinatesChange?: (coordinates: { lat: number; lng: number }) => void;
  height?: string;
  inputClassName?: string;
  showSearchBoxOnly?: boolean;
  showMapOnly?: boolean;
  label?: string;
  placeholder?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialAddress = "",
  onAddressChange,
  onCoordinatesChange,
  height = "400px",
  inputClassName = "w-full",
  showSearchBoxOnly = false,
  showMapOnly = false,
  label = "Location",
  placeholder = "Search for a location"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [address, setAddress] = useState(initialAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [googleApi, setGoogleApi] = useState<any>(null);

  // Store event listeners for cleanup
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  // Track if the component is mounted
  const isMountedRef = useRef(true);

  // Initialize Google Maps
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    const initMap = async () => {
      if (!isMountedRef.current) return;
      setIsLoading(true);

      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDiKFO7lzmJsUpjy4it32i9h9iSaCvuPuQ",
          version: "weekly",
          libraries: ["places"],
        });
        const google = await loader.load();
        if (!isMountedRef.current) return;
        setGoogleApi(google);

        // Default location (can be centered on user's country or a default location)
        const defaultLocation = { lat: 50.8503, lng: 4.3517 }; // Brussels, Belgium

        // Create autocomplete only if input exists and not in map-only mode
        if (inputRef.current && !showMapOnly) {
          const autocompleteInstance = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              fields: [
                "address_components",
                "formatted_address",
                "geometry",
                "name",
              ],
            }
          );

          if (isMountedRef.current) {
            setAutocomplete(autocompleteInstance);

            // Set up autocomplete event listener
            const placeChangedListener = autocompleteInstance.addListener(
              "place_changed",
              () => {
                const place = autocompleteInstance.getPlace();

                if (!place.geometry || !place.geometry.location) {
                  console.log("No details available for this place");
                  return;
                }

                // Update address
                const newAddress = place.formatted_address;
                setAddress(newAddress);

                if (onAddressChange) {
                  onAddressChange(newAddress);
                }

                // Update coordinates
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                if (onCoordinatesChange) {
                  onCoordinatesChange({ lat, lng });
                }

                // If we have a map, update it too
                if (map && marker) {
                  // Update map and marker
                  if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                  } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);
                  }

                  marker.setPosition(place.geometry.location);
                }
              }
            );

            // Add to listeners for cleanup
            listenersRef.current.push(placeChangedListener);
          }
        }

        // Create map only if not in search-box-only mode and map container exists
        if (!showSearchBoxOnly && mapRef.current && isMountedRef.current) {
          // Create the map
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: defaultLocation,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          });

          // Create a marker
          const markerInstance = new google.maps.Marker({
            position: defaultLocation,
            map: mapInstance,
            draggable: true,
            animation: google.maps.Animation.DROP,
          });

          // Bind autocomplete to map if it exists
          if (autocomplete && !showMapOnly) {
            autocomplete.bindTo("bounds", mapInstance);
          }

          if (isMountedRef.current) {
            setMap(mapInstance);
            setMarker(markerInstance);

            // If we have an initial address, geocode it
            if (initialAddress) {
              geocodeAddress(
                initialAddress,
                google,
                mapInstance,
                markerInstance
              );
            }

            // Set up map and marker event listeners
            setupMapEventListeners(google, mapInstance, markerInstance);
          }
        }

        if (isMountedRef.current) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initMap();

    // Cleanup function
    return () => {
      // Set mounted flag to false
      isMountedRef.current = false;

      // Clean up event listeners
      listenersRef.current.forEach((listener) => {
        if (listener && typeof listener.remove === "function") {
          listener.remove();
        }
      });

      // Clear references to Google objects
      setMap(null);
      setMarker(null);
      setAutocomplete(null);
    };
  }, [initialAddress, showSearchBoxOnly, showMapOnly]);

  // Update map when initialAddress changes from parent
  useEffect(() => {
    if (map && marker && googleApi && initialAddress !== address) {
      setAddress(initialAddress);
      if (initialAddress) {
        geocodeAddress(initialAddress, googleApi, map, marker);
      }
    }
  }, [initialAddress, map, marker, googleApi, address]);

  const geocodeAddress = (
    addressToGeocode: string,
    google: any,
    mapInstance: google.maps.Map,
    markerInstance: google.maps.Marker
  ) => {
    if (!google || !mapInstance || !markerInstance || !isMountedRef.current)
      return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: addressToGeocode }, (results: any, status: any) => {
      if (!isMountedRef.current) return;

      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        mapInstance.setCenter(location);
        markerInstance.setPosition(location);

        // Update coordinates
        const lat = location.lat();
        const lng = location.lng();

        if (onCoordinatesChange) {
          onCoordinatesChange({ lat, lng });
        }
      }
    });
  };

  const setupMapEventListeners = (google: any, mapInstance: google.maps.Map, markerInstance: google.maps.Marker) => {
    if (!google || !mapInstance || !markerInstance || !isMountedRef.current)
      return;

    // When user clicks on the map
    const mapClickListener = mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!isMountedRef.current || !e.latLng) return;

      markerInstance.setPosition(e.latLng);

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results: any, status: any) => {
        if (!isMountedRef.current) return;

        if (status === "OK" && results && results[0]) {
          const newAddress = results[0].formatted_address;
          setAddress(newAddress);

          if (onAddressChange) {
            onAddressChange(newAddress);
          }

          // Update input field safely if not in map-only mode
          if (inputRef.current && !showMapOnly) {
            inputRef.current.value = newAddress;
          }
        }
      });

      // Update coordinates
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (onCoordinatesChange) {
        onCoordinatesChange({ lat, lng });
      }
    });

    // When user drags the marker
    const markerDragListener = markerInstance.addListener("dragend", () => {
      if (!isMountedRef.current) return;

      const position = markerInstance.getPosition();
      if (!position) return;

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results: any, status: any) => {
        if (!isMountedRef.current) return;

        if (status === "OK" && results && results[0]) {
          const newAddress = results[0].formatted_address;
          setAddress(newAddress);

          if (onAddressChange) {
            onAddressChange(newAddress);
          }

          // Update input field safely if not in map-only mode
          if (inputRef.current && !showMapOnly) {
            inputRef.current.value = newAddress;
          }
        }
      });

      // Update coordinates
      const lat = position.lat();
      const lng = position.lng();

      if (onCoordinatesChange) {
        onCoordinatesChange({ lat, lng });
      }
    });

    // Store listeners for cleanup
    listenersRef.current.push(mapClickListener, markerDragListener);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAddress(newValue);

    // Optionally notify parent of the change
    if (onAddressChange) {
      onAddressChange(newValue);
    }
  };

  useEffect(() => {
    if (initialAddress !== address) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  // If we're showing only the search box
  if (showSearchBoxOnly) {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor="location-input">{label}</Label>}
        <Input
          ref={inputRef}
          id="location-input"
          type="text"
          className={inputClassName}
          placeholder={placeholder}
          value={address}
          onChange={handleInputChange}
        />
      </div>
    );
  }

  // If we're showing only the map
  if (showMapOnly) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div
          className="rounded-lg border relative"
          style={{
            height,
            width: "100%",
            backgroundColor: "#f8f9fa",
          }}
        >
          <div ref={mapRef} className="w-full h-full rounded-lg"></div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: show both search box and map
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {label && <Label htmlFor="location-input">{label}</Label>}
        <Input
          ref={inputRef}
          id="location-input"
          type="text"
          className={inputClassName}
          placeholder={placeholder}
          value={address}
          onChange={handleInputChange}
        />
      </div>

      <div
        className="rounded-lg border relative"
        style={{
          height,
          width: "100%",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div ref={mapRef} className="w-full h-full rounded-lg"></div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        You can search for an address, click on the map, or drag the marker to set your location.
      </div>
    </div>
  );
};

export default LocationPicker;
