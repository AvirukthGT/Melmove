<template>
  <div class="live-page">
    <div class="page-header">
      <div class="header-content">
        <h1>REAL-TIME PARKING</h1>
        <div class="header-controls">
          <div class="auto-refresh">
            <span class="refresh-icon">🔄</span>
            <span>Auto refresh every 10min</span>
          </div>
          <button class="refresh-btn" @click="refreshData" :disabled="isLoading">
            <span class="refresh-icon">🔄</span>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <div class="controls-section">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Enter street or area..." 
          class="search-input"
          v-model="searchQuery"
          @input="handleSearch"
          @keyup.enter="performSearch"
        />
        <button class="search-btn" @click="performSearch" :disabled="isLoading">
          Search
        </button>
      </div>
      
      <div class="filter-controls">
        <button 
          class="filter-btn" 
          @click="toggleFilter"
          :class="{ active: isFilterActive }"
        >
          <span class="filter-icon">📍</span>
          {{ isFilterActive ? 'Show All' : '2km Filter' }}
        </button>
        <button 
          class="location-btn" 
          @click="centerOnUserLocation"
          v-if="userLocation"
        >
          <span class="location-icon">📍</span>
          My Location
        </button>
        <div class="parking-count">
          <span class="count-icon">🚗</span>
          <span>{{ filteredParkingData.length }} parking spots</span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="map-section">
        <div class="map-container">
          <!-- Google Maps will be loaded here -->
          <div id="map" ref="mapContainer"></div>
          
          <!-- Loading overlay -->
          <div class="loading-overlay" v-if="isLoading || !mapLoaded">
            <div class="loading-spinner"></div>
            <span>{{ isLoading ? 'Loading parking data...' : 'Loading map...' }}</span>
          </div>
        </div>
      </div>

      <!-- Info Panel -->
      <div class="info-panel" v-if="selectedParking">
        <div class="panel-header">
          <h3>{{ selectedParking.name }}</h3>
          <button class="close-btn" @click="closePanel">×</button>
        </div>
        
        <div class="info-content">
          <div class="info-item">
            <span class="label">LOCATION:</span>
            <span class="value">{{ selectedParking.location.street }}, {{ selectedParking.location.city }}, {{ selectedParking.location.state }} {{ selectedParking.location.postcode }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">RATES:</span>
            <div class="rates">
              <div class="rate-item">
                <span class="rate-label">HOURLY:</span>
                <span class="rate-value">AUD ${{ selectedParking.rates.hourly }}</span>
              </div>
              <div class="rate-item">
                <span class="rate-label">DAILY (MAX):</span>
                <span class="rate-value">AUD ${{ selectedParking.rates.daily }}</span>
              </div>
            </div>
          </div>
          
          <div class="info-item" v-if="selectedParking.distance">
            <span class="label">DISTANCE:</span>
            <span class="value">{{ selectedParking.distance }}km away</span>
          </div>
          
          <div class="info-item">
            <span class="label">STATUS:</span>
            <span class="value status" :class="selectedParking.available ? 'available' : 'occupied'">
              {{ selectedParking.available ? 'Present' : 'Occupied' }}
            </span>
          </div>
          
          <div class="info-item">
            <span class="label">LAST UPDATED:</span>
            <span class="value">{{ formatLastUpdated(selectedParking.last_updated) }}</span>
          </div>
        </div>
        
        <div class="panel-actions">
          <button class="btn btn-primary" @click="navigateToParking">
            <span class="nav-icon">🧭</span>
            NAVIGATE
          </button>
          <button class="btn btn-secondary" @click="closePanel">
            CLOSE
          </button>
        </div>
      </div>
      
      <!-- No parking selected state -->
      <div class="info-panel no-selection" v-else>
        <div class="panel-header">
          <h3>Parking Information</h3>
        </div>
        <div class="info-content">
          <div class="no-selection-content">
            <div class="no-selection-icon">🚗</div>
            <p>All parking spots and your location are shown on the map</p>
            <p>Click on any parking marker to view detailed information</p>
            <div class="legend">
              <div class="legend-item">
                <span class="legend-marker user"></span>
                <span>Your Location</span>
              </div>
              <div class="legend-item">
                <span class="legend-marker available"></span>
                <span>Present</span>
              </div>
              <div class="legend-item">
                <span class="legend-marker occupied"></span>
                <span>Occupied</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-source">
      <span>Data Source: City Of Melbourne Open Parking API</span>
      <span v-if="lastUpdated">Last updated: {{ lastUpdated }}</span>
    </div>
  </div>
</template>

<script>
import { GOOGLE_MAPS_API_KEY } from '../config/maps.js'

export default {
  name: 'Live',
  data() {
    return {
      searchQuery: '',
      isLoading: false,
      isFilterActive: false,
      userLocation: null,
      parkingData: [],
      selectedParking: null,
      lastUpdated: null,
      autoRefreshInterval: null,
      map: null,
      mapLoaded: false,
      markers: [],
      userMarker: null,
      showUserLocation: false, // Track if user location should be shown
      
      // Mock data for development - individual parking bays
      mockParkingData: [
        {
          id: 1,
          name: 'Bay A1 - Wilson Parking',
          location: {
            street: '300 LA TROBE STREET',
            city: 'MELBOURNE',
            state: 'VIC',
            postcode: '3000'
          },
          rates: {
            hourly: 8,
            daily: 35
          },
          available: true,
          last_updated: '2024-01-15T10:30:00Z',
          lat: -37.8136,
          lng: 144.9631
        },
        {
          id: 2,
          name: 'Bay B2 - Wilson Parking',
          location: {
            street: '326 LONSDALE STREET',
            city: 'MELBOURNE',
            state: 'VIC',
            postcode: '3000'
          },
          rates: {
            hourly: 7.5,
            daily: 32
          },
          available: false,
          last_updated: '2024-01-15T10:25:00Z',
          lat: -37.8140,
          lng: 144.9640
        },
        {
          id: 3,
          name: 'Bay C1 - CBDpark',
          location: {
            street: '123 QUEEN STREET',
            city: 'MELBOURNE',
            state: 'VIC',
            postcode: '3000'
          },
          rates: {
            hourly: 6,
            daily: 28
          },
          available: true,
          last_updated: '2024-01-15T10:28:00Z',
          lat: -37.8120,
          lng: 144.9620
        },
        {
          id: 4,
          name: 'Bay D1 - QV Melbourne',
          location: {
            street: '200 LONSDALE STREET',
            city: 'MELBOURNE',
            state: 'VIC',
            postcode: '3000'
          },
          rates: {
            hourly: 5.5,
            daily: 25
          },
          available: true,
          last_updated: '2024-01-15T10:32:00Z',
          lat: -37.8150,
          lng: 144.9650
        },
        {
          id: 5,
          name: 'Bay E1 - Greenco Parking',
          location: {
            street: '150 RUSSELL STREET',
            city: 'MELBOURNE',
            state: 'VIC',
            postcode: '3000'
          },
          rates: {
            hourly: 9,
            daily: 40
          },
          available: false,
          last_updated: '2024-01-15T10:20:00Z',
          lat: -37.8160,
          lng: 144.9660
        },
        {
          id: 6,
          name: 'Bay F1 - Adina Hotel',
          location: {
            street: '189 QUEEN STREET',
            city: 'MELBOURNE',
            state: 'VIC',
            postcode: '3000'
          },
          rates: {
            hourly: 10,
            daily: 45
          },
          available: true,
          last_updated: '2024-01-15T10:35:00Z',
          lat: -37.8115,
          lng: 144.9615
        },
        {
          id: 7,
          name: 'Bay G1 - Secure Parking',
          location: {
            street: '456 COLLINS STREET',
            city: 'MELBOURNE',
            state: 'VIC',
            postcode: '3000'
          },
          rates: {
            hourly: 12,
            daily: 50
          },
          available: false,
          last_updated: '2024-01-15T10:15:00Z',
          lat: -37.8170,
          lng: 144.9670
        },
        {
          id: 8,
          name: 'Bay H1 - DIVVY Parking',
          location: {
            street: '789 FLINDERS STREET',
            city: 'MELBOURNE',
            state: 'VIC',
            postcode: '3000'
          },
          rates: {
            hourly: 4.5,
            daily: 20
          },
          available: true,
          last_updated: '2024-01-15T10:40:00Z',
          lat: -37.8180,
          lng: 144.9680
        }
      ]
    }
  },
  
  computed: {
    filteredParkingData() {
      if (this.isFilterActive && this.userLocation) {
        return this.parkingData.filter(parking => {
          const distance = this.calculateDistance(
            this.userLocation.lat,
            this.userLocation.lng,
            parking.lat,
            parking.lng
          )
          parking.distance = distance.toFixed(1)
          return distance <= 2
        })
      }
      return this.parkingData
    }
  },
  
  async mounted() {
    await this.initMap()
    this.getUserLocation()
    this.loadParkingData()
    this.startAutoRefresh()
  },
  
  beforeUnmount() {
    this.stopAutoRefresh()
  },
  
  methods: {
    // Initialize Google Maps
    async initMap() {
      try {
        // Load Google Maps API
        await this.loadGoogleMapsAPI()
        
        // Create map centered on Melbourne
        this.map = new google.maps.Map(this.$refs.mapContainer, {
          center: { lat: -37.8136, lng: 144.9631 },
          zoom: 14, // Slightly zoomed out to show more area
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })
        
        this.mapLoaded = true
        console.log('Google Maps loaded successfully')
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        console.log('Falling back to custom map implementation')
        this.initFallbackMap()
      }
    },
    
    // Load Google Maps API
    loadGoogleMapsAPI() {
      return new Promise((resolve, reject) => {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          resolve()
          return
        }
        
        // Create script element
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log('Google Maps API script loaded')
          // Add a small delay to ensure Google Maps is fully initialized
          setTimeout(() => {
            if (window.google && window.google.maps) {
              resolve()
            } else {
              reject(new Error('Google Maps not properly initialized'))
            }
          }, 100)
        }
        
        script.onerror = () => {
          console.error('Failed to load Google Maps API')
          reject(new Error('Failed to load Google Maps API'))
        }
        
        document.head.appendChild(script)
      })
    },
    
    // Fallback map using CSS
    initFallbackMap() {
      const mapContainer = this.$refs.mapContainer
      mapContainer.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              linear-gradient(90deg, #e9ecef 1px, transparent 1px),
              linear-gradient(0deg, #e9ecef 1px, transparent 1px),
              linear-gradient(90deg, transparent 0%, #d1d5db 2%, #d1d5db 8%, transparent 10%),
              linear-gradient(0deg, transparent 0%, #d1d5db 2%, #d1d5db 8%, transparent 10%);
            background-size: 50px 50px, 50px 50px, 200px 200px, 200px 200px;
            opacity: 0.7;
          "></div>
          
          <!-- Street names -->
          <div style="position: absolute; top: 15%; left: 10%; font-size: 11px; color: #374151; font-weight: 600; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px;">Victoria St</div>
          <div style="position: absolute; top: 25%; left: 15%; font-size: 11px; color: #374151; font-weight: 600; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px;">Capel St</div>
          <div style="position: absolute; top: 35%; left: 20%; font-size: 11px; color: #374151; font-weight: 600; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px;">Franklin St</div>
          <div style="position: absolute; top: 45%; left: 25%; font-size: 11px; color: #374151; font-weight: 600; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px;">La Trobe St</div>
          <div style="position: absolute; top: 55%; left: 30%; font-size: 11px; color: #374151; font-weight: 600; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px;">Russell Str</div>
          <div style="position: absolute; top: 65%; left: 35%; font-size: 11px; color: #374151; font-weight: 600; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px;">Queen Street</div>
          <div style="position: absolute; top: 75%; left: 40%; font-size: 11px; color: #374151; font-weight: 600; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px;">Flinders C</div>
          
          <!-- Map notice -->
          <div style="
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(255,255,255,0.9);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            color: #666;
            border: 1px solid #ddd;
          ">
            <strong>Demo Mode:</strong> Using fallback map. Add Google Maps API key for full functionality.
          </div>
        </div>
      `
      
      this.$nextTick(() => {
        this.addFallbackMarkers()
      })
      
      this.mapLoaded = true
    },
    
    // Add markers to fallback map
    addFallbackMarkers() {
      const mapContainer = this.$refs.mapContainer
      
      // Clear existing markers
      const existingMarkers = mapContainer.querySelectorAll('[data-marker]')
      existingMarkers.forEach(marker => marker.remove())
      
      // Calculate bounds for all markers (parking + user location)
      let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
      
      // Add parking data to bounds
      this.filteredParkingData.forEach(parking => {
        minLat = Math.min(minLat, parking.lat)
        maxLat = Math.max(maxLat, parking.lat)
        minLng = Math.min(minLng, parking.lng)
        maxLng = Math.max(maxLng, parking.lng)
      })
      
      // Add user location to bounds if available (only if not searching or if user clicked "My Location")
      if (this.userLocation && (!this.searchQuery.trim() || this.showUserLocation)) {
        minLat = Math.min(minLat, this.userLocation.lat)
        maxLat = Math.max(maxLat, this.userLocation.lat)
        minLng = Math.min(minLng, this.userLocation.lng)
        maxLng = Math.max(maxLng, this.userLocation.lng)
      }
      
      // Add some padding
      const latPadding = (maxLat - minLat) * 0.1
      const lngPadding = (maxLng - minLng) * 0.1
      minLat -= latPadding
      maxLat += latPadding
      minLng -= lngPadding
      maxLng += lngPadding
      
      this.filteredParkingData.forEach(parking => {
        const marker = document.createElement('div')
        marker.setAttribute('data-marker', 'parking')
        marker.style.cssText = `
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: ${this.getMarkerColor(parking)};
          border: 2px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        `
        marker.textContent = 'P'
        marker.title = parking.name
        
        // Position marker based on bounds
        const latPercent = ((parking.lat - minLat) / (maxLat - minLat)) * 100
        const lngPercent = ((parking.lng - minLng) / (maxLng - minLng)) * 100
        marker.style.top = `${Math.max(5, Math.min(95, latPercent))}%`
        marker.style.left = `${Math.max(5, Math.min(95, lngPercent))}%`
        
        // Add click event
        marker.addEventListener('click', (event) => {
          event.stopPropagation()
          this.selectParking(parking)
        })
        
        // Add hover effect
        marker.addEventListener('mouseenter', () => {
          marker.style.transform = 'scale(1.2)'
          marker.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
        })
        
        marker.addEventListener('mouseleave', () => {
          marker.style.transform = 'scale(1)'
          marker.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)'
        })
        
        mapContainer.appendChild(marker)
      })
      
      // Add user location marker if available (only if not searching or if user clicked "My Location")
      if (this.userLocation && (!this.searchQuery.trim() || this.showUserLocation)) {
        const userMarker = document.createElement('div')
        userMarker.setAttribute('data-marker', 'user')
        userMarker.style.cssText = `
          position: absolute;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background-color: #007bff;
          border: 2px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          cursor: pointer;
          z-index: 15;
        `
        userMarker.textContent = '📍'
        userMarker.title = 'Your Location'
        
        // Calculate position relative to all markers bounds
        const latPercent = ((this.userLocation.lat - minLat) / (maxLat - minLat)) * 100
        const lngPercent = ((this.userLocation.lng - minLng) / (maxLng - minLng)) * 100
        
        // Position the marker
        userMarker.style.top = `${Math.max(5, Math.min(95, latPercent))}%`
        userMarker.style.left = `${Math.max(5, Math.min(95, lngPercent))}%`
        
        mapContainer.appendChild(userMarker)
      }
    },
    
    // Get marker color for fallback map
    getMarkerColor(parking) {
      return parking.available ? '#28a745' : '#dc3545' // Green for available, red for occupied
    },
    
    // Get user location
    getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            this.addUserMarker()
            // Don't change map center - keep showing all parking spots
          },
          (error) => {
            console.log('Error getting location:', error)
            // Set default Melbourne location
            this.userLocation = {
              lat: -37.8136,
              lng: 144.9631
            }
          }
        )
      }
    },
    
    // Add user location marker
    addUserMarker() {
      if (!this.map || !this.userLocation || (this.searchQuery.trim() && !this.showUserLocation)) return
      
      if (this.userMarker) {
        this.userMarker.setMap(null)
      }
      
      this.userMarker = new google.maps.Marker({
        position: this.userLocation,
        map: this.map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="12" fill="#007bff" stroke="white" stroke-width="2"/>
              <circle cx="15" cy="15" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 30),
          anchor: new google.maps.Point(15, 15)
        }
      })
    },
    
    // Add parking markers to map
    addParkingMarkers() {
      if (this.map) {
        // Google Maps implementation
        // Clear existing markers
        this.markers.forEach(marker => marker.setMap(null))
        this.markers = []
        
        const bounds = new google.maps.LatLngBounds()
        
        // Add all parking markers
        this.filteredParkingData.forEach(parking => {
          const marker = new google.maps.Marker({
            position: { lat: parking.lat, lng: parking.lng },
            map: this.map,
            title: parking.name,
            icon: this.getMarkerIcon(parking)
          })
          
          // Add click listener
          marker.addListener('click', (event) => {
            this.selectParking(parking)
          })
          
          this.markers.push(marker)
          bounds.extend({ lat: parking.lat, lng: parking.lng })
        })
        
        // Add user location marker (only if not searching or if user clicked "My Location")
        if (this.userLocation && (!this.searchQuery.trim() || this.showUserLocation)) {
          this.addUserMarker()
          bounds.extend(this.userLocation)
        }
        
        // Let Google Maps automatically fit all markers
        if (!bounds.isEmpty()) {
          this.map.fitBounds(bounds)
        }
      } else {
        // Fallback map implementation
        this.addFallbackMarkers()
      }
    },
    
    // Get marker icon based on availability
    getMarkerIcon(parking) {
      const color = parking.available ? '#28a745' : '#dc3545' // Green for available, red for occupied
      
      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
            <text x="15" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">P</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(15, 15)
      }
    },
    
    // Load parking data from API
    async loadParkingData() {
      this.isLoading = true
      try {
        // In production, use real API
        // const response = await fetch('https://melmove.onrender.com/api/merged-parking')
        // this.parkingData = await response.json()
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
        this.parkingData = [...this.mockParkingData]
        this.lastUpdated = new Date().toLocaleTimeString()
        
        // Add markers to map
        this.$nextTick(() => {
          this.addParkingMarkers()
        })
      } catch (error) {
        console.error('Error loading parking data:', error)
        // Fallback to mock data
        this.parkingData = [...this.mockParkingData]
      } finally {
        this.isLoading = false
      }
    },
    
    // Search functionality
    async performSearch() {
      if (!this.searchQuery.trim()) {
        this.loadParkingData()
        return
      }
      
      // Reset user location display when searching
      this.showUserLocation = false
      this.isLoading = true
      try {
        // In production, use real API
        // const response = await fetch(`https://melmove.onrender.com/api/merged-parking?source=local&keyword=${encodeURIComponent(this.searchQuery)}`)
        // this.parkingData = await response.json()
        
        // Mock search with improved logic
        await new Promise(resolve => setTimeout(resolve, 500))
        const query = this.searchQuery.toLowerCase()
        
        this.parkingData = this.mockParkingData.filter(parking => {
          const nameMatch = parking.name.toLowerCase().includes(query)
          
          // Handle both old and new data structures
          let addressMatch = false
          let streetMatch = false
          
          if (parking.location) {
            // New data structure
            const fullAddress = `${parking.location.street} ${parking.location.city} ${parking.location.state} ${parking.location.postcode}`.toLowerCase()
            addressMatch = fullAddress.includes(query)
            streetMatch = parking.location.street.toLowerCase().includes(query.replace('street', 'st').replace('street', ''))
          } else if (parking.address) {
            // Old data structure
            addressMatch = parking.address.toLowerCase().includes(query)
            streetMatch = parking.address.toLowerCase().includes(query.replace('street', 'st').replace('street', ''))
          }
          
          return nameMatch || addressMatch || streetMatch
        })
        
        // If no results, show a message
        if (this.parkingData.length === 0) {
          console.log('No parking spots found for:', this.searchQuery)
        }
        
        this.addParkingMarkers()
      } catch (error) {
        console.error('Error searching:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // Handle search input
    handleSearch() {
      if (this.searchQuery.trim() === '') {
        this.showUserLocation = false
        this.loadParkingData()
      }
    },
    
    // Toggle 2km filter
    async toggleFilter() {
      this.isFilterActive = !this.isFilterActive
      
      if (this.isFilterActive && this.userLocation) {
        this.isLoading = true
        try {
          // In production, use real API
          // const response = await fetch(`https://melmove.onrender.com/api/merged-parking?lat=${this.userLocation.lat}&lng=${this.userLocation.lng}&radius=2000`)
          // this.parkingData = await response.json()
          
          // Mock filter with distance calculation
          await new Promise(resolve => setTimeout(resolve, 500))
          this.parkingData = this.mockParkingData.filter(parking => {
            const distance = this.calculateDistance(
              this.userLocation.lat,
              this.userLocation.lng,
              parking.lat,
              parking.lng
            )
            parking.distance = distance.toFixed(1)
            return distance <= 2
          })
          
          // Sort by distance
          this.parkingData.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          
          this.addParkingMarkers()
        } catch (error) {
          console.error('Error filtering:', error)
        } finally {
          this.isLoading = false
        }
      } else {
        this.loadParkingData()
      }
    },
    
    // Calculate distance between two points
    calculateDistance(lat1, lng1, lat2, lng2) {
      const R = 6371 // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    },
    
    // Select parking
    selectParking(parking) {
      console.log('Parking selected:', parking.name)
      this.selectedParking = parking
    },
    
    // Navigate to parking
    navigateToParking() {
      if (this.selectedParking && this.selectedParking.lat && this.selectedParking.lng) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${this.selectedParking.lat},${this.selectedParking.lng}`
        window.open(url, '_blank')
      }
    },
    
    // Close panel
    closePanel() {
      this.selectedParking = null
    },
    
    // Refresh data
    refreshData() {
      this.loadParkingData()
    },

    // Center map on user location
    centerOnUserLocation() {
      if (!this.userLocation) {
        console.log('User location not available')
        return
      }

      // Set flag to show user location
      this.showUserLocation = true

      if (this.map) {
        // Google Maps implementation
        this.map.setCenter(this.userLocation)
        this.map.setZoom(15) // Zoom in closer to user location
        
        // Ensure user marker is visible
        if (this.userMarker) {
          this.userMarker.setMap(this.map)
        } else {
          this.addUserMarker()
        }
      } else {
        // Fallback map implementation
        this.centerFallbackMapOnUser()
      }
    },

    // Format last updated timestamp
    formatLastUpdated(timestamp) {
      if (!timestamp) return 'N/A'
      const date = new Date(timestamp)
      return date.toLocaleString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // Center fallback map on user location
    centerFallbackMapOnUser() {
      const mapContainer = this.$refs.mapContainer
      if (!mapContainer || !this.userLocation) return

      // Remove existing user marker
      const existingUserMarker = mapContainer.querySelector('[data-marker="user"]')
      if (existingUserMarker) {
        existingUserMarker.remove()
      }

      // Create new user marker at center
      const userMarker = document.createElement('div')
      userMarker.setAttribute('data-marker', 'user')
      userMarker.style.cssText = `
        position: absolute;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background-color: #007bff;
        border: 2px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        cursor: pointer;
        z-index: 15;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `
      userMarker.textContent = '📍'
      userMarker.title = 'Your Location'
      
      mapContainer.appendChild(userMarker)
    },
    
    // Start auto refresh
    startAutoRefresh() {
      this.autoRefreshInterval = setInterval(() => {
        this.loadParkingData()
      }, 600000) // 10 minutes
    },
    
    // Stop auto refresh
    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval)
        this.autoRefreshInterval = null
      }
    },


  }
}
</script>

<style scoped>
.live-page {
  min-height: calc(100vh - 80px);
  background-color: #ffffff;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content h1 {
  color: var(--primary-color);
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
}

.auto-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.refresh-icon {
  font-size: 1.2rem;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  background-color: white;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.refresh-btn:hover:not(:disabled) {
  background-color: var(--primary-light);
  border-color: var(--primary-dark);
  color: var(--primary-dark);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.controls-section {
  margin-bottom: 2px;
}

.search-container {
  position: relative;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1.2rem;
  z-index: 2;
}

.search-input {
  flex: 1;
  padding: 15px 15px 15px 45px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(45, 90, 39, 0.1);
}

.search-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.search-btn:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  background-color: white;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.filter-btn:hover:not(:disabled) {
  background-color: var(--primary-light);
  border-color: var(--primary-dark);
  color: var(--primary-dark);
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.location-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  background-color: white;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.location-btn:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-dark);
  color: var(--primary-dark);
}

.user-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.location-icon {
  font-size: 1.1rem;
}

.parking-count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  background: rgba(74, 124, 89, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(74, 124, 89, 0.2);
}

.count-icon {
  font-size: 1.1rem;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
  margin-bottom: 30px;
  position: relative;
}

.map-section {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
}

.map-container {
  height: 600px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
}

#map {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}



.info-panel {
  background: var(--secondary-color);
  border-radius: var(--border-radius);
  padding: 24px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
  height: fit-content;
  max-height: 600px;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  color: var(--primary-color);
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.3;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: var(--border-color);
}

.info-content {
  margin-bottom: 24px;
}

.info-item {
  margin-bottom: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.value {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.value.highlight {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 1rem;
}

.value.status {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.value.status.available {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.value.status.occupied {
  background-color: #ffebee;
  color: #c62828;
}

.rates {
  margin-top: 8px;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.rate-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.rate-value {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.85rem;
}

.panel-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
  background-color: var(--primary-color);
  color: white;
}

.nav-icon {
  margin-right: 8px;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
}

.no-selection-content {
  text-align: center;
  padding: 30px;
}

.no-selection-icon {
  font-size: 3rem;
  color: var(--text-secondary);
  margin-bottom: 15px;
}

.no-selection p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1;
  height: 20px;
  min-height: 20px;
  justify-content: flex-start;
  width: fit-content;
}

.legend-marker {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  margin: 0;
  position: relative;
  top: 0;
}

.legend-marker.available {
  background-color: #28a745;
}

.legend-marker.occupied {
  background-color: #dc3545;
}

.legend-marker.user {
  background-color: #007bff;
}

.data-source {
  text-align: right;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .info-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .live-page {
    padding: 15px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .header-controls {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .search-container {
    width: 100%;
    max-width: none;
  }

  .filter-controls {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .parking-count {
    order: -1;
    width: 100%;
    justify-content: center;
  }
  
  .map-container {
    height: 400px;
  }
  
  .panel-actions {
    flex-direction: column;
  }
  
  .legend {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .legend-item {
    width: fit-content;
  }
}
</style>
