import api from '../api/axios'

export const aiService = {
  analyzeImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const { data } = await api.post('/ai/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  createAiReport: async (reportData) => {
    const { data } = await api.post('/ai/report', reportData)
    return data
  },
}
