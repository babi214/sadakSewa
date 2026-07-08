import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { ROLE_DASHBOARD_PATHS, STORAGE_KEYS } from '../utils/constants'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER)
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN))
  const [loading, setLoading] = useState(true)

  const persistAuth = useCallback((authToken, authUser) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, authToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser))
    setToken(authToken)
    setUser(authUser)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials)
    if (response.success) {
      persistAuth(response.token, response.user)
    }
    return response
  }, [persistAuth])

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData)
    if (response.success && response.token) {
      persistAuth(response.token, response.user)
    }
    return response
  }, [persistAuth])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Clear local state even if server logout fails
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
    setUser(updatedUser)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getProfile()
      if (response.success) {
        updateUser(response.user)
      }
    } catch {
      // silently fail
    }
  }, [updateUser])

  const getDashboardPath = useCallback(() => {
    if (!user?.role) return '/'
    return ROLE_DASHBOARD_PATHS[user.role] || '/'
  }, [user])

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await authService.getProfile()
        if (response.success) {
          updateUser(response.user)
        }
      } catch {
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [clearAuth, updateUser])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      getDashboardPath,
    }),
    [user, token, loading, login, register, logout, updateUser, refreshUser, getDashboardPath]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
