import api from '../api/axios'
import { uploadService } from './uploadService'

async function uploadImages(uris) {
  if (!uris?.length) return []
  const res = await uploadService.uploadImages(uris)
  return res?.images || res?.data || []
}

export const reportService = {
  getMyDashboard: async () => {
    const { data } = await api.get('/reports/my-dashboard')
    return data
  },
  getMyReports: async (params = {}) => {
    const { data } = await api.get('/reports/my-reports', { params })
    return data
  },
  getReports: async (params = {}) => {
    const { data } = await api.get('/reports', { params })
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
  createReport: async (reportData, imageUris = []) => {
    const images = await uploadImages(imageUris)
    const { data } = await api.post('/reports', { ...reportData, images })
    return data
  },
  deleteReport: async (id) => {
    const { data } = await api.delete(`/reports/${id}`)
    return data
  },
  upvoteReport: async (id) => {
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
  getAdminReports: async (params = {}) => {
    const { data } = await api.get('/reports', { params })
    return data
  },
  getAssignedReports: async (params = {}) => {
    const { data } = await api.get('/reports/my-assigned', { params })
    return data
  },
  updateReportStatus: async (id, status) => {
    const { data } = await api.patch(`/reports/${id}/status`, { status })
    return data
  },
  assignWorker: async (id, workerId) => {
    const { data } = await api.patch(`/reports/${id}/assign`, { workerId })
    return data
  },
  updateReport: async (id, reportData, imageUris = []) => {
    const images = await uploadImages(imageUris)
    const { data } = await api.put(`/reports/${id}`, { ...reportData, images })
    return data
  },
}
