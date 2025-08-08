<template>
  <div class="forecast-page">
    <div class="page-header">
      <h1>FORECAST</h1>
    </div>

    <div class="search-section">
      <div class="search-inputs">
        <div class="input-group">
          <span class="input-icon">🔍</span>
          <input 
            type="text" 
            placeholder="enter area..." 
            class="search-input"
            v-model="searchArea"
          />
        </div>
        <div class="input-group">
          <span class="input-icon">📅</span>
          <input 
            type="text" 
            placeholder="select your date and time" 
            class="search-input"
            v-model="selectedDateTime"
          />
        </div>
        <button class="continue-btn">CONTINUE</button>
      </div>
    </div>

    <div class="forecast-visualizations">
      <div class="chart-grid">
        <!-- Line Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Lonsdale St</div>
            <div class="chart-meta">
              <span class="time">8:30 AM</span>
              <span class="prediction">Predicted: 2 spots</span>
              <span class="confidence">Confidence: 87%</span>
            </div>
          </div>
          <div class="chart-container">
            <div class="line-chart">
              <div class="chart-y-axis">
                <span>20</span>
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>
              <div class="chart-content">
                <div class="line-path"></div>
                <div class="data-points">
                  <div class="point" style="left: 10%; top: 60%"></div>
                  <div class="point" style="left: 30%; top: 40%"></div>
                  <div class="point" style="left: 50%; top: 80%"></div>
                  <div class="point" style="left: 70%; top: 20%"></div>
                  <div class="point" style="left: 90%; top: 70%"></div>
                </div>
              </div>
              <div class="chart-x-axis">
                <span>8 AM</span>
                <span>9 AM</span>
                <span>12 PM</span>
                <span>12 PM</span>
              </div>
            </div>
          </div>
          <div class="chart-description">
            line chart - showing hourly parking trends throughout the day (e.g., 7 am to 7 pm)
          </div>
        </div>

        <!-- Bar Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Lonsdale St</div>
            <div class="chart-meta">
              <span class="time">8:30 AM</span>
              <span class="prediction">Predicted: 2 spots</span>
              <span class="confidence">Confidence: 87%</span>
            </div>
          </div>
          <div class="chart-container">
            <div class="bar-chart">
              <div class="chart-y-axis">
                <span>30</span>
                <span>20</span>
                <span>10</span>
                <span>0</span>
              </div>
              <div class="chart-content">
                <div class="bars">
                  <div class="bar" style="height: 60%"></div>
                  <div class="bar" style="height: 80%"></div>
                  <div class="bar" style="height: 40%"></div>
                  <div class="bar" style="height: 90%"></div>
                </div>
              </div>
              <div class="chart-x-axis">
                <span>8 AM</span>
                <span>9 AM</span>
                <span>12 PM</span>
                <span>12 PM</span>
              </div>
            </div>
          </div>
          <div class="chart-description">
            bar chart - displaying total available spots by time blocks
          </div>
        </div>

        <!-- Heatmap -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Lonsdale St</div>
            <div class="chart-meta">
              <span class="time">8:30 AM</span>
              <span class="prediction">Predicted: 12 spots</span>
              <span class="confidence">Confidence: 87%</span>
            </div>
          </div>
          <div class="chart-container">
            <div class="heatmap">
              <div class="heatmap-grid">
                <div class="heatmap-cell" style="background-color: #ffeb3b"></div>
                <div class="heatmap-cell" style="background-color: #ffc107"></div>
                <div class="heatmap-cell" style="background-color: #ff9800"></div>
                <div class="heatmap-cell" style="background-color: #f57c00"></div>
                <div class="heatmap-cell" style="background-color: #ffeb3b"></div>
                <div class="heatmap-cell" style="background-color: #ffc107"></div>
                <div class="heatmap-cell" style="background-color: #ff9800"></div>
                <div class="heatmap-cell" style="background-color: #f57c00"></div>
                <div class="heatmap-cell" style="background-color: #ffc107"></div>
                <div class="heatmap-cell" style="background-color: #ff9800"></div>
                <div class="heatmap-cell" style="background-color: #f57c00"></div>
                <div class="heatmap-cell" style="background-color: #e65100"></div>
                <div class="heatmap-cell" style="background-color: #ff9800"></div>
                <div class="heatmap-cell" style="background-color: #f57c00"></div>
                <div class="heatmap-cell" style="background-color: #e65100"></div>
                <div class="heatmap-cell" style="background-color: #bf360c"></div>
              </div>
            </div>
          </div>
          <div class="chart-description">
            heatmap - visualizing density of predicted availability on a map
          </div>
        </div>

        <!-- Map Visualization -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Lonsdale St</div>
            <div class="chart-meta">
              <span class="time">8:30 AM</span>
              <span class="prediction">Predicted: 12 spots</span>
              <span class="confidence">Confidence: 87%</span>
            </div>
          </div>
          <div class="chart-container">
            <div class="map-visualization">
              <div class="map-grid">
                <div class="target-marker">
                  <div class="target-circle"></div>
                  <div class="target-rings">
                    <div class="ring ring-1"></div>
                    <div class="ring ring-2"></div>
                    <div class="ring ring-3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-description">
            Predictions are based on historical trends and realtime data.
          </div>
        </div>
      </div>
    </div>

    <div class="footer-info">
      <div class="quote">
        "Predictions are based on historical trends and real-time data."
      </div>
      <div class="data-source">
        Data Source: City Of Melbourne Open Parking API
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Forecast',
  data() {
    return {
      searchArea: 'Lonsdale St',
      selectedDateTime: '8:30 AM'
    }
  }
}
</script>

