<template>
  <div v-if="showInstallPrompt" class="install-pwa-banner">
    <div class="install-content">
      <div class="install-icon">📱</div>
      <div class="install-text">
        <strong>Install Debre Iyesus Church App</strong>
        <p>Install this app on your device for quick and easy access</p>
      </div>
      <div class="install-actions">
        <button @click="installApp" class="btn btn-primary">Install</button>
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
      showInstallPrompt: false
    }
  },
  mounted() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      this.deferredPrompt = e
      // Show the install prompt
      this.showInstallPrompt = true
    })

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      this.showInstallPrompt = false
      this.deferredPrompt = null
    })
  },
  methods: {
    async installApp() {
      if (!this.deferredPrompt) {
        return
      }

      // Show the install prompt
      this.deferredPrompt.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)

      // Clear the deferredPrompt
      this.deferredPrompt = null
      this.showInstallPrompt = false
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
  background: white;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
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
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.install-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.install-text {
  flex: 1;
}

.install-text strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--gray-900);
}

.install-text p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.install-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color, #3b82f6);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover, #2563eb);
}

.btn-secondary {
  background: var(--gray-200);
  color: var(--gray-700);
}

.btn-secondary:hover {
  background: var(--gray-300);
}

@media (max-width: 768px) {
  .install-content {
    flex-direction: column;
    text-align: center;
  }

  .install-actions {
    width: 100%;
  }

  .install-actions button {
    flex: 1;
  }
}
</style>
