import api from '../api/axios'
import { File, Paths } from 'expo-file-system'

function getImageUri(image) {
  return typeof image === 'string' ? image : image?.uri
}

function resolveUri(uri) {
  const file = new File(uri)
  if (file.exists && file.size > 0) return uri
  const ext = uri.split('.').pop() || 'jpg'
  const dest = new File(Paths.cache, `upload_${Date.now()}.${ext}`)
  file.copy(dest)
  return dest.uri
}

function getUploadMeta(image, resolvedUri) {
  if (typeof image === 'object' && image) {
    const name = image.fileName || resolvedUri.split('/').pop() || 'road_image.jpg'
    const type = image.mimeType || (name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg')
    return { name, type }
  }

  const name = resolvedUri.split('/').pop() || 'road_image.jpg'
  const lower = name.toLowerCase()
  const type = lower.endsWith('.png')
    ? 'image/png'
    : lower.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg'
  return { name, type }
}

export const aiService = {
  analyzeImage: async (image) => {
    const imageUri = getImageUri(image)
    if (!imageUri) throw new Error('No image selected')

    const resolvedUri = resolveUri(imageUri)
    const { name, type } = getUploadMeta(image, resolvedUri)
    const formData = new FormData()
    formData.append('image', {
      uri: resolvedUri,
      type,
      name,
    })

    const { data } = await api.post('/ai/analyze', formData, { timeout: 60000 })
    return data
  },

  createAiReport: async (reportData) => {
    const { data } = await api.post('/ai/report', reportData)
    return data
  },
}