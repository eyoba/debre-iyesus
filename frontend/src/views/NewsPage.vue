<template>
  <div class="news-page">
    <div class="page-header">
      <div class="container">
        <h1>📰 News & Announcements</h1>
        <p>Stay updated with the latest news from our church</p>
      </div>
    </div>

    <div class="container">
      <div v-if="loading" class="spinner"></div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-else-if="news.length === 0" class="empty-state">
        <p>No news articles available at the moment.</p>
      </div>

      <div v-else class="news-list">
        <article v-for="article in news" :key="article.id" class="news-article card">
          <div class="news-header">
            <h2>{{ article.title }}</h2>
            <p class="news-meta">
              <span class="news-date">📅 {{ formatDate(article.published_date) }}</span>
              <span v-if="article.author_name" class="news-author">✍️ {{ article.author_name }}</span>
            </p>
          </div>
          <div class="news-content">
            {{ article.content }}
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api'

export default {
  name: 'NewsPage',
  data() {
    return {
      news: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.fetchNews()
  },
  methods: {
    async fetchNews() {
      try {
        this.loading = true
        const response = await axios.get(`${API_URL}/news`)
        this.news = response.data
      } catch (err) {
        this.error = 'Failed to load news articles'
        console.error('Error fetching news:', err)
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
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

.news-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.news-article {
  padding: 2rem;
}

.news-header h2 {
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

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.875rem;
  }

  .news-article {
    padding: 1.5rem;
  }

  .news-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
