import api from '../api/axios'

export const userService = {
  getUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params })
    return data
  },
  getAllUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params })
    return data
  },
  getWorkers: async (params = {}) => {
    const { data } = await api.get('/users', { ...params, role: 'worker' })
    return data
  },
  updateUser: async (id, userData) => {
    const { data } = await api.patch(`/users/${id}`, userData)
    return data
  },
  updateUserRole: async (id, role) => {
    const { data } = await api.patch(`/users/${id}`, { role })
    return data
  },
  toggleUserActive: async (id) => {
    const { data } = await api.patch(`/users/${id}/toggle-active`)
    return data
  },
}
