import api from '../api/axios'

export const userService = {
  getUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params })
    return data
  },

  updateUser: async (id, userData) => {
    const { data } = await api.patch(`/users/${id}`, userData)
    return data
  },
}
