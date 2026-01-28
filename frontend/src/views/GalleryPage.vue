<template>
  <div class="gallery-page">
    <div class="page-header">
      <div class="container">
        <h1>📷 Photo Gallery</h1>
        <p>Memories and moments from our church community</p>
      </div>
    </div>

    <div class="container">
      <div v-if="loading" class="spinner"></div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-else-if="photos.length === 0" class="empty-state">
        <p>No photos available at the moment.</p>
      </div>

      <div v-else class="gallery-grid">
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
  name: 'GalleryPage',
  data() {
    return {
      photos: [],
      selectedPhoto: null,
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.fetchPhotos()
  },
  methods: {
    async fetchPhotos() {
      try {
        this.loading = true
        const response = await axios.get(`${API_URL}/photos`)
        this.photos = response.data
      } catch (err) {
        this.error = 'Failed to load photos'
        console.error('Error fetching photos:', err)
      } finally {
        this.loading = false
      }
    },
    openLightbox(photo) {
      this.selectedPhoto = photo
      document.body.style.overflow = 'hidden'
    },
    closeLightbox() {
      this.selectedPhoto = null
      document.body.style.overflow = ''
    }
  },
  beforeUnmount() {
    document.body.style.overflow = ''
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

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.875rem;
  }

  .gallery-grid {
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