<style scoped>
.forecast-page {
  padding: 100px 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--primary-color);
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
}

.search-section {
  margin-bottom: 40px;
}

.search-inputs {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.input-group {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
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

.continue-btn {
  padding: 15px 30px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 1rem;
}

.continue-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

.forecast-visualizations {
  margin-bottom: 40px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.chart-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 24px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
}

.chart-header {
  margin-bottom: 20px;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.chart-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.chart-meta span {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.chart-meta .prediction {
  color: var(--primary-color);
  font-weight: 500;
}

.chart-meta .confidence {
  color: #28a745;
  font-weight: 500;
}

.chart-container {
  height: 200px;
  margin-bottom: 15px;
  position: relative;
}

.chart-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  line-height: 1.4;
}

/* Line Chart Styles */
.line-chart {
  display: flex;
  height: 100%;
  position: relative;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 10px;
  font-size: 0.7rem;
  color: var(--text-secondary);
  min-width: 30px;
}

.chart-content {
  flex: 1;
  position: relative;
  border-bottom: 2px solid var(--border-color);
  border-left: 2px solid var(--border-color);
}

.line-path {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, var(--primary-color) 30%, var(--primary-color) 70%, transparent 70%);
  opacity: 0.3;
}

.data-points {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.point::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  background: rgba(45, 90, 39, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.chart-x-axis {
  position: absolute;
  bottom: -25px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

/* Bar Chart Styles */
.bar-chart {
  display: flex;
  height: 100%;
  position: relative;
}

.bars {
  flex: 1;
  display: flex;
  align-items: end;
  justify-content: space-around;
  gap: 10px;
  padding: 0 20px;
  border-bottom: 2px solid var(--border-color);
  border-left: 2px solid var(--border-color);
}

.bar {
  width: 30px;
  background: linear-gradient(to top, var(--primary-color), var(--primary-light));
  border-radius: 4px 4px 0 0;
  min-height: 10px;
  transition: var(--transition);
}

.bar:hover {
  transform: scaleY(1.1);
}

/* Heatmap Styles */
.heatmap {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 2px;
  width: 150px;
  height: 150px;
}

.heatmap-cell {
  border-radius: 2px;
  transition: var(--transition);
}

.heatmap-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Map Visualization Styles */
.map-visualization {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-light);
  border-radius: 8px;
}

.map-grid {
  position: relative;
  width: 150px;
  height: 150px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.target-marker {
  position: relative;
}

.target-circle {
  width: 20px;
  height: 20px;
  background: #dc3545;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #dc3545;
}

.target-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ring {
  position: absolute;
  border: 2px solid rgba(220, 53, 69, 0.3);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.ring-1 {
  width: 40px;
  height: 40px;
  top: -10px;
  left: -10px;
}

.ring-2 {
  width: 60px;
  height: 60px;
  top: -20px;
  left: -20px;
  animation-delay: 0.5s;
}

.ring-3 {
  width: 80px;
  height: 80px;
  top: -30px;
  left: -30px;
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.footer-info {
  text-align: center;
  margin-top: 40px;
}

.quote {
  font-style: italic;
  color: var(--text-secondary);
  margin-bottom: 10px;
  font-size: 1rem;
}

.data-source {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

@media (max-width: 1024px) {
  .chart-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .forecast-page {
    padding: 100px 15px 40px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .search-inputs {
    flex-direction: column;
    gap: 15px;
  }
  
  .input-group {
    min-width: auto;
  }
  
  .continue-btn {
    align-self: flex-start;
  }
  
  .chart-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
