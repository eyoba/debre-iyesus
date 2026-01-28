<template>
  <div class="events-page">
    <div class="page-header">
      <div class="container">
        <h1>📅 Upcoming Events</h1>
        <p>Join us for these upcoming events and activities</p>
      </div>
    </div>

    <div class="container">
      <div v-if="loading" class="spinner"></div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-else-if="events.length === 0" class="empty-state">
        <p>No upcoming events scheduled at the moment.</p>
      </div>

      <div v-else class="events-grid">
        <div v-for="event in events" :key="event.id" class="event-card card">
          <div class="event-date-badge">
            <div class="event-month">{{ formatMonth(event.event_date) }}</div>
            <div class="event-day">{{ formatDay(event.event_date) }}</div>
          </div>

          <div class="event-content">
            <h2>{{ event.title }}</h2>
            <div class="event-details">
              <p class="event-datetime">
                📅 {{ formatFullDate(event.event_date) }}
                <span v-if="event.event_time"> at {{ formatTime(event.event_time) }}</span>
              </p>
              <p v-if="event.location" class="event-location">
                📍 {{ event.location }}
              </p>
            </div>
            <p v-if="event.description" class="event-description">{{ event.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api'

export default {
  name: 'EventsPage',
  data() {
    return {
      events: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.fetchEvents()
  },
  methods: {
    async fetchEvents() {
      try {
        this.loading = true
        const response = await axios.get(`${API_URL}/events`)
        this.events = response.data
      } catch (err) {
        this.error = 'Failed to load events'
        console.error('Error fetching events:', err)
      } finally {
        this.loading = false
      }
    },
    formatMonth(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    },
    formatDay(dateString) {
      const date = new Date(dateString)
      return date.getDate()
    },
    formatFullDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formatTime(timeString) {
      if (!timeString) return ''
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    }
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 3rem 0;
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
}

.page-header p {
  margin: 0;
  font-size: 1.125rem;
  opacity: 0.95;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray-500);
}

.events-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.event-card {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-date-badge {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.event-month {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.event-day {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.event-content {
  flex: 1;
}

.event-content h2 {
  margin: 0 0 1rem 0;
  color: var(--gray-900);
}

.event-details {
  margin-bottom: 1rem;
}

.event-datetime,
.event-location {
  color: var(--gray-700);
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.event-description {
  color: var(--gray-600);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.875rem;
  }

  .event-card {
    flex-direction: column;
    padding: 1.5rem;
  }

  .event-date-badge {
    width: 100%;
    flex-direction: row;
    gap: 0.5rem;
    padding: 1rem;
  }

  .event-month {
    font-size: 1rem;
  }

  .event-day {
    font-size: 1.5rem;
  }
}
</style>
