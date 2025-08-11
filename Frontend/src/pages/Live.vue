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
            <span class="label">NAME:</span>
            <span class="value">{{ selectedParking.name || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">COORDINATES:</span>
            <span class="value">
              {{ (selectedParking.lat != null && selectedParking.lng != null) ? `${selectedParking.lat.toFixed(5)}, ${selectedParking.lng.toFixed(5)}` : 'N/A' }}
            </span>
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
const API_BASE = 'https://melmove.onrender.com'
// Use Vite dev proxy: keep empty so requests go to '/api' and are proxied to 3000
// const API_BASE = ''

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
          lng: 144.9640,
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
          lng: 144.9650,
        }
      ]
    }
  },

  computed: {
    filteredParkingData() {
      // 1) 默认显示非占用的车位（包含 true 或未知 null/undefined）
      let result = this.parkingData.filter(parking => parking.available !== false)

      // 2) 若开启 2km 过滤，则按距离筛选
      if (this.isFilterActive && this.userLocation) {
        result = result.filter(parking => {
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

      // 3) 去重（优先使用后端提供的 id，否则降级到坐标+名称）
      const seen = new Set()
      const deduped = []
      for (const p of result) {
        const key = p.id ?? `${Number(p.lat).toFixed(5)},${Number(p.lng).toFixed(5)},${p.name}`
        if (!seen.has(key)) {
          seen.add(key)
          deduped.push(p)
        }
      }
      return deduped
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
            { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] }, // CHANGED
            { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }  // CHANGED
          ]
        })

        this.mapLoaded = true
        console.log('Google Maps loaded successfully')
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        this.mapLoaded = false
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
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBE47HieWMQx4-EaEKaA5O89TP6Z-GhUsk&libraries=places`
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
        // In development or production
        const res = await fetch(`${API_BASE}/api/merged-parking`, { cache: 'no-store' })
        const json = await res.json()
        const items = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : [])

        console.table(items.slice(0, 5))

        if (items.length) {
          this.parkingData = items.map((item, idx) => ({
            id: item.id ?? idx,
            name: item.name,
            lat: item.lat ?? item.location?.lat,
            lng: item.lng ?? item.location?.lon,
            rates: item.rates,
            available: (item.status !== undefined) ? item.status : item.available,
            last_updated: item.last_updated ?? item.status_timestamp ?? null
          }))
        } else {
          console.error('API returned error:', json?.error)
          this.parkingData = []
        }

        this.lastUpdated = new Date().toLocaleTimeString()
        this.$nextTick(() => this.addParkingMarkers())
      } catch (error) {
        console.error('Error loading parking data:', error)
        // this.parkingData = [...this.mockParkingData]   // <<< mock
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
        const q = encodeURIComponent(this.searchQuery.trim())
        const res = await fetch(`${API_BASE}/api/merged-parking?keyword=${q}`, { cache: 'no-store' })
        const json = await res.json()
        const items = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : [])

        if (items.length) {
          this.parkingData = items.map((item, idx) => ({
            id: item.id ?? idx,
            name: item.name,
            lat: item.lat ?? item.location?.lat,
            lng: item.lng ?? item.location?.lon,
            rates: item.rates,
            available: (item.status !== undefined) ? item.status : item.available,
            last_updated: item.last_updated ?? item.status_timestamp ?? null
          }))
          this.addParkingMarkers()
        } else {
          console.error('API returned error:', json?.error)
        }
      } catch (error) {
        console.error('Error searching:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Toggle 2km filter
    async toggleFilter() {
      this.isFilterActive = !this.isFilterActive

      if (this.isFilterActive && this.userLocation) {
      this.isLoading = true
      try {
        const { lat, lng } = this.userLocation
        // 后端半径单位是「公里」，UI 写 2km，就传 radiusKm=2
        const res = await fetch(`${API_BASE}/api/merged-parking?lat=${lat}&lng=${lng}&radiusKm=2`, { cache: 'no-store' })
        const json = await res.json()
        const items = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : [])

        if (items.length) {
          this.parkingData = items.map((item, idx) => ({
            id: item.id ?? idx,
            name: item.name,
            lat: item.lat ?? item.location?.lat,
            lng: item.lng ?? item.location?.lon,
            rates: item.rates,
            available: (item.status !== undefined) ? item.status : item.available,
            last_updated: item.last_updated ?? item.status_timestamp ?? null
          }))
          this.addParkingMarkers()
        } else {
          console.error('API returned error:', json?.error)
        }
      } catch (error) {
        console.error('Error filtering:', error)
      } finally {
        this.isLoading = false
      }
      } else {
        this.loadParkingData() // 取消过滤时回到全量
      }
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
