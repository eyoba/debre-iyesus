<template>
  <div v-if="showInstallPrompt" class="install-pwa-banner">
    <div class="install-content">
      <div class="install-icon">📱</div>
      <div class="install-text">
        <strong v-html="promptTitle"></strong>
        <p v-html="promptMessage"></p>
      </div>
      <div class="install-actions">
        <button @click="installApp" class="btn btn-primary">{{ installButtonText }}</button>
        <button @click="dismissPrompt" class="btn btn-secondary">Later</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InstallPWA',
  data() {
    return {
      deferredPrompt: null,
      showInstallPrompt: false,
      isFirefox: false,
      isIOS: false,
      isStandalone: false,
      promptTitle: 'Install Debre Iyesus Church App',
      promptMessage: '',
      installButtonText: 'Install'
    }
  },
  mounted() {
    // Detect browser and device
    this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone === true

    console.log('Browser Detection:', {
      isFirefox: this.isFirefox,
      isIOS: this.isIOS,
      isStandalone: this.isStandalone
    })

    // Check if user dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        return // Don't show if dismissed within last 7 days
      }
    }

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      this.deferredPrompt = e
      // Reset to default messages
      this.promptTitle = 'Install Debre Iyesus Church App'
      this.promptMessage = ''
      this.installButtonText = 'Install'
      // Show the install prompt
      this.showInstallPrompt = true
    })

    // Show install prompt for iOS users if not already installed
    if (this.isIOS && !this.isStandalone) {
      console.log('iOS detected - showing install instructions')
      this.promptTitle = 'Install on iOS'
      this.promptMessage = 'Tap the Share button <svg style="display:inline;width:1em;height:1em;vertical-align:middle" viewBox="0 0 24 24" fill="currentColor"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z"/></svg> then "Add to Home Screen"'
      this.installButtonText = 'Show Instructions'
      this.showInstallPrompt = true
    }
    // Show install prompt for Firefox and other browsers if not already installed
    else if ((this.isFirefox || !this.deferredPrompt) && !this.isStandalone) {
      console.log('Firefox or non-Chromium browser detected - showing offline info')
      setTimeout(() => {
        // Only show if beforeinstallprompt didn't fire
        if (!this.deferredPrompt) {
          this.promptTitle = 'Install Debre Iyesus Church App'
          this.promptMessage = ''
          this.installButtonText = 'Install'
          this.showInstallPrompt = true
        }
      }, 2000)
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      this.showInstallPrompt = false
      this.deferredPrompt = null
    })
  },
  methods: {
    async installApp() {
      if (this.deferredPrompt) {
        // Standard PWA install (Chrome, Edge, etc.)
        this.deferredPrompt.prompt()
        const { outcome } = await this.deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)
        this.deferredPrompt = null
        this.showInstallPrompt = false
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
    dismissPrompt() {
      this.showInstallPrompt = false
      // Remember dismissal for 7 days
      localStorage.setItem('pwa-install-dismissed', Date.now())
    }
  }
}
</script>

<style scoped>
.install-pwa-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.install-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.install-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.install-text {
  flex: 1;
  text-align: center;
}

.install-text strong {
  display: block;
  margin-bottom: 0.25rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.install-text p {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.install-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btn {
  padding: 10px 30px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn:hover {
  transform: scale(1.05);
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .install-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .install-actions {
    width: 100%;
    justify-content: center;
  }

  .install-actions button {
    flex: 1;
  }
}
</style>
