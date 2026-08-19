import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { LayoutDashboard, FileText, Users, User } from 'lucide-react-native'
import AdminHomeScreen from '../screens/admin/HomeScreen'
import ManageReportsScreen from '../screens/admin/ManageReportsScreen'
import FlaggedReportsScreen from '../screens/admin/FlaggedReportsScreen'
import ManageUsersScreen from '../screens/admin/ManageUsersScreen'
import ProfileScreen from '../screens/citizen/ProfileScreen'
import ReportDetailsScreen from '../screens/public/ReportDetailsScreen'
import EditReportScreen from '../screens/citizen/EditReportScreen'
import NotificationsScreen from '../screens/citizen/NotificationsScreen'
import SettingsScreen from '../screens/citizen/SettingsScreen'
import ChangePasswordScreen from '../screens/citizen/ChangePasswordScreen'
import { COLORS } from '../constants'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function AdminDashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AdminHomeMain" component={AdminHomeScreen} />
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
      <Stack.Screen name="EditReport" component={EditReportScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  )
}

function AdminReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ManageReportsHome" component={ManageReportsScreen}
        initialParams={{ initialFilter: 'all' }} />
      <Stack.Screen name="FlaggedReports" component={FlaggedReportsScreen} />
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
      <Stack.Screen name="EditReport" component={EditReportScreen} />
    </Stack.Navigator>
  )
}

function AdminUsersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ManageUsersHome" component={ManageUsersScreen} />
    </Stack.Navigator>
  )
}

function AdminProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  )
}

export default function AdminTab() {
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
      <Tab.Screen name="Dashboard" component={AdminDashboardStack}
        options={{ tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} /> }} />
      <Tab.Screen name="Reports" component={AdminReportsStack}
        options={{ tabBarIcon: ({ color }) => <FileText size={22} color={color} /> }} />
      <Tab.Screen name="Users" component={AdminUsersStack}
        options={{ tabBarIcon: ({ color }) => <Users size={22} color={color} /> }} />
      <Tab.Screen name="Profile" component={AdminProfileStack}
        options={{ tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tab.Navigator>
  )
}
