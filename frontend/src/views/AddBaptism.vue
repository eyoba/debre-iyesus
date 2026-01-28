<template>
  <div class="add-baptism">
    <div class="page-header">
      <h1>ሓድሽ መዝገብ ጥምቀት ምውሳኽ</h1>
      <router-link to="/admin/baptism" class="btn btn-secondary">ናብ ዝርዝር ተመለስ</router-link>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h3>ዋና ሓበሬታ</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="event_date">ዕለት *</label>
              <input
                type="date"
                id="event_date"
                v-model="formData.event_date"
                required
                :disabled="isSubmitting"
              />
            </div>

            <div class="form-group">
              <label for="child_baptism_name">ስም ክርስትና ሕጻን *</label>
              <input
                type="text"
                id="child_baptism_name"
                v-model="formData.child_baptism_name"
                required
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="child_call_name">መጸዉዒ ስም ሕጻን</label>
              <input
                type="text"
                id="child_call_name"
                v-model="formData.child_call_name"
                :disabled="isSubmitting"
              />
            </div>

            <div class="form-group">
              <label for="child_birth_date">ዕለተ ልደት ሕጻን</label>
              <input
                type="date"
                id="child_birth_date"
                v-model="formData.child_birth_date"
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="child_baptism_date">ዕለተ ጥምቀት ሕጻን</label>
            <input
              type="date"
              id="child_baptism_date"
              v-model="formData.child_baptism_date"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="form-section">
          <h3>ሓበሬታ ወለዲ</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="father_name">ስም ኣቦ ሕጻን</label>
              <input
                type="text"
                id="father_name"
                v-model="formData.father_name"
                :disabled="isSubmitting"
              />
            </div>

            <div class="form-group">
              <label for="mother_name">ስም ኣደ ሕጻን</label>
              <input
                type="text"
                id="mother_name"
                v-model="formData.mother_name"
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="parents_nationality">ዜግነት ወለዲ</label>
            <input
              type="text"
              id="parents_nationality"
              v-model="formData.parents_nationality"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="form-section">
          <h3>ሓበሬታ ጥምቀት</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="godparent_name">ስም ኣቦ ወይ ኣደ ጥምቀት</label>
              <input
                type="text"
                id="godparent_name"
                v-model="formData.godparent_name"
                :disabled="isSubmitting"
              />
            </div>

            <div class="form-group">
              <label for="priest_name">ስም ዘጠመቀ ካህን</label>
              <input
                type="text"
                id="priest_name"
                v-model="formData.priest_name"
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="baptism_church">ዝተጠምቀሉ/ትሉ ቤተክርስትያን</label>
            <input
              type="text"
              id="baptism_church"
              v-model="formData.baptism_church"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="form-section">
          <h3>ተወሳኺ ሓበሬታ</h3>

          <div class="form-group">
            <label for="notes">ምልከታ</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="4"
              :disabled="isSubmitting"
            ></textarea>
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <div class="form-actions">
          <router-link to="/admin/baptism" class="btn btn-secondary">ሰርዝ</router-link>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'ይዕቀብ...' : 'መዝገብ ኣዕቅብ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import baptismService from '../services/baptismService'

export default {
  name: 'AddBaptism',
  data() {
    return {
      formData: {
        event_date: '',
        child_baptism_name: '',
        child_call_name: '',
        father_name: '',
        mother_name: '',
        parents_nationality: '',
        child_birth_date: '',
        child_baptism_date: '',
        godparent_name: '',
        baptism_church: '',
        priest_name: '',
        notes: ''
      },
      isSubmitting: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    async handleSubmit() {
      this.isSubmitting = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        await baptismService.createBaptismRecord(this.formData)
        this.successMessage = 'መዝገብ ብዓወት ተወሲኹ!'

        setTimeout(() => {
          this.$router.push('/admin/baptism')
        }, 1500)
      } catch (error) {
        console.error('Error creating baptism record:', error)
        this.errorMessage = error.response?.data?.error || 'መዝገብ ክዕቀብ ኣይከኣለን። እንደገና ፈትን።'
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.add-baptism {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: var(--gray-900);
}

.form-container {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--gray-200);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--gray-800);
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.alert-error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .add-baptism {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .form-container {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
