<template>
  <div class="home-container">
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
        <h2 class="main-title">
          Smarter Parking <br />
          For Smoother <br />
          Commutes.
        </h2>
        <p class="description">
          “MelMove is a smart city dashboard that helps commuters plan better by visualizing real-time and historical parking data.”
        </p>
        <div class="buttons">
          <router-link to="/live" class="primary-button">→ EXPLORE LIVE PARKING</router-link>
          <router-link to="/urban-trends" class="secondary-button">START WITH URBAN TRENDS ←</router-link>
        </div>
      </div>

      <div class="image-area">
        <!--  car.png -->
        <div class="placeholder-box">[ Car Image ]</div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-container {
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
  font-size: 2.8rem;
  font-weight: bold;
  color: #215a21;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.description {
  font-size: 1.1rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 300px;
  height: 200px;
}

.placeholder-box {
  width: 100%;
  height: 100%;
  border: 2px dashed #c0e8d5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-style: italic;
}
</style>
