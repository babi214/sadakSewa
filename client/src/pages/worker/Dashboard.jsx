import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { DashboardSkeleton } from '../../components/common/Skeleton'
import StatusBreakdownChart from '../../components/dashboard/StatusBreakdownChart'
import WeeklyTrendChart from '../../components/dashboard/WeeklyTrendChart'
import StatCard from '../../components/dashboard/StatCard'
import ReportCard from '../../components/report/ReportCard'
import { useAuth } from '../../hooks/useAuth'
import { reportService } from '../../services/reportService'
import { authService } from '../../services/authService'
import { getApiErrorMessage } from '../../utils/validators'

export default function WorkerDashboard() {
  const { user, refreshUser } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingAvail, setTogglingAvail] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, reportsRes] = await Promise.all([
          reportService.getWorkerDashboard(),
          reportService.getAssignedReports(),
        ])
        if (dashRes.success) setDashboard(dashRes.dashboard)
        if (reportsRes.success) setReports(reportsRes.reports)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load dashboard'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const isAvailable = user?.isAvailable !== false

  const handleToggleAvailability = async () => {
    setTogglingAvail(true)
    try {
      const res = await authService.toggleAvailability()
      if (res.success) {
        if (res.isAvailable) {
          toast.success(res.message)
        } else {
          toast.error(res.message)
        }
        if (refreshUser) await refreshUser()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to toggle availability'))
    } finally {
      setTogglingAvail(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  const stats = dashboard || {
    assigned: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
  }

  const firstName = user?.fullName?.split(' ')[0] || 'Worker'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">
            Welcome, {firstName}
          </h1>
          <p className="mt-1 text-muted">Manage your assigned road issue reports</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isAvailable ? 'accent' : 'outline'}
            size="sm"
            leftIcon={isAvailable ? <Wifi strokeWidth={1.5} className="h-4 w-4" /> : <WifiOff strokeWidth={1.5} className="h-4 w-4" />}
            onClick={handleToggleAvailability}
            isLoading={togglingAvail}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </Button>
          <Link to="/worker/assigned">
            <Button leftIcon={<ClipboardList strokeWidth={1.5} className="h-4 w-4" />}>View Assigned</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Assigned" value={stats.assigned} icon={ClipboardList} color="primary" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="warning" />
        <StatCard title="In Progress" value={stats.in_progress} icon={AlertCircle} color="secondary" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyTrendChart
            reports={reports}
            title="Assignment Activity"
            subtitle="Assigned reports over the past 7 days"
          />
        </div>
        <StatusBreakdownChart
          stats={{ ...stats, totalReports: stats.assigned }}
          title="By Status"
          subtitle="Your assigned reports breakdown"
        />
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-secondary">Recent Assignments</h2>
            <p className="mt-1 text-sm text-muted">Latest reports assigned to you</p>
          </div>
          {reports.length > 0 && (
            <Link to="/worker/assigned">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          )}
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-white py-16 text-center">
            <ClipboardList strokeWidth={1.5} className="h-12 w-12 text-muted/30" />
            <h3 className="mt-4 text-lg font-medium text-secondary">No assignments yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Reports will appear here once an admin assigns them to you.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.slice(0, 3).map((report, index) => (
              <ReportCard
                key={report._id}
                report={report}
                index={index}
                onUpdate={(updated) =>
                  setReports((prev) =>
                    prev.map((r) => (r._id === updated._id ? updated : r))
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
