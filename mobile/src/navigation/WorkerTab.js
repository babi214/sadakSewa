import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { LayoutDashboard, ClipboardList, User } from 'lucide-react-native'
import WorkerHomeScreen from '../screens/worker/HomeScreen'
import AssignedReportsScreen from '../screens/worker/AssignedReportsScreen'
import ProfileScreen from '../screens/citizen/ProfileScreen'
import ReportDetailsScreen from '../screens/public/ReportDetailsScreen'
import NotificationsScreen from '../screens/citizen/NotificationsScreen'
import SettingsScreen from '../screens/citizen/SettingsScreen'
import ChangePasswordScreen from '../screens/citizen/ChangePasswordScreen'
import { COLORS } from '../constants'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function WorkerDashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="WorkerHomeMain" component={WorkerHomeScreen} />
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  )
}

function WorkerAssignedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AssignedHome" component={AssignedReportsScreen} />
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
    </Stack.Navigator>
  )
}

function WorkerProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  )
}

export default function WorkerTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          paddingBottom: 6,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tab.Screen name="Dashboard" component={WorkerDashboardStack}
        options={{ tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} /> }} />
      <Tab.Screen name="Assigned" component={WorkerAssignedStack}
        options={{ tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} /> }} />
      <Tab.Screen name="Profile" component={WorkerProfileStack}
        options={{ tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tab.Navigator>
  )
}
