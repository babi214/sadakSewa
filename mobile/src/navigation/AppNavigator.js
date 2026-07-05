import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthContext } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'
import PublicTab from './PublicTab'
import CitizenTab from './CitizenTab'
import WorkerTab from './WorkerTab'
import AdminTab from './AdminTab'
import ReportDetailsScreen from '../screens/public/ReportDetailsScreen'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen'
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen'

const Stack = createNativeStackNavigator()

function MainTabs() {
  const { isAuthenticated, user } = useContext(AuthContext)

  if (isAuthenticated) {
    switch (user?.role) {
      case 'worker': return <WorkerTab />
      case 'admin': return <AdminTab />
      default: return <CitizenTab />
    }
  }

  return <PublicTab />
}

export default function AppNavigator() {
  const { loading } = useContext(AuthContext)

  if (loading) return <LoadingScreen />

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  )
}
