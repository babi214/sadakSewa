import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import GuestRoute from './GuestRoute'
import Home from '../pages/public/Home'
import About from '../pages/public/About'
import Contact from '../pages/public/Contact'
import PublicReports from '../pages/public/PublicReports'
import ReportDetails from '../pages/public/ReportDetails'
import PlaceholderPage from '../pages/public/PlaceholderPage'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import VerifyEmail from '../pages/auth/VerifyEmail'
import CreateReport from '../pages/citizen/CreateReport'
import AnalyzeRoad from '../pages/citizen/AnalyzeRoad'
import EditReport from '../pages/citizen/EditReport'
import MyReports from '../pages/citizen/MyReports'
import Notifications from '../pages/citizen/Notifications'
import Profile from '../pages/citizen/Profile'
import CitizenDashboard from '../pages/citizen/Dashboard'
import NearbyReports from '../pages/citizen/NearbyReports'
import WorkerDashboard from '../pages/worker/Dashboard'
import AssignedReports from '../pages/worker/AssignedReports'
import AdminDashboard from '../pages/admin/Dashboard'
import FlaggedReports from '../pages/admin/FlaggedReports'
import ManageReports from '../pages/admin/ManageReports'
import ManageUsers from '../pages/admin/ManageUsers'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="reports" element={<PublicReports />} />
        <Route path="nearby" element={<NearbyReports />} />
        <Route path="citizen/nearby" element={<Navigate to="/nearby" replace />} />
        <Route path="reports/:id" element={<ReportDetails />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path="reset-password"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />
        <Route
          path="verify-email"
          element={
            <GuestRoute>
              <VerifyEmail />
            </GuestRoute>
          }
        />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Notifications (all roles) */}
        <Route path="notifications" element={<Notifications />} />

        {/* Citizen */}
        <Route path="citizen/dashboard" element={<RoleRoute allowedRoles={['citizen']}><CitizenDashboard /></RoleRoute>} />
        <Route path="citizen/reports" element={<RoleRoute allowedRoles={['citizen']}><MyReports /></RoleRoute>} />
        <Route path="citizen/reports/new" element={<RoleRoute allowedRoles={['citizen']}><CreateReport /></RoleRoute>} />
        <Route path="citizen/analyze" element={<RoleRoute allowedRoles={['citizen']}><AnalyzeRoad /></RoleRoute>} />
        <Route path="citizen/reports/:id/edit" element={<RoleRoute allowedRoles={['citizen']}><EditReport /></RoleRoute>} />
        <Route path="citizen/profile" element={<RoleRoute allowedRoles={['citizen']}><Profile /></RoleRoute>} />

        {/* Worker */}
        <Route path="worker/dashboard" element={<RoleRoute allowedRoles={['worker', 'admin']}><WorkerDashboard /></RoleRoute>} />
        <Route path="worker/assigned" element={<RoleRoute allowedRoles={['worker', 'admin']}><AssignedReports /></RoleRoute>} />
        <Route path="worker/profile" element={<RoleRoute allowedRoles={['worker', 'admin']}><Profile /></RoleRoute>} />

        {/* Admin */}
        <Route path="admin/dashboard" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="admin/reports" element={<RoleRoute allowedRoles={['admin']}><ManageReports /></RoleRoute>} />
        <Route path="admin/flagged-reports" element={<RoleRoute allowedRoles={['admin']}><FlaggedReports /></RoleRoute>} />
        <Route path="admin/users" element={<RoleRoute allowedRoles={['admin']}><ManageUsers /></RoleRoute>} />
        <Route path="admin/profile" element={<RoleRoute allowedRoles={['admin']}><Profile /></RoleRoute>} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <PlaceholderPage
            title="Page Not Found"
            description="The page you're looking for doesn't exist."
          />
        }
      />
    </Routes>
  )
}
