<template>
  <div class="members-list">
    <div class="page-header">
      <h1>Medlemsliste</h1>
      <div class="header-actions">
        <router-link to="/admin/dashboard" class="btn btn-secondary">Tilbake</router-link>
        <router-link to="/admin/members/add" class="btn btn-primary">➕ Legg til medlem</router-link>
      </div>
    </div>

    <div class="search-filter">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="Søk etter navn, telefon, medlemsnummer eller personnummer..."
        class="search-input"
      />
      <select v-model="activeFilter" @change="loadMembers" class="filter-select">
        <option value="">Alle medlemmer</option>
        <option value="true">Kun aktive</option>
        <option value="false">Kun inaktive</option>
      </select>
    </div>

    <div v-if="isLoading" class="loading">Laster medlemmer...</div>

    <div v-else-if="errorMessage" class="alert alert-error">
      {{ errorMessage }}
    </div>

    <div v-else-if="filteredMembers.length === 0" class="no-data">
      Ingen medlemmer funnet
    </div>

    <div v-else class="table-container">
      <table class="members-table">
        <thead>
          <tr>
            <th>Navn</th>
            <th>ስም ክርስትና</th>
            <th>ስም ኣቦ ንስሓ</th>
            <th>Telefon</th>
            <th>
              Personnummer
              <label class="checkbox-inline">
                <input
                  type="checkbox"
                  v-model="showPersonnummer"
                />
              </label>
            </th>
            <th>Adresse</th>
            <th>Medlemskortnr.</th>
            <th>Kortutstedelsesdato</th>
            <th>SMS</th>
            <th>Status</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredMembers" :key="member.id">
            <td class="member-name">{{ member.full_name }}</td>
            <td>{{ member.baptism_name || '-' }}</td>
            <td>{{ member.godparent_name || '-' }}</td>
            <td>{{ member.phone_number }}</td>
            <td class="personnummer">
              {{ showPersonnummer ? formatPersonnummer(member.personnummer) : 'xxxxx-xxxxx' }}
            </td>
            <td>{{ formatAddress(member) }}</td>
            <td class="member-number">{{ member.card_number || '-' }}</td>
            <td>{{ formatDate(member.card_issue_date) }}</td>
            <td>
              <span :class="['badge', member.sms_consent ? 'badge-success' : 'badge-warning']">
                {{ member.sms_consent ? 'Ja' : 'Nei' }}
              </span>
            </td>
            <td>
              <span :class="['badge', member.is_active ? 'badge-success' : 'badge-danger']">
                {{ member.is_active ? 'Aktiv' : 'Inaktiv' }}
              </span>
            </td>
            <td class="actions">
              <router-link :to="`/admin/members/edit/${member.id}`" class="btn btn-sm btn-primary">
                Rediger
              </router-link>
              <button v-if="member.is_active" @click="confirmDeactivate(member)" class="btn btn-sm btn-warning">
                Inaktiv
              </button>
              <button v-else @click="confirmPermanentDelete(member)" class="btn btn-sm btn-danger">
                Slett permanent
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Deactivate Confirmation Modal -->
    <div v-if="showDeactivateModal" class="modal-overlay" @click="showDeactivateModal = false">
      <div class="modal-content" @click.stop>
        <h3>Bekreft inaktivering</h3>
        <p>Er du sikker på at du vil markere <strong>{{ memberToDeactivate?.full_name }}</strong> som inaktiv?</p>
        <p class="warning-text">Medlemmet vil bli skjult fra aktive medlemmer, men dataene beholdes i databasen.</p>
        <div class="modal-actions">
          <button @click="showDeactivateModal = false" class="btn btn-secondary">Avbryt</button>
          <button @click="deactivateMember" class="btn btn-warning" :disabled="isDeleting">
            {{ isDeleting ? 'Inaktiverer...' : 'Marker som inaktiv' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Permanent Delete Confirmation Modal -->
    <div v-if="showPermanentDeleteModal" class="modal-overlay" @click="showPermanentDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3>⚠️ Bekreft permanent sletting</h3>
        <p>Er du sikker på at du vil <strong>permanent slette</strong> <strong>{{ memberToPermanentDelete?.full_name }}</strong>?</p>
        <p class="warning-text-danger">⚠️ ADVARSEL: Dette vil permanent slette medlemmet fra databasen. Denne handlingen kan IKKE angres!</p>
        <div class="modal-actions">
          <button @click="showPermanentDeleteModal = false" class="btn btn-secondary">Avbryt</button>
          <button @click="permanentDeleteMember" class="btn btn-danger" :disabled="isDeleting">
            {{ isDeleting ? 'Sletter permanent...' : 'Slett permanent' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import membersService from '../services/membersService'

export default {
  name: 'MembersList',
  data() {
    return {
      members: [],
      filteredMembers: [],
      searchQuery: '',
      activeFilter: '',
      isLoading: true,
      errorMessage: '',
      showDeactivateModal: false,
      showPermanentDeleteModal: false,
      memberToDeactivate: null,
      memberToPermanentDelete: null,
      isDeleting: false,
      showPersonnummer: false
    }
  },
  async mounted() {
    await this.loadMembers()
  },
  methods: {
    async loadMembers() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const filters = {}
        if (this.activeFilter) filters.active = this.activeFilter === 'true'

        this.members = await membersService.getMembers(filters)

        // Sort alphabetically by name (ascending)
        this.members.sort((a, b) => {
          const nameA = (a.full_name || '').toLowerCase()
          const nameB = (b.full_name || '').toLowerCase()
          return nameA.localeCompare(nameB, 'nb-NO')
        })

        this.filteredMembers = this.members
      } catch (error) {
        console.error('Error loading members:', error)
        this.errorMessage = 'Kunne ikke laste medlemmer. Prøv igjen senere.'
      } finally {
        this.isLoading = false
      }
    },

    handleSearch() {
      const query = this.searchQuery.toLowerCase()
      this.filteredMembers = this.members.filter(member =>
        member.full_name.toLowerCase().includes(query) ||
        member.phone_number.includes(query) ||
        member.personnummer?.includes(query) ||
        member.card_number?.toLowerCase().includes(query)
      )
    },

    confirmDeactivate(member) {
      this.memberToDeactivate = member
      this.showDeactivateModal = true
    },

    confirmPermanentDelete(member) {
      this.memberToPermanentDelete = member
      this.showPermanentDeleteModal = true
    },

    async deactivateMember() {
      if (!this.memberToDeactivate) return

      this.isDeleting = true
      try {
        await membersService.deleteMember(this.memberToDeactivate.id)
        await this.loadMembers()
        this.showDeactivateModal = false
        this.memberToDeactivate = null
      } catch (error) {
        console.error('Error deactivating member:', error)
        this.errorMessage = 'Kunne ikke inaktivere medlem. Prøv igjen.'
      } finally {
        this.isDeleting = false
      }
    },

    async permanentDeleteMember() {
      if (!this.memberToPermanentDelete) return

      this.isDeleting = true
      try {
        await membersService.permanentDeleteMember(this.memberToPermanentDelete.id)
        await this.loadMembers()
        this.showPermanentDeleteModal = false
        this.memberToPermanentDelete = null
      } catch (error) {
        console.error('Error permanently deleting member:', error)
        this.errorMessage = 'Kunne ikke slette medlem permanent. Prøv igjen.'
      } finally {
        this.isDeleting = false
      }
    },

    formatPersonnummer(pnr) {
      if (!pnr) return 'N/A'
      return pnr.replace(/(\d{6})(\d{5})/, '$1-$2')
    },

    formatAddress(member) {
      if (!member.address) return 'N/A'
      const parts = [member.address]
      if (member.postal_code) parts.push(member.postal_code)
      if (member.city) parts.push(member.city)
      return parts.join(', ')
    },

    formatDate(dateStr) {
      if (!dateStr) return 'N/A'
      return new Date(dateStr).toLocaleDateString('nb-NO')
    }
  }
}
</script>

<style scoped>
.members-list {
  padding: 2rem;
  max-width: 1400px;
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

.checkbox-inline {
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  cursor: pointer;
}

.checkbox-inline input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin: 0;
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

.members-table {
  width: 100%;
  border-collapse: collapse;
}

.members-table th {
  background: var(--gray-50);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 2px solid var(--gray-200);
}

.members-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
}

.member-name {
  font-weight: 500;
  color: var(--gray-900);
}

.personnummer {
  font-family: monospace;
  font-size: 0.9rem;
}

.member-number {
  font-weight: 600;
  color: var(--primary-color);
  font-family: monospace;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 0.5rem;
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

.warning-text-danger {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.95rem;
  background: #fee;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #dc2626;
}

.btn-warning {
  background-color: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background-color: #d97706;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .members-list {
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

  .members-table {
    font-size: 0.85rem;
  }

  .members-table th,
  .members-table td {
    padding: 0.5rem;
  }
}
</style>
