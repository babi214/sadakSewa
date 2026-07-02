import api from '../api/axios'

export const authService = {
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData)
    return data
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    return data
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout')
    return data
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/profile')
    return data
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData)
    return data
  },

  updateProfilePicture: async (file) => {
    const formData = new FormData()
    formData.append('profilePicture', file)

    const { data } = await api.patch('/auth/profile/picture', formData)
    return data
  },
}
