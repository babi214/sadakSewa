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
  verifyEmail: async ({ email, code }) => {
    const { data } = await api.patch('/auth/verify-email', { email, code })
    return data
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout')
    return data
  },
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },
  resetPassword: async ({ email, code, password }) => {
    const { data } = await api.patch('/auth/reset-password', { email, code, password })
    return data
  },
  changePassword: async ({ currentPassword, newPassword }) => {
    const { data } = await api.patch('/auth/change-password', { currentPassword, newPassword })
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
  updateProfilePicture: async (fileUri) => {
    const formData = new FormData()
    formData.append('profilePicture', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    })
    const { data } = await api.patch('/auth/profile/picture', formData)
    return data
  },
}
