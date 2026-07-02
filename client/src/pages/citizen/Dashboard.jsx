import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  ThumbsUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { DashboardSkeleton } from '../../components/common/Skeleton'
import StatusBreakdownChart from '../../components/dashboard/StatusBreakdownChart'
import WeeklyTrendChart from '../../components/dashboard/WeeklyTrendChart'
import RecentActivity from '../../components/dashboard/RecentActivity'
import StatCard from '../../components/dashboard/StatCard'
import ReportCard from '../../components/report/ReportCard'
import { useAuth } from '../../hooks/useAuth'
import { reportService } from '../../services/reportService'
import { getApiErrorMessage } from '../../utils/validators'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardRes, reportsRes] = await Promise.all([
          reportService.getMyDashboard(),
          reportService.getMyReports(),
        ])

        if (dashboardRes.success) setDashboard(dashboardRes.dashboard)
        if (reportsRes.success) setReports(reportsRes.reports)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load dashboard'))
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  const stats = dashboard || {
    totalReports: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    totalUpvotes: 0,
  }

  const firstName = user?.fullName?.split(' ')[0] || 'Citizen'

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-muted">
            Track your reports and monitor civic issues in your area
          </p>
        </div>
        <Link to="/citizen/reports/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Report</Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reports"
          value={stats.totalReports}
          icon={FileText}
          color="primary"
          index={0}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="warning"
          index={1}
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress}
          icon={AlertCircle}
          color="secondary"
          index={2}
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="accent"
          index={3}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Upvotes Received"
          value={stats.totalUpvotes}
          icon={ThumbsUp}
          color="accent"
          index={4}
        />
        <StatCard
          title="Verified Reports"
          value={stats.verified || 0}
          icon={CheckCircle2}
          color="primary"
          index={5}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyTrendChart
            reports={reports}
            title="Weekly Report Activity"
            subtitle="Reports submitted over the past 7 days"
          />
        </div>
        <StatusBreakdownChart stats={stats} title="By Status" subtitle="Your reports breakdown" />
      </div>

      <RecentActivity reports={reports} />

      {/* Recent Reports */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-secondary">Recent Reports</h2>
            <p className="mt-1 text-sm text-muted">Your latest submitted issues</p>
          </div>
          {reports.length > 0 && (
            <Link to="/citizen/reports">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>

        {reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center"
          >
            <FileText className="h-12 w-12 text-muted/30" />
            <h3 className="mt-4 text-lg font-medium text-secondary">No reports yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Start by reporting a road issue in your community. Your first report
              helps make roads safer for everyone.
            </p>
            <Link to="/citizen/reports/new" className="mt-6">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Create First Report</Button>
            </Link>
          </motion.div>
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
