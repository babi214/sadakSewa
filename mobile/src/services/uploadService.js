import api from '../api/axios'
import { File, Paths } from 'expo-file-system'

function resolveUri(uri) {
  const file = new File(uri)
  if (file.exists && file.size > 0) return uri
  const ext = uri.split('.').pop() || 'jpg'
  const dest = new File(Paths.cache, `upload_${Date.now()}.${ext}`)
  file.copy(dest)
  return dest.uri
}

export const uploadService = {
  uploadImages: async (imageUris) => {
    const formData = new FormData()
    for (const uri of imageUris) {
      const resolved = resolveUri(uri)
      formData.append('images', {
        uri: resolved,
        type: 'image/jpeg',
        name: 'image.jpg',
      })
    }
    const { data } = await api.post('/upload', formData)
    return data
  },
  deleteImage: async (publicId) => {
    const { data } = await api.delete('/upload', { data: { publicId } })
    return data
  },
}
