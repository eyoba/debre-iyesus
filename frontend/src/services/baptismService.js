import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const baptismService = {
  // Get all baptism records
  async getBaptismRecords(filters = {}) {
    const params = new URLSearchParams()
    if (filters.active !== undefined) {
      params.append('active', filters.active)
    }

    const response = await axios.get(`${API_URL}/baptism-records?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    return response.data
  },

  // Get single baptism record
  async getBaptismRecord(id) {
    const response = await axios.get(`${API_URL}/baptism-records/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    return response.data
  },

  // Create new baptism record
  async createBaptismRecord(data) {
    const response = await axios.post(`${API_URL}/baptism-records`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    return response.data
  },

  // Update baptism record
  async updateBaptismRecord(id, data) {
    const response = await axios.put(`${API_URL}/baptism-records/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    return response.data
  },

  // Delete baptism record
  async deleteBaptismRecord(id) {
    const response = await axios.delete(`${API_URL}/baptism-records/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    return response.data
  }
}

export default baptismService
