import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  Users,
  Wrench,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { DashboardSkeleton } from '../../components/common/Skeleton'
import StatusBreakdownChart from '../../components/dashboard/StatusBreakdownChart'
import WeeklyTrendChart from '../../components/dashboard/WeeklyTrendChart'
import StatCard from '../../components/dashboard/StatCard'
import ReportCard from '../../components/report/ReportCard'
import { reportService } from '../../services/reportService'
import { getApiErrorMessage } from '../../utils/validators'

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await reportService.getAdminDashboard()
        if (response.success) setDashboard(response.dashboard)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load dashboard'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <DashboardSkeleton />

  const stats = dashboard || {}

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-muted">Overview of platform activity and reports</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Reports" value={stats.totalReports || 0} icon={FileText} color="primary" index={0} />
        <StatCard title="Pending" value={stats.pending || 0} icon={Clock} color="warning" index={1} />
        <StatCard title="In Progress" value={stats.inProgress || 0} icon={AlertCircle} color="secondary" index={2} />
        <StatCard title="Resolved" value={stats.resolved || 0} icon={CheckCircle2} color="accent" index={3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Citizens" value={stats.totalCitizens || 0} icon={Users} color="primary" index={4} />
        <StatCard title="Workers" value={stats.totalWorkers || 0} icon={Wrench} color="accent" index={5} />
        <StatCard title="Admins" value={stats.totalAdmins || 0} icon={Shield} color="secondary" index={6} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyTrendChart
            reports={stats.recentReports || []}
            title="Recent Activity"
            subtitle="Latest report submissions trend"
          />
        </div>
        <StatusBreakdownChart
          stats={{
            pending: stats.pending,
            verified: stats.verified,
            in_progress: stats.inProgress,
            resolved: stats.resolved,
            rejected: stats.rejected,
          }}
          title="Platform Status"
          subtitle="All reports by status"
        />
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
        <h3 className="text-lg font-semibold text-secondary">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/admin/reports">
            <Button variant="outline">Manage Reports</Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="outline">Manage Users</Button>
          </Link>
          <Link to="/reports">
            <Button variant="ghost">View Public Reports</Button>
          </Link>
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-secondary">Recent Reports</h2>
            <p className="mt-1 text-sm text-muted">Latest submissions across the platform</p>
          </div>
          <Link to="/admin/reports">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {(stats.recentReports || []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center text-sm text-muted">
            No reports yet
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentReports.map((report, index) => (
              <ReportCard
                key={report._id}
                report={report}
                index={index}
                onUpdate={(updated) =>
                  setDashboard((prev) => ({
                    ...prev,
                    recentReports: prev.recentReports.map((r) =>
                      r._id === updated._id ? updated : r
                    ),
                  }))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
