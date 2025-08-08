// Google Maps API Configuration
// Replace with your actual API key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBE47HieWMQx4-EaEKaA5O89TP6Z-GhUsk'

// Fallback coordinates for Melbourne CBD
export const MELBOURNE_CENTER = {
  lat: -37.8136,
  lng: 144.9631
}

// Default map options
export const DEFAULT_MAP_OPTIONS = {
  zoom: 15,
  mapTypeId: 'roadmap',
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}
