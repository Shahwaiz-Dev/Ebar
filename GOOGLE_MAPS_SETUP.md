# Google Maps Integration Setup

This project now includes Google Maps integration for location-based search and bar creation. Follow these steps to set up the Google Maps API:

## 1. Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

## 2. Environment Variables

Create a `.env` file in the root directory with the following content:

```env
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 3. Features Added

### Search Page Enhancements
- **Google Maps Search Bar**: Search for locations with autocomplete suggestions
- **Location-based Filtering**: Filter beach bars by distance from selected location
- **Interactive Map**: Visual map display with location selection
- **Radius Controls**: Adjust search radius (10km, 25km, 50km, 100km)

### Bar Creation Enhancements
- **Google Maps Integration**: Select bar location using map or search
- **Tabbed Interface**: Organized form with Basic Info, Location, and Details tabs
- **Location Validation**: Ensures location is selected before creating bar
- **Coordinate Management**: Automatic coordinate extraction from selected location

## 4. API Requirements

Make sure your Google Maps API key has the following APIs enabled:
- Maps JavaScript API
- Places API (for autocomplete and place details)
- Geocoding API (for address lookup)

## 5. Security Notes

- Restrict your API key to specific domains
- Consider implementing rate limiting
- Monitor API usage in Google Cloud Console

## 6. Usage

### For Users
1. Use the search bar to find locations
2. Select a location to filter nearby beach bars
3. Adjust the search radius as needed
4. Use the map view to visually explore locations

### For Bar Owners
1. When adding a new bar, go to the "Location" tab
2. Search for your bar's location or click on the map
3. Verify the coordinates in the "Details" tab
4. Complete the other required information

## 7. Troubleshooting

- If maps don't load, check your API key and ensure the required APIs are enabled
- If search suggestions don't appear, verify the Places API is enabled
- If location selection doesn't work, check the Geocoding API is enabled
