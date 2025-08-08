<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Smarter Parking<br>
          For Smoother<br>
          Commutes.
        </h1>
        <p class="hero-description">
          MelMove is a smart city dashboard that helps commuters plan better by visualizing real-time and historical parking data.
        </p>
        <div class="cta-buttons">
          <router-link to="/live" class="cta-button primary">
            <span class="arrow">→</span>
            EXPLORE LIVE PARKING
          </router-link>
          <router-link to="/urban-trends" class="cta-button secondary">
            START WITH URBAN TRENDS
            <span class="arrow">←</span>
          </router-link>
        </div>
      </div>
      <div class="hero-illustration">
        <div class="car-container">
          <div class="car">
            <div class="car-body"></div>
            <div class="car-wheels">
              <div class="wheel"></div>
              <div class="wheel"></div>
            </div>
            <div class="motion-lines">
              <div class="line"></div>
              <div class="line"></div>
            </div>
          </div>
          <div class="data-box">
            <div class="data-item">453</div>
            <div class="chart-icon">☰</div>
            <div class="data-item">162.1</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  min-height: calc(100vh - 80px);
  background-color: #ffffff;
  padding-top: 20px; /* 给navbar留出空间 */
}

.hero-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 80px;
}

.hero-content {
  flex: 1;
  max-width: 500px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: #2d5a27;
  line-height: 1.1;
  margin-bottom: 30px;
}

.hero-description {
  font-size: 1.2rem;
  color: #22228A;
  line-height: 1.6;
  margin-bottom: 40px;
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.cta-button.primary {
  background-color: #4a7c59;
  color: white;
  border-color: #4a7c59;
}

.cta-button.primary:hover {
  background-color: #3d6b4a;
  transform: translateY(-2px);
}

.cta-button.secondary {
  background-color: white;
  color: #2d5a27;
  border-color: #4a7c59;
}

.cta-button.secondary:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
}

.arrow {
  font-size: 16px;
  font-weight: bold;
}

.hero-illustration {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.car-container {
  position: relative;
  border: 2px dashed #4a7c59;
  border-radius: 8px;
  padding: 20px;
  background-color: #f8f9fa;
}

.car {
  position: relative;
  width: 200px;
  height: 100px;
  margin-bottom: 20px;
}

.car-body {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 160px;
  height: 60px;
  background-color: #2d2d2d;
  border-radius: 30px 30px 10px 10px;
}

.car-wheels {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 30px;
}

.wheel {
  width: 20px;
  height: 20px;
  background-color: #2d2d2d;
  border: 3px solid white;
  border-radius: 50%;
}

.motion-lines {
  position: absolute;
  top: 50%;
  right: -30px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.line {
  width: 20px;
  height: 3px;
  background-color: #2d2d2d;
  border-radius: 2px;
}

.data-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #4a7c59;
  color: white;
  padding: 15px 20px;
  border-radius: 6px;
  font-weight: bold;
}

.data-item {
  font-size: 18px;
}

.chart-icon {
  font-size: 20px;
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    gap: 40px;
    padding: 0 20px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .car-container {
    width: 100%;
    max-width: 300px;
  }
}
</style>
