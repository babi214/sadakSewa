import React from 'react'
import { StatusBar } from 'react-native'
import Toast from 'react-native-toast-message'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider } from './src/context/AuthContext'
import AppNavigator from './src/navigation/AppNavigator'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    },
  },
})

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AuthProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <AppNavigator />
            <Toast />
          </AuthProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
