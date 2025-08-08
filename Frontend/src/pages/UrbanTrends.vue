
<template>
  <div class="urban-trends-container">
    <header class="nav-bar">
      <router-link to="/" class="logo logo-btn" aria-label="Go to Home">MelMove</router-link>
      <nav class="nav-links">
        <router-link to="/urban-trends">Urban Trends</router-link>
        <router-link to="/live">Live</router-link>
        <router-link to="/forecast">Forecast</router-link>
      </nav>
    </header>

    <header class="page-header">
      <h2>MELBOURNE CITY VEHICLE AND POPULATION TREND ANALYSIS (2010–2021)</h2>
    </header>

    <!-- photo1 -->
    <section class="chart-section">
      <!-- vehicle-trends.png -->
      <div class="placeholder-box">[Vehicle Ownership Trends Image Placeholder]</div>

      <p class="chart-caption">
        Vehicle ownership in Melbourne has grown steadily over the past decade,
        placing continued pressure on roads and urban infrastructure.
      </p>
      <p class="data-source">
        <strong>Data Source:</strong> ABS Motor Vehicle Census dataset
      </p>
    </section>

    <!-- photo2 -->
    <section class="chart-section">
      <!--cbd-population-trends.png -->
      <div class="placeholder-box">[CBD Population Trends Image Placeholder]</div>

      <p class="chart-caption">
        The population of Melbourne’s CBD has doubled over the past 20 years,
        exacerbating peak-hour traffic congestion.
      </p>
      <p class="data-source">
        <strong>Data Source:</strong> ABS Regional Population Dataset
      </p>
    </section>
  </div>
</template>

<style scoped>
.urban-trends-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Arial', sans-serif;
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
  font-size: 1.5rem;
  color: #215a21;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}
.logo:hover, .logo:focus {
  color: #1f1f7a;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #215a21;
  font-weight: 500;
  font-size: 1.1rem;
}

.page-header h2 {
  text-align: center;
  color: #1b3d1b;
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.chart-section {
  margin-bottom: 3rem;
  text-align: center;
}

.placeholder-box {
  width: 100%;
  height: 300px;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  color: #999;
  background-color: #f9f9f9;
}

.chart-caption {
  margin-top: 1rem;
  font-size: 1rem;
  color: #333;
}

.data-source {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #777;
  font-style: italic;
}
</style>
