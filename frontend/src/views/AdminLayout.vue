<template>
  <div class="admin-layout">
    <nav v-if="isLoggedIn" class="admin-nav">
      <div class="container">
        <div class="logo">
          <img v-if="siteLogo" :src="siteLogo" alt="Logo" class="nav-logo">
          <h2>Church Admin</h2>
        </div>
        <div class="nav-links">
          <router-link to="/admin/dashboard">Dashboard</router-link>
          <router-link to="/admin/church-info">Church Info</router-link>
          <router-link to="/admin/news">News</router-link>
          <router-link to="/admin/events">Events</router-link>
          <router-link to="/admin/gallery">Gallery</router-link>
          <router-link to="/admin/members">Members</router-link>
          <router-link to="/admin/send-sms">Send SMS</router-link>
          <router-link to="/admin/kontingent">Kontingent</router-link>
          <button @click="logout" class="btn btn-danger btn-sm">Logout</button>
        </div>
      </div>
    </nav>

    <main class="container">
      <router-view @login="checkLogin" />
    </main>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'AdminLayout',
  data() {
    return {
      token: null,
      siteLogo: ''
    }
  },
  computed: {
    isLoggedIn() {
      return !!this.token || !!localStorage.getItem('admin_token')
    }
  },
  mounted() {
    this.checkLogin()
    this.fetchChurchInfo()
    window.addEventListener('storage', this.checkLogin)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkLogin)
  },
  methods: {
    async fetchChurchInfo() {
      try {
        const response = await axios.get(`${API_URL}/church`)
        this.siteLogo = response.data.logo_url || ''
      } catch (err) {
        console.error('Error fetching church info:', err)
      }
    },
    checkLogin() {
      this.token = localStorage.getItem('admin_token')
      this.$forceUpdate()
    },
    logout() {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      this.token = null
      this.$router.push('/')
    }
  },
  watch: {
    '$route'() {
      this.checkLogin()
    }
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: var(--gray-50);
}

nav {
  background: var(--gray-900);
  color: white;
  padding: 1rem 0;
}

nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-logo {
  height: 40px;
  width: 40px;
  object-fit: contain;
  background: white;
  padding: 0.25rem;
  border-radius: 50%;
}

.logo h2 {
  margin: 0;
  color: white;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: var(--gray-300);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: white;
}

main {
  padding: 2rem 0;
}

@media (max-width: 768px) {
  nav .container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
}
</style>
