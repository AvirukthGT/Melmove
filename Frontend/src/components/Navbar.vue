<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="logo-section">
        <router-link to="/" class="logo">
          <span class="logo-text">MelMove</span>
        </router-link>
        <div class="separator-line"></div>
      </div>
      
      <!-- Desktop Navigation -->
      <ul class="nav-links desktop-nav">
        <li>
          <router-link to="/urban-trends" class="nav-link">
            Urban Trends
          </router-link>
        </li>
        <li>
          <router-link to="/live" class="nav-link">
            Live
          </router-link>
        </li>
        <li>
          <router-link to="/forecast" class="nav-link">
            Forecast
          </router-link>
        </li>

      </ul>
      
      <!-- Mobile Menu Button -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ 'active': isMobileMenuOpen }">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      
      <!-- Mobile Navigation -->
      <div class="mobile-nav" :class="{ 'open': isMobileMenuOpen }" @click.self="closeMobileMenu">
        <ul class="mobile-nav-links">
          <li>
            <router-link to="/urban-trends" class="mobile-nav-link" @click="closeMobileMenu">
              Urban Trends
            </router-link>
          </li>
          <li>
            <router-link to="/live" class="mobile-nav-link" @click="closeMobileMenu">
              Live
            </router-link>
          </li>
          <li>
            <router-link to="/forecast" class="mobile-nav-link" @click="closeMobileMenu">
              Forecast
            </router-link>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      isMobileMenuOpen: false
    }
  },
  mounted() {
    this.updateUnderlineInsets()
    window.addEventListener('resize', this.updateUnderlineInsets)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateUnderlineInsets)
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
    },
    updateUnderlineInsets() {
      const container = this.$el.querySelector('.navbar-container')
      const logoSection = this.$el.querySelector('.logo-section')
      const desktopNav = this.$el.querySelector('.desktop-nav')
      if (!container || !logoSection) return
      
      const containerRect = container.getBoundingClientRect()
      const logoRect = logoSection.getBoundingClientRect()
      
      // 左端对齐 logo section 左边缘
      const leftInset = Math.max(0, Math.round(logoRect.left - containerRect.left))
      
      // 右端对齐 desktop nav 右边缘
      let rightInset = 20
      if (desktopNav && window.getComputedStyle(desktopNav).display !== 'none') {
        const navRect = desktopNav.getBoundingClientRect()
        rightInset = Math.max(0, Math.round(containerRect.right - navRect.right))
      }
      
      this.$el.style.setProperty('--underline-left', leftInset + 'px')
      this.$el.style.setProperty('--underline-right', rightInset + 'px')
    }
  },
  watch: {
    // Ensure the mobile menu closes on route change to avoid the "locked" state
    $route() {
      this.isMobileMenuOpen = false
      this.$nextTick(() => this.updateUnderlineInsets())
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

.navbar, .nav-link, .mobile-nav-link, .logo-text, .logo-subtitle, .mobile-menu-btn {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
}
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  z-index: 1000;
  height: 80px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* underline that matches main content width */
.navbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  margin-left: var(--underline-left, 20px);
  margin-right: var(--underline-right, 20px);
  background-color: #4a7c59;
  border-radius: 2px;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition: all 0.3s ease;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #2d5a27;
  line-height: 1;
}

.logo-subtitle {
  font-size: 10px;
  color: #666;
  font-weight: 400;
  margin-top: 2px;
}

.logo:hover .logo-text {
  color: #1a3d1a;
}

.logo:hover .logo-subtitle {
  color: #4a7c59;
}

.separator-line { display: none; }

.nav-links {
  display: flex;
  list-style: none;
  gap: 40px;
}

.nav-link {
  color: #333333;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  padding: 10px 15px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
}

.nav-link:hover {
  color: #2d5a27;
  background-color: #f8f9fa;
}

.nav-link:hover .nav-icon {
  opacity: 1;
}

.nav-link.active {
  color: #2d5a27;
  background-color: #e8f5e8;
  border-radius: 6px;
}

/* Support Vue Router v4 default active classes */
.nav-link.router-link-exact-active,
.nav-link.router-link-active {
  color: #2d5a27;
  background-color: #e8f5e8;
  border-radius: 6px;
}

.nav-link.active .nav-icon {
  opacity: 1;
}

/* 移除激活状态下的横线 */
.nav-link.active::after {
  display: none;
}

.nav-link.router-link-exact-active::after,
.nav-link.router-link-active::after {
  display: none;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  gap: 4px;
  margin-left: auto; /* ensure it sticks to the right when desktop nav is hidden */
  z-index: 2001; /* above the mobile menu layer */
  position: relative;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background-color: #2d5a27;
  border-radius: 2px;
  transition: all 0.3s ease;
  display: block;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-100%);
  transition: transform 0.25s ease;
  z-index: 2000; /* ensure above page content */
  visibility: hidden;
  pointer-events: none;
}

.mobile-nav.open {
  transform: translateY(0);
  visibility: visible;
  pointer-events: auto;
}

.mobile-nav-links {
  list-style: none;
  padding: 20px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mobile-nav-link {
  color: #333333;
  text-decoration: none;
  font-weight: 500;
  font-size: 18px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-nav-link:hover {
  color: #2d5a27;
  background-color: #f8f9fa;
}

.mobile-nav-link.active {
  color: #2d5a27;
  background-color: #e8f5e8;
}

.mobile-nav-link.router-link-exact-active,
.mobile-nav-link.router-link-active {
  color: #2d5a27;
  background-color: #e8f5e8;
}

.mobile-nav-link .nav-icon {
  font-size: 20px;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 15px;
  }
  
  .desktop-nav {
    display: none !important;
  }
  
  .mobile-menu-btn {
    display: flex !important;
    visibility: visible !important;
  }
  
  .mobile-nav {
    display: block;
  }
  
  .logo-subtitle {
    display: none;
  }
  
  .separator-line {
    display: none;
  }
  
  /* 移动端隐藏下划线 */
  .navbar::after {
    display: none;
  }
}
</style>
