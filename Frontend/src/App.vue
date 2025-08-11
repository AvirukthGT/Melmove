<template>
  <PasswordGate>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      © 2025 MelMove. All rights reserved.
    </footer>
  </div>
  </PasswordGate>
</template>

<script>
import Navbar from './components/Navbar.vue'
import PasswordGate from './PasswordGate.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    PasswordGate
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Outfit', sans-serif;
  background-color: #ffffff;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Outfit', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #ffffff;
}

.main-content {
  min-height: calc(100vh - 80px);
  padding: 120px 20px 40px; /* 增加顶部间距，避免被navbar遮挡 */
  background-color: #ffffff; /* app background to white */
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #ffffff; /* ensure page background is white */
}

.footer {
  text-align: center;
  font-size: 0.85rem;
  color: #888;
  padding: 15px 0;
  border-top: 1px solid #eee;
  background-color: #ffffff;
}
</style>
