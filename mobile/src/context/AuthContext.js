import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '../services/authService'
import { STORAGE_KEYS } from '../constants'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet([
          STORAGE_KEYS.TOKEN,
          STORAGE_KEYS.USER,
        ])
        const t = storedToken[1]
        const u = storedUser[1]
        if (t) setToken(t)
        if (u) setUser(JSON.parse(u))

        if (t) {
          const res = await authService.getProfile()
          if (res.success) {
            setUser(res.user)
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user))
          }
        }
      } catch {
        await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER])
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const persistAuth = useCallback(async (authToken, authUser) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, authToken],
      [STORAGE_KEYS.USER, JSON.stringify(authUser)],
    ])
    setToken(authToken)
    setUser(authUser)
  }, [])

  const clearAuth = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER])
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials)
    if (response.success) await persistAuth(response.token, response.user)
    return response
  }, [persistAuth])

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData)
    if (response.success && response.token) await persistAuth(response.token, response.user)
    return response
  }, [persistAuth])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch {}
    await clearAuth()
  }, [clearAuth])

  const updateUser = useCallback(async (updatedUser) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
    setUser(updatedUser)
  }, [])

  const value = useMemo(() => ({
    user, token, loading,
    isAuthenticated: !!token && !!user,
    login, register, logout, updateUser,
  }), [user, token, loading, login, register, logout, updateUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
