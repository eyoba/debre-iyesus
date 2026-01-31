<template>
  <div v-if="showPrompt" class="install-calendar-banner">
    <div class="install-content">
      <div class="install-icon">📅</div>
      <div class="install-text">
        <strong>Install Geez Calendar App</strong>
        <p>Get the offline calendar app on your phone or desktop</p>
      </div>
      <div class="install-actions">
        <button @click="openCalendar" class="btn btn-primary">Install</button>
        <button @click="dismissPrompt" class="btn btn-secondary">Later</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InstallGeezCalendar',
  data() {
    return {
      showPrompt: false
    }
  },
  mounted() {
    // Check if user dismissed recently
    const dismissed = localStorage.getItem('calendar-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        return // Don't show if dismissed within last 7 days
      }
    }

    // Show the calendar install prompt after 4 seconds
    // (to not conflict with the church PWA prompt at 2s)
    setTimeout(() => {
      this.showPrompt = true
    }, 4000)
  },
  methods: {
    openCalendar() {
      // Open the Geez Calendar PWA in a new tab
      window.open('https://eyoba.github.io/geez-calendar-pwa/', '_blank')
      this.showPrompt = false
      // Remember that user clicked install
      localStorage.setItem('calendar-install-dismissed', Date.now())
    },
    dismissPrompt() {
      this.showPrompt = false
      // Remember dismissal for 7 days
      localStorage.setItem('calendar-install-dismissed', Date.now())
    }
  }
}
</script>

<style scoped>
.install-calendar-banner {
  position: fixed;
  bottom: 95px; /* Position above the church PWA banner */
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  z-index: 999;
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
  .install-calendar-banner {
    bottom: 180px; /* More space on mobile */
  }

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
