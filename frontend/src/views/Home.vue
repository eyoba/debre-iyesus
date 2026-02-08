<template>
  <div class="home">
    <!-- Hero Section -->
    <div class="hero" :style="{ background: `linear-gradient(135deg, ${churchInfo.background_color || '#3b82f6'}, ${getSecondaryColor(churchInfo.background_color || '#3b82f6')})` }">
      <div class="container">
        <div class="hero-content">
          <div class="hero-logo">
            <img v-if="churchInfo.logo_url" :src="churchInfo.logo_url" alt="Church Logo" class="site-logo" loading="eager">
            <div v-else class="site-logo-placeholder">⛪</div>
          </div>
          <div class="hero-text">
            <h1>{{ churchInfo.name || 'Debre Iyesus Church' }}</h1>
            <p class="lead">{{ churchInfo.description || 'Welcome to our church' }}</p>

            <!-- Church Information -->
            <div v-if="hasChurchInfo()" class="church-info-grid">
              <div v-if="churchInfo.pastor_name">
                <strong>{{ churchInfo.field_label_pastor || 'Pastor' }}:</strong> {{ churchInfo.pastor_name }}
              </div>
              <div v-if="churchInfo.address">
                <strong>{{ churchInfo.field_label_address || 'Address' }}:</strong> {{ churchInfo.address }}
              </div>
              <div v-if="churchInfo.phone">
                <strong>{{ churchInfo.field_label_phone || 'Phone' }}:</strong> {{ churchInfo.phone }}
              </div>
              <div v-if="churchInfo.email">
                <strong>{{ churchInfo.field_label_email || 'Email' }}:</strong> {{ churchInfo.email }}
              </div>
              <div v-if="churchInfo.website">
                <strong>{{ churchInfo.field_label_website || 'Website' }}:</strong> <a :href="churchInfo.website" target="_blank">{{ churchInfo.website }}</a>
              </div>
              <div v-if="churchInfo.facebook">
                <strong>{{ churchInfo.field_label_facebook || 'Facebook' }}:</strong> <a :href="churchInfo.facebook" target="_blank">Visit Page</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- About Section (Always Visible) -->
      <div class="section about-section">
        <div v-if="churchInfo.about_content" class="about-content card">
          <div class="about-text" v-html="formatAboutContent(churchInfo.about_content)"></div>
        </div>
        <div v-else class="empty-state">
          <p>No about information available. Please add content in the admin panel.</p>
        </div>

        <!-- Service Times -->
        <div v-if="hasServiceTimes()" class="service-times">
          <h2>Service Times</h2>
          <div class="times-grid">
            <div v-if="churchInfo.sunday_service_time" class="time-item">
              <strong>Sunday Service:</strong> {{ churchInfo.sunday_service_time }}
            </div>
            <div v-if="churchInfo.wednesday_service_time" class="time-item">
              <strong>Wednesday Service:</strong> {{ churchInfo.wednesday_service_time }}
            </div>
            <div v-if="churchInfo.other_service_times" class="time-item full-width">
              <strong>Other Services:</strong> {{ churchInfo.other_service_times }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="quick-nav">
        <button
          @click="activeSection = 'news'"
          :class="['quick-nav-item', { active: activeSection === 'news' }]"
        >
          News
        </button>
        <button
          @click="activeSection = 'events'"
          :class="['quick-nav-item', { active: activeSection === 'events' }]"
        >
          Events
        </button>
        <button
          @click="activeSection = 'gallery'"
          :class="['quick-nav-item', { active: activeSection === 'gallery' }]"
        >
          Gallery
        </button>
      </div>

      <!-- News Section -->
      <div v-if="activeSection === 'news' && news.length > 0" class="section">
        <h2>📰 News & Announcements</h2>
        <div class="news-list">
          <article v-for="article in news" :key="article.id" class="news-article card">
            <div class="news-header">
              <h3>{{ article.title }}</h3>
              <p class="news-meta">
                <span class="news-date">📅 {{ formatDate(article.published_date) }}</span>
              </p>
            </div>
            <div class="news-content">
              {{ article.content }}
            </div>
          </article>
        </div>
      </div>

      <!-- Events Section -->
      <div v-if="activeSection === 'events' && events.length > 0" class="section">
        <h2>📅 Upcoming Events</h2>
        <div class="events-list">
          <div v-for="event in events" :key="event.id" class="event-card-full card">
            <div class="event-date-badge">
              <div class="event-month">{{ formatMonth(event.event_date) }}</div>
              <div class="event-day">{{ formatDay(event.event_date) }}</div>
            </div>
            <div class="event-content">
              <h3>{{ event.title }}</h3>
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

      <!-- Gallery Section -->
      <div v-if="activeSection === 'gallery' && photos.length > 0" class="section">
        <h2>📷 Photo Gallery</h2>
        <div class="gallery-grid-full">
          <div
            v-for="photo in photos"
            :key="photo.id"
            class="gallery-item"
            @click="openLightbox(photo)"
          >
            <img :src="photo.image_url" :alt="photo.title || 'Church photo'" loading="lazy">
            <div class="gallery-overlay">
              <p v-if="photo.title">{{ photo.title }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="activeSection === 'news' && news.length === 0" class="empty-state">
        <p>No news articles available at the moment.</p>
      </div>
      <div v-if="activeSection === 'events' && events.length === 0" class="empty-state">
        <p>No upcoming events scheduled at the moment.</p>
      </div>
      <div v-if="activeSection === 'gallery' && photos.length === 0" class="empty-state">
        <p>No photos available at the moment.</p>
      </div>

      <!-- Lightbox -->
      <div v-if="selectedPhoto" class="lightbox" @click="closeLightbox">
        <div class="lightbox-content" @click.stop>
          <button class="lightbox-close" @click="closeLightbox">&times;</button>
          <img :src="selectedPhoto.image_url" :alt="selectedPhoto.title || 'Church photo'">
          <div v-if="selectedPhoto.title || selectedPhoto.description" class="lightbox-info">
            <h3 v-if="selectedPhoto.title">{{ selectedPhoto.title }}</h3>
            <p v-if="selectedPhoto.description">{{ selectedPhoto.description }}</p>
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
  name: 'Home',
  data() {
    return {
      churchInfo: {},
      news: [],
      events: [],
      photos: [],
      activeSection: 'news',
      selectedPhoto: null,
      loading: true,
      error: null
    }
  },
  async mounted() {
    // Default to News section when component mounts
    this.activeSection = 'news'
    await Promise.all([
      this.fetchChurchInfo(),
      this.fetchNews(),
      this.fetchEvents(),
      this.fetchPhotos()
    ])
    this.loading = false
  },
  watch: {
    '$route'() {
      // Reset to News section when navigating to Home
      this.activeSection = 'news'
    }
  },
  methods: {
    async fetchChurchInfo() {
      try {
        const response = await axios.get(`${API_URL}/church`)
        this.churchInfo = response.data
      } catch (err) {
        console.error('Error fetching church info:', err)
      }
    },
    async fetchNews() {
      try {
        const response = await axios.get(`${API_URL}/news`)
        this.news = response.data
      } catch (err) {
        console.error('Error fetching news:', err)
      }
    },
    async fetchEvents() {
      try {
        const response = await axios.get(`${API_URL}/events`)
        this.events = response.data
      } catch (err) {
        console.error('Error fetching events:', err)
      }
    },
    async fetchPhotos() {
      try {
        const response = await axios.get(`${API_URL}/photos`)
        this.photos = response.data
      } catch (err) {
        console.error('Error fetching photos:', err)
      }
    },
    hasChurchInfo() {
      return this.churchInfo.pastor_name || this.churchInfo.address ||
             this.churchInfo.phone || this.churchInfo.email || this.churchInfo.website
    },
    hasServiceTimes() {
      return this.churchInfo.sunday_service_time ||
             this.churchInfo.wednesday_service_time ||
             this.churchInfo.other_service_times
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
    },
    formatAboutContent(content) {
      if (!content) return ''
      // Convert line breaks to <br> tags and preserve formatting
      return content.replace(/\n/g, '<br>')
    },
    openLightbox(photo) {
      this.selectedPhoto = photo
      document.body.style.overflow = 'hidden'
    },
    closeLightbox() {
      this.selectedPhoto = null
      document.body.style.overflow = ''
    },
    getSecondaryColor(hexColor) {
      if (!hexColor || !hexColor.startsWith('#')) return 'rgb(29, 78, 216)'
      const r = parseInt(hexColor.slice(1, 3), 16)
      const g = parseInt(hexColor.slice(3, 5), 16)
      const b = parseInt(hexColor.slice(5, 7), 16)
      const darken = (val) => Math.max(0, Math.floor(val * 0.7))
      return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`
    }
  },
  beforeUnmount() {
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
}

.view-all-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.view-all-link:hover {
  opacity: 0.8;
}

.hero {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 2rem 0;
  margin-bottom: 0;
}

.quick-nav {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.quick-nav .container {
  display: flex;
  justify-content: flex-start;
  gap: 0;
}

.quick-nav-item {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  font-weight: 500;
}

.quick-nav-item:hover {
  color: var(--primary-color);
  background: var(--gray-50);
  border-bottom-color: var(--primary-color);
}

.quick-nav-item.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
  background: var(--gray-50);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
}

.hero-logo {
  flex-shrink: 0;
}

.hero-text {
  flex: 1;
  text-align: left;
}

.hero h2 {
  font-size: 1.5rem;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  line-height: 1.3;
}

.lead {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 1rem 0;
}

.church-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem 1rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: white;
}

.church-info-grid div {
  line-height: 1.6;
}

.church-info-grid strong {
  opacity: 0.9;
}

.church-info-grid a {
  color: white;
  text-decoration: underline;
  opacity: 0.95;
}

.church-info-grid a:hover {
  opacity: 1;
}

.site-logo {
  width: 200px;
  height: 200px;
  object-fit: contain;
  background: white;
  padding: 1rem;
  border-radius: 50%;
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  border: 5px solid rgba(255, 255, 255, 0.95);
  transition: transform 0.3s ease;
}

.site-logo:hover {
  transform: scale(1.05);
}

.site-logo-placeholder {
  font-size: 6rem;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  border: 5px solid rgba(255, 255, 255, 0.95);
}

@media (max-width: 992px) {
  .church-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 1.5rem 0;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-text {
    text-align: center;
  }

  .hero h2 {
    font-size: 1.25rem;
  }

  .quick-nav .container {
    gap: 0;
    justify-content: flex-start;
  }

  .quick-nav-item {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .site-logo,
  .site-logo-placeholder {
    width: 160px;
    height: 160px;
    font-size: 5rem;
  }

  .lead {
    font-size: 0.875rem;
  }

  .church-info-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: left;
    font-size: 0.8rem;
  }
}

.church-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.church-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.church-card h3 {
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
}

.church-logo {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  background: #f8f9fa;
}

.church-icon {
  font-size: 3.5rem;
  text-align: center;
  margin-bottom: 0.75rem;
}

.church-description {
  color: var(--gray-600);
  min-height: 2.5rem;
  font-size: 0.875rem;
}

.church-info {
  margin: 0.75rem 0;
  font-size: 0.8rem;
}

.info-item {
  margin-bottom: 0.4rem;
  color: var(--gray-700);
}

.field-labels-info {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-left: 4px solid var(--primary-color);
}

.field-labels-info h3 {
  margin: 0 0 1rem 0;
  color: var(--gray-800);
  font-size: 1.25rem;
}

.field-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: var(--gray-700);
  font-size: 0.95rem;
}

.field-info-item strong {
  color: var(--gray-800);
  min-width: 100px;
  flex-shrink: 0;
}

.field-info-item span {
  flex: 1;
}

.field-info-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.field-info-item a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .field-info-grid {
    grid-template-columns: 1fr;
  }

  .field-info-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .field-info-item strong {
    min-width: auto;
  }
}

/* About Section */
.about-content {
  margin: 2rem 0;
  padding: 2rem;
}

.about-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--gray-700);
  white-space: pre-wrap;
}

.about-text p {
  margin-bottom: 1rem;
}

/* Geez Calendar Section */
.calendar-section {
  margin: 2rem 0;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.widget-title {
  text-align: center;
  font-size: 1.5rem;
  color: var(--gray-900);
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

#geez-calendar-container {
  min-height: 400px;
}

@media (max-width: 768px) {
  .calendar-section {
    padding: 1rem;
    margin: 1rem 0;
  }

  .widget-title {
    font-size: 1.25rem;
  }

  #geez-calendar-container {
    min-height: 300px;
    overflow-x: auto;
  }
}

/* PWA Install Banner */
.pwa-install-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pwa-install-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.pwa-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.pwa-content {
  flex: 1;
}

.pwa-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.pwa-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.875rem;
}

.btn-install-pwa {
  background: white;
  color: #667eea;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-install-pwa:hover {
  background: #f8f9fa;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .pwa-install-banner {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem;
    gap: 0.75rem;
  }

  .pwa-icon {
    font-size: 2.5rem;
  }

  .pwa-content h4 {
    font-size: 1.125rem;
  }

  .pwa-content p {
    font-size: 0.8125rem;
  }

  .btn-install-pwa {
    width: 100%;
    padding: 0.875rem 1rem;
  }
}

/* Calendar PDF Link */
.calendar-pdf-link {
  text-align: center;
  margin: 1rem 0 0 0;
  padding: 0 1rem;
}

.calendar-pdf-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.calendar-pdf-link a:hover {
  color: var(--gray-900);
  text-decoration: underline;
}

/* Churches Section Header */
.churches-header {
  text-align: center;
  margin: 3rem 0 2rem 0;
  padding: 0 1rem;
}

.churches-header h2 {
  font-size: 1.75rem;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  line-height: 1.4;
}

.churches-subtitle {
  font-size: 1.125rem;
  color: var(--gray-600);
  margin: 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .churches-header {
    margin: 2rem 0 1.5rem 0;
  }

  .churches-header h2 {
    font-size: 1.25rem;
  }

  .churches-subtitle {
    font-size: 1rem;
  }
}

/* News List */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.news-article {
  padding: 2rem;
}

.news-header h3 {
  margin: 0 0 1rem 0;
  color: var(--gray-900);
}

.news-meta {
  display: flex;
  gap: 2rem;
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-200);
}

.news-content {
  color: var(--gray-700);
  line-height: 1.8;
  white-space: pre-wrap;
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.event-card-full {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card-full:hover {
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

.event-content h3 {
  margin: 0 0 1rem 0;
  color: var(--gray-900);
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
  margin: 1rem 0 0 0;
  white-space: pre-wrap;
}

/* Gallery Grid Full */
.gallery-grid-full {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.gallery-item {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.gallery-item:hover {
  transform: scale(1.02);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-overlay p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-close {
  position: absolute;
  top: -3rem;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 3rem;
  cursor: pointer;
  padding: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.lightbox-close:hover {
  opacity: 0.7;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 0.5rem;
}

.lightbox-info {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  max-width: 600px;
  text-align: center;
}

.lightbox-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
}

.lightbox-info p {
  margin: 0;
  color: var(--gray-600);
  line-height: 1.6;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray-500);
}

@media (max-width: 768px) {
  .event-card-full {
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

  .gallery-grid-full {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .lightbox {
    padding: 1rem;
  }

  .lightbox-content img {
    max-height: 60vh;
  }

  .lightbox-close {
    top: -2.5rem;
    font-size: 2rem;
  }
}
</style>
