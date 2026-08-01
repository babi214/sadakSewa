import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL, STORAGE_KEYS } from '../constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
  timeout: 30000,
})

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) config.headers.Authorization = `Bearer ${token}`
    if (config.data instanceof FormData) delete config.headers['Content-Type']
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER])
    }
    return Promise.reject(error)
  }
)

export default api
