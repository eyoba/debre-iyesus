<template>
  <div class="baptism-list">
    <div class="page-header">
      <h1>ናይ ክርስትና/ጥምቀት መዝገብ</h1>
      <div class="header-actions">
        <router-link to="/admin/dashboard" class="btn btn-secondary">ተመለስ</router-link>
        <router-link to="/admin/baptism/add" class="btn btn-primary">➕ ሓድሽ መዝገብ ምውሳኽ</router-link>
      </div>
    </div>

    <div class="search-filter">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="ብስም ሕጻን፣ ስም ወላዲ ወይ ካህን ምድላይ..."
        class="search-input"
      />
      <select v-model="activeFilter" @change="loadRecords" class="filter-select">
        <option value="">ኩሉ መዝገባት</option>
        <option value="true">ንጡፍ</option>
        <option value="false">ዘይንጡፍ</option>
      </select>
    </div>

    <div v-if="isLoading" class="loading">መዝገባት ይጽዕን ኣሎ...</div>

    <div v-else-if="errorMessage" class="alert alert-error">
      {{ errorMessage }}
    </div>

    <div v-else-if="filteredRecords.length === 0" class="no-data">
      ዝኾነ መዝገብ ኣይተረኽበን
    </div>

    <div v-else class="table-container">
      <table class="baptism-table">
        <thead>
          <tr>
            <th>ዕለት</th>
            <th>ስም ክርስትና ሕጻን</th>
            <th>መጸዉዒ ስም</th>
            <th>ስም ኣቦ</th>
            <th>ስም ኣደ</th>
            <th>ዜግነት</th>
            <th>ዕለተ ልደት</th>
            <th>ዕለተ ጥምቀት</th>
            <th>ስም ኣቦ/ኣደ ጥምቀት</th>
            <th>ቤተክርስትያን</th>
            <th>ስም ካህን</th>
            <th>ተግባራት</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td>{{ formatDate(record.event_date) }}</td>
            <td class="record-name">{{ record.child_baptism_name }}</td>
            <td>{{ record.child_call_name || '-' }}</td>
            <td>{{ record.father_name || '-' }}</td>
            <td>{{ record.mother_name || '-' }}</td>
            <td>{{ record.parents_nationality || '-' }}</td>
            <td>{{ formatDate(record.child_birth_date) }}</td>
            <td>{{ formatDate(record.child_baptism_date) }}</td>
            <td>{{ record.godparent_name || '-' }}</td>
            <td>{{ record.baptism_church || '-' }}</td>
            <td>{{ record.priest_name || '-' }}</td>
            <td class="actions">
              <router-link :to="`/admin/baptism/edit/${record.id}`" class="btn btn-sm btn-primary">
                ኣርትዕ
              </router-link>
              <button @click="confirmDelete(record)" class="btn btn-sm btn-danger">
                ደምስስ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3>ምድምሳስ ኣረጋግጽ</h3>
        <p>ነዚ መዝገብ ክትደምስሶ ትደሊ ዲኻ? <strong>{{ recordToDelete?.child_baptism_name }}</strong></p>
        <p class="warning-text">እዚ መዝገብ ከም ዘይንጡፍ ክምልከት እዩ።</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-secondary">ሰርዝ</button>
          <button @click="deleteRecord" class="btn btn-danger" :disabled="isDeleting">
            {{ isDeleting ? 'ይደምስስ...' : 'ደምስስ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baptismService from '../services/baptismService'

export default {
  name: 'BaptismList',
  data() {
    return {
      records: [],
      filteredRecords: [],
      searchQuery: '',
      activeFilter: '',
      isLoading: true,
      errorMessage: '',
      showDeleteModal: false,
      recordToDelete: null,
      isDeleting: false
    }
  },
  async mounted() {
    await this.loadRecords()
  },
  methods: {
    async loadRecords() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const filters = {}
        if (this.activeFilter) filters.active = this.activeFilter === 'true'

        this.records = await baptismService.getBaptismRecords(filters)

        // Sort by event date (descending)
        this.records.sort((a, b) => {
          const dateA = new Date(a.event_date)
          const dateB = new Date(b.event_date)
          return dateB - dateA
        })

        this.filteredRecords = this.records
      } catch (error) {
        console.error('Error loading baptism records:', error)
        this.errorMessage = 'መዝገባት ክጽዓን ኣይከኣለን። በይንኻ እንደገና ፈትን።'
      } finally {
        this.isLoading = false
      }
    },

    handleSearch() {
      const query = this.searchQuery.toLowerCase()
      this.filteredRecords = this.records.filter(record =>
        record.child_baptism_name?.toLowerCase().includes(query) ||
        record.child_call_name?.toLowerCase().includes(query) ||
        record.father_name?.toLowerCase().includes(query) ||
        record.mother_name?.toLowerCase().includes(query) ||
        record.godparent_name?.toLowerCase().includes(query) ||
        record.priest_name?.toLowerCase().includes(query)
      )
    },

    confirmDelete(record) {
      this.recordToDelete = record
      this.showDeleteModal = true
    },

    async deleteRecord() {
      if (!this.recordToDelete) return

      this.isDeleting = true
      try {
        await baptismService.deleteBaptismRecord(this.recordToDelete.id)
        await this.loadRecords()
        this.showDeleteModal = false
        this.recordToDelete = null
      } catch (error) {
        console.error('Error deleting record:', error)
        this.errorMessage = 'መዝገብ ክድምሰስ ኣይከኣለን። እንደገና ፈትን።'
      } finally {
        this.isDeleting = false
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('en-GB')
    }
  }
}
</script>

<style scoped>
.baptism-list {
  padding: 2rem;
  max-width: 1600px;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.search-filter {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
  min-width: 200px;
}

.loading,
.no-data {
  text-align: center;
  padding: 3rem;
  color: var(--gray-600);
}

.table-container {
  overflow-x: auto;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
}

.baptism-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.baptism-table th {
  background: var(--gray-50);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 2px solid var(--gray-200);
  white-space: nowrap;
}

.baptism-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--gray-100);
}

.record-name {
  font-weight: 500;
  color: var(--gray-900);
}

.actions {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.alert-error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  margin-top: 0;
  color: var(--gray-900);
}

.warning-text {
  color: var(--gray-600);
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .baptism-list {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .search-filter {
    flex-direction: column;
  }

  .filter-select {
    min-width: auto;
  }

  .baptism-table {
    font-size: 0.75rem;
  }

  .baptism-table th,
  .baptism-table td {
    padding: 0.5rem;
  }
}
</style>
