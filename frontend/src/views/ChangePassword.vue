<template>
  <div class="change-password">
    <div class="container-small">
      <div class="card">
        <h1>Change Password</h1>
        <p class="subtitle">Update your admin account password</p>

        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>

        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label for="currentPassword">Current Password *</label>
            <input
              id="currentPassword"
              v-model="form.currentPassword"
              type="password"
              placeholder="Enter your current password"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">New Password *</label>
            <input
              id="newPassword"
              v-model="form.newPassword"
              type="password"
              placeholder="Enter your new password"
              required
              :disabled="loading"
              minlength="6"
            />
            <small class="form-help">Password must be at least 6 characters long</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password *</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="goBack"
              class="btn btn-secondary"
              :disabled="loading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading"
            >
              <span v-if="loading">Changing Password...</span>
              <span v-else>Change Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'ChangePassword',
  data() {
    return {
      form: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      loading: false,
      error: null,
      success: null
    }
  },
  methods: {
    async handleChangePassword() {
      this.error = null
      this.success = null

      // Validation
      if (this.form.newPassword.length < 6) {
        this.error = 'New password must be at least 6 characters long'
        return
      }

      if (this.form.newPassword !== this.form.confirmPassword) {
        this.error = 'New password and confirmation do not match'
        return
      }

      if (this.form.currentPassword === this.form.newPassword) {
        this.error = 'New password must be different from current password'
        return
      }

      try {
        this.loading = true

        const token = localStorage.getItem('admin_token')
        const response = await axios.post(
          `${API_URL}/auth/change-password`,
          {
            currentPassword: this.form.currentPassword,
            newPassword: this.form.newPassword
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        this.success = 'Password changed successfully!'

        // Clear form
        this.form = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.$router.push('/admin/dashboard')
        }, 2000)
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to change password. Please try again.'
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push('/admin/dashboard')
    }
  }
}
</script>

<style scoped>
.change-password {
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}

.container-small {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
  font-size: 1.75rem;
}

.subtitle {
  margin: 0 0 2rem 0;
  color: var(--gray-600);
  font-size: 1rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.alert-error {
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert-success {
  background-color: #efe;
  color: #3a3;
  border: 1px solid #cfc;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--gray-700);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: var(--gray-600);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--gray-700);
}

@media (max-width: 768px) {
  .change-password {
    padding: 1rem 0;
  }

  .card {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
