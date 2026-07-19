import api from '../api/axios'
import { File, Paths } from 'expo-file-system'

function getImageUri(image) {
  return typeof image === 'string' ? image : image?.uri
}

async function resolveUri(uri) {
  if (uri.startsWith('file://')) return uri
  const ext = uri.split('.').pop() || 'jpg'
  try {
    const response = await fetch(uri)
    const buffer = await response.arrayBuffer()
    const dest = new File(Paths.cache, `upload_${Date.now()}.${ext}`)
    const uint8 = new Uint8Array(buffer)
    const writer = dest.writableStream().getWriter()
    await writer.write(uint8)
    await writer.close()
    return dest.uri
  } catch {
    return uri
  }
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
  analyzeImage: async (image, retried = false) => {
    const imageUri = getImageUri(image)
    if (!imageUri) throw new Error('No image selected')

    const resolvedUri = await resolveUri(imageUri)
    const { name, type } = getUploadMeta(image, resolvedUri)
    const formData = new FormData()
    formData.append('image', {
      uri: resolvedUri,
      type,
      name,
    })

    try {
      const { data } = await api.post('/ai/analyze', formData, { timeout: 60000 })
      return data
    } catch (err) {
      if (!retried && err.message?.includes('Network Error')) {
        return aiService.analyzeImage(image, true)
      }
      throw err
    }
  },

  createAiReport: async (reportData) => {
    const { data } = await api.post('/ai/report', reportData)
    return data
  },
}