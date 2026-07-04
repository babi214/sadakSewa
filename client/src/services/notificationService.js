import api from '../api/axios'

export const notificationService = {
  getNotifications: async (params = {}) => {
    const { data } = await api.get('/notifications', { params })
    return data
  },

  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count')
    return data
  },

  markAsRead: async (id) => {
    const { data } = await api.patch(`/notifications/${id}/read`)
    return data
  },

  markAllAsRead: async () => {
    const { data } = await api.patch('/notifications/read-all')
    return data
  },

  deleteNotification: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`)
    return data
  },

  deleteAllNotifications: async () => {
    const { data } = await api.delete('/notifications/all')
    return data
  },
}
