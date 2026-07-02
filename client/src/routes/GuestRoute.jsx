import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading, getDashboardPath } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || getDashboardPath()
    return <Navigate to={redirectTo} replace />
  }

  return children
}
