import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Home, Map, PlusSquare, FileText, User } from 'lucide-react-native'
import HomeScreen from '../screens/citizen/HomeScreen'
import AnalyzeScreen from '../screens/citizen/AnalyzeScreen'
import MapScreen from '../screens/citizen/MapScreen'
import ReportRoadScreen from '../screens/citizen/ReportRoadScreen'
import MyReportsScreen from '../screens/citizen/MyReportsScreen'
import ProfileScreen from '../screens/citizen/ProfileScreen'
import ReportDetailsScreen from '../screens/public/ReportDetailsScreen'
import EditReportScreen from '../screens/citizen/EditReportScreen'
import NotificationsScreen from '../screens/citizen/NotificationsScreen'
import SettingsScreen from '../screens/citizen/SettingsScreen'
import ChangePasswordScreen from '../screens/citizen/ChangePasswordScreen'
import { COLORS, RADIUS } from '../constants'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Analyze" component={AnalyzeScreen} />
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
      <Stack.Screen name="EditReport" component={EditReportScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  )
}

function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
    </Stack.Navigator>
  )
}

function ReportStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ReportRoadMain" component={ReportRoadScreen} />
    </Stack.Navigator>
  )
}

function MyReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MyReportsMain" component={MyReportsScreen} />
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
      <Stack.Screen name="EditReport" component={EditReportScreen} />
    </Stack.Navigator>
  )
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  )
}

export default function CitizenTab() {
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
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack}
        options={{ tabBarIcon: ({ color }) => <Home size={22} color={color} /> }} />
      <Tab.Screen name="Map" component={MapStack}
        options={{ tabBarIcon: ({ color }) => <Map size={22} color={color} /> }} />
      <Tab.Screen name="Report" component={ReportStack}
        options={{
          tabBarIcon: ({ color }) => <PlusSquare size={22} color={color} />,
          tabBarLabel: 'Report',
        }} />
      <Tab.Screen name="My Reports" component={MyReportsStack}
        options={{ tabBarIcon: ({ color }) => <FileText size={22} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileStack}
        options={{ tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tab.Navigator>
  )
}
