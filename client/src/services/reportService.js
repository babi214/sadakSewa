import api from '../api/axios'

export const reportService = {
  getMyDashboard: async () => {
    const { data } = await api.get('/reports/my-dashboard')
    return data
  },

  getMyReports: async () => {
    const { data } = await api.get('/reports/my-reports')
    return data
  },

  getAllReports: async (params = {}) => {
    const { data } = await api.get('/reports', { params })
    return data
  },

  getReportById: async (id) => {
    const { data } = await api.get(`/reports/${id}`)
    return data
  },

  createReport: async (reportData) => {
    const { data } = await api.post('/reports', reportData)
    return data
  },

  deleteReport: async (id) => {
    const { data } = await api.delete(`/reports/${id}`)
    return data
  },

  toggleUpvote: async (id) => {
    const { data } = await api.patch(`/reports/${id}/upvote`)
    return data
  },

  getReportHistory: async (id) => {
    const { data } = await api.get(`/reports/${id}/history`)
    return data
  },

  getNearbyReports: async (params) => {
    const { data } = await api.get('/reports/nearby', { params })
    return data
  },

  getWorkerDashboard: async () => {
    const { data } = await api.get('/reports/worker-dashboard')
    return data
  },

  getAdminDashboard: async () => {
    const { data } = await api.get('/reports/admin-dashboard')
    return data
  },

  getAssignedReports: async () => {
    const { data } = await api.get('/reports/my-assigned')
    return data
  },

  updateReportStatus: async (id, status, rejectionReason) => {
    const { data } = await api.patch(`/reports/${id}/status`, { status, rejectionReason })
    return data
  },

  getAvailableWorkers: async (id) => {
    const { data } = await api.get(`/reports/${id}/available-workers`)
    return data
  },

  assignWorker: async (id, workerId) => {
    const { data } = await api.patch(`/reports/${id}/assign`, { workerId })
    return data
  },

  unassignWorker: async (id) => {
    const { data } = await api.patch(`/reports/${id}/unassign`)
    return data
  },

  updateReport: async (id, reportData) => {
    const { data } = await api.put(`/reports/${id}`, reportData)
    return data
  },

  getFlaggedReports: async () => {
    const { data } = await api.get('/reports/flagged')
    return data
  },

  clearFlag: async (id) => {
    const { data } = await api.patch(`/reports/${id}/clear-flag`)
    return data
  },

  flagReport: async (id, reason, customReason) => {
    const { data } = await api.post(`/reports/${id}/flag`, { reason, customReason })
    return data
  },
}
