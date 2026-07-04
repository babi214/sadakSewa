import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { AuthContext } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'
import AuthStack from './AuthStack'
import CitizenTab from './CitizenTab'
import WorkerTab from './WorkerTab'
import AdminTab from './AdminTab'

export default function AppNavigator() {
  const { isAuthenticated, user, loading } = useContext(AuthContext)

  if (loading) return <LoadingScreen />

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === 'worker' ? (
        <WorkerTab />
      ) : user?.role === 'admin' ? (
        <AdminTab />
      ) : (
        <CitizenTab />
      )}
    </NavigationContainer>
  )
}
