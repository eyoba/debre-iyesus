<template>
  <div class="public-layout">
    <nav>
      <div class="container">
        <router-link to="/" class="logo">
          <h2>{{ navTitle || 'Churches Directory' }}</h2>
        </router-link>
        <div class="nav-links">
          <button v-if="showChurchInstall" @click="installChurchApp" class="install-btn church-install">
            📱 Install App
          </button>
          <button v-if="showCalendarInstall" @click="installCalendarApp" class="install-btn calendar-install">
            📅 Calendar
          </button>
          <a href="/" @click.prevent="goHome" style="cursor: pointer; color: inherit; text-decoration: none;">Home</a>
          <router-link to="/admin/login" class="btn btn-primary btn-sm">Admin Login</router-link>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>

    <footer>
      <div class="container text-center">
        <p>&copy; 2026 Eritrean Orthodox Tewahdo Church, Diocese of Norway. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'PublicLayout',
  data() {
    return {
      navTitle: '',
      showChurchInstall: false,
      showCalendarInstall: false,
      deferredPrompt: null,
      isFirefox: false,
      isIOS: false,
      isStandalone: false
    }
  },
  async mounted() {
    await this.fetchSiteSettings()
    this.initializePWAInstall()
  },
  methods: {
    async fetchSiteSettings() {
      try {
        const response = await axios.get(`${API_URL}/church`)
        this.navTitle = response.data.nav_title || ''
      } catch (err) {
        console.error('Error fetching site settings:', err)
      }
    },
    initializePWAInstall() {
      // Detect browser and device
      this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true

      // Don't show install buttons if already installed
      if (this.isStandalone) {
        return
      }

      // Check if user dismissed church install recently
      const churchDismissed = localStorage.getItem('pwa-install-dismissed')
      if (!churchDismissed || this.shouldShowAgain(churchDismissed)) {
        this.showChurchInstall = true
      }

      // Check if user dismissed calendar install recently
      const calendarDismissed = localStorage.getItem('calendar-install-dismissed')
      if (!calendarDismissed || this.shouldShowAgain(calendarDismissed)) {
        this.showCalendarInstall = true
      }

      // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.deferredPrompt = e
        this.showChurchInstall = true
      })

      // Listen for app installed event
      window.addEventListener('appinstalled', () => {
        this.showChurchInstall = false
        this.deferredPrompt = null
      })
    },
    shouldShowAgain(dismissedTimestamp) {
      const dismissedTime = parseInt(dismissedTimestamp)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      return daysSinceDismissed >= 7
    },
    async installChurchApp() {
      if (this.deferredPrompt) {
        // Standard PWA install (Chrome, Edge, etc.)
        this.deferredPrompt.prompt()
        const { outcome } = await this.deferredPrompt.userChoice
        console.log(`User response to install prompt: ${outcome}`)
        this.deferredPrompt = null
        this.showChurchInstall = false
        localStorage.setItem('pwa-install-dismissed', Date.now())
      } else if (this.isIOS) {
        // Show iOS installation instructions
        alert('Install on iPhone/iPad:\n\n' +
              '1. Tap the Share button (square with arrow) at the bottom of Safari\n' +
              '2. Scroll down and tap "Add to Home Screen"\n' +
              '3. Tap "Add" in the top right\n' +
              '4. The app icon will appear on your home screen!\n\n' +
              '✅ Works offline after installation\n' +
              '✅ Full church management features')
      } else if (this.isFirefox) {
        // Show Firefox limitations and instructions
        alert('Firefox Desktop PWA Support:\n\n' +
              'Firefox desktop has limited PWA install support.\n\n' +
              'Good news:\n' +
              '✅ The app still works offline in Firefox!\n' +
              '✅ Service Worker is active\n' +
              '✅ All features work perfectly\n\n' +
              'For full install experience:\n' +
              '• Use Chrome or Edge on desktop\n' +
              '• Or use Firefox on Android\n\n' +
              'You can bookmark this page for quick access!')
      }
    },
    installCalendarApp() {
      // Open the Geez Calendar PWA in a new tab
      window.open('https://eyoba.github.io/geez-calendar-pwa/', '_blank')
      localStorage.setItem('calendar-install-dismissed', Date.now())
    },
    goHome() {
      // Emit custom event to reset home page to default state
      window.dispatchEvent(new CustomEvent('reset-home'))
      // Navigate to home if not already there
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: var(--gray-900);
}

.logo h2 {
  margin: 0;
  line-height: 1.3;
  font-size: 1.25rem;
}

.logo h2 br {
  display: block;
  content: "";
  margin-top: 0.25rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.install-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.install-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

main {
  flex: 1;
}

footer {
  background: var(--gray-100);
  padding: 2rem 0;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  nav .container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .install-btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
