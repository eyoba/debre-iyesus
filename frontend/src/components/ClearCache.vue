<template>
  <div v-if="showButton" class="clear-cache-container">
    <button @click="clearAllCaches" class="clear-cache-btn" :disabled="isClearing">
      {{ isClearing ? 'Clearing...' : '🔄 Fix Loading Issues' }}
    </button>
    <div v-if="message" class="cache-message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClearCache',
  data() {
    return {
      showButton: false,
      isClearing: false,
      message: '',
      messageType: ''
    }
  },
  mounted() {
    // Show button if we detect service worker issues or if manually triggered
    this.checkForIssues()

    // Listen for global errors
    window.addEventListener('error', this.handleError)
  },
  beforeUnmount() {
    window.removeEventListener('error', this.handleError)
  },
  methods: {
    handleError(event) {
      if (event.message && event.message.includes('ServiceWorker')) {
        this.showButton = true
      }
    },

    checkForIssues() {
      // Always show in development, or if user has had issues
      if (import.meta.env.DEV || localStorage.getItem('sw_issues') === 'true') {
        this.showButton = true
      }
    },

    async clearAllCaches() {
      this.isClearing = true
      this.message = ''

      try {
        // 1. Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          console.log('Found', registrations.length, 'service worker registrations')

          for (let registration of registrations) {
            await registration.unregister()
            console.log('Unregistered service worker:', registration.scope)
          }
        }

        // 2. Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          console.log('Found', cacheNames.length, 'caches')

          for (let cacheName of cacheNames) {
            await caches.delete(cacheName)
            console.log('Deleted cache:', cacheName)
          }
        }

        // 3. Clear localStorage issue flag
        localStorage.removeItem('sw_issues')

        this.message = 'Cache cleared! Reloading page...'
        this.messageType = 'success'

        // Reload page after short delay
        setTimeout(() => {
          window.location.reload()
        }, 1000)

      } catch (error) {
        console.error('Error clearing caches:', error)
        this.message = 'Error clearing cache. Try closing and reopening the browser.'
        this.messageType = 'error'
        this.isClearing = false
      }
    }
  }
}
</script>

<style scoped>
.clear-cache-container {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.clear-cache-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.clear-cache-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.clear-cache-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cache-message {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 250px;
  text-align: right;
}

.cache-message.success {
  border-left: 4px solid #10b981;
  color: #065f46;
}

.cache-message.error {
  border-left: 4px solid #ef4444;
  color: #991b1b;
}
</style>
