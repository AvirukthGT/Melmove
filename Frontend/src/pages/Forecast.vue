<template>
  <div class="forecast-container">
    <header class="nav-bar">
      <router-link to="/" class="logo logo-btn" aria-label="Go to Home">MelMove</router-link>
      <nav class="nav-links">
        <router-link to="/urban-trends">Urban Trends</router-link>
        <router-link to="/live">Live</router-link>
        <router-link to="/forecast">Forecast</router-link>
      </nav>
    </header>

    <main class="content">
      <div class="text-content">
        <h2 class="main-title">Parking Forecast</h2>
        <p class="description">
          Get predictive insights on parking availability for the coming hours and days. Plan ahead with our data-driven forecasts.
        </p>
        <div class="buttons">
          <router-link to="/live" class="primary-button">← BACK TO LIVE</router-link>
          <router-link to="/urban-trends" class="secondary-button">EXPLORE URBAN TRENDS →</router-link>
        </div>
      </div>

      <!-- photo -->
      <div class="image-area">
        <div class="placeholder-box">[ Forecast Chart ]</div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "Forecast",
};
</script>

<style scoped>
.forecast-container {
  font-family: 'Arial', sans-serif;
  padding: 2rem;
  background: white;
  min-height: 100vh;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #c0e8d5;
  padding-bottom: 0.5rem;
}

.logo {
  font-weight: bold;
  color: #215a21;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #215a21;
  font-weight: 500;
}

.content {
  display: flex;
  margin-top: 3rem;
  justify-content: space-between;
  flex-wrap: wrap;
}

.text-content {
  max-width: 600px;
}

.main-title {
  font-size: 2rem;
  color: #215a21;
  margin-bottom: 1rem;
}

.description {
  font-size: 1rem;
  color: #1f1f7a;
  margin-bottom: 2rem;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.primary-button {
  background-color: #e6f4ec;
  padding: 1rem 2rem;
  border-radius: 2rem;
  color: #215a21;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  width: fit-content;
}

.secondary-button {
  border: 2px solid #c0e8d5;
  padding: 1rem 2rem;
  border-radius: 2rem;
  color: #215a21;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  width: fit-content;
}

.image-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
}

.placeholder-box {
  background-color: #f4f4f4;
  border: 2px dashed #bbb;
  padding: 3rem;
  text-align: center;
  font-style: italic;
  color: #888;
  width: 100%;
}
</style>
