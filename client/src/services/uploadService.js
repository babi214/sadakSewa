import api from '../api/axios'

export const uploadService = {
  uploadImages: async (files) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))

    const { data } = await api.post('/upload', formData)
    return data
  },

  deleteImage: async (publicId) => {
    const { data } = await api.delete('/upload', { data: { publicId } })
    return data
  },
}
