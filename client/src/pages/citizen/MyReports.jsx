import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import { ReportCardSkeleton } from '../../components/common/Skeleton'
import ReportCard from '../../components/report/ReportCard'
import ReportFilters from '../../components/report/ReportFilters'
import { reportService } from '../../services/reportService'
import { getApiErrorMessage } from '../../utils/validators'
import { Link } from 'react-router-dom'

const emptyFilters = {
  search: '',
  status: '',
  category: '',
  severity: '',
}

export default function MyReports() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(emptyFilters)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchReports = async () => {
    try {
      const response = await reportService.getMyReports()
      if (response.success) setReports(response.reports)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load reports'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (filters.status && report.status !== filters.status) return false
      if (filters.category && report.category !== filters.category) return false
      if (filters.severity && report.severity !== filters.severity) return false

      if (filters.search) {
        const query = filters.search.toLowerCase()
        const searchable = [
          report.title,
          report.description,
          report.locationName,
          report.municipality,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!searchable.includes(query)) return false
      }

      return true
    })
  }, [reports, filters])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const response = await reportService.deleteReport(deleteTarget._id)
      if (response.success) {
        toast.success('Report deleted')
        setReports((prev) => prev.filter((r) => r._id !== deleteTarget._id))
        setDeleteTarget(null)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete report'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">My Reports</h1>
          <p className="mt-1 text-muted">View, edit, and manage your submitted issues</p>
        </div>
        <Link to="/citizen/reports/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Report</Button>
        </Link>
      </div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
        resultCount={filteredReports.length}
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-20 text-center"
        >
          <FileText className="h-12 w-12 text-muted/30" />
          <h3 className="mt-4 text-lg font-medium text-secondary">
            {reports.length === 0 ? 'No reports yet' : 'No matching reports'}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            {reports.length === 0
              ? 'Submit your first report to start tracking civic issues in your area.'
              : 'Try adjusting your filters to find what you are looking for.'}
          </p>
          {reports.length === 0 ? (
            <Link to="/citizen/reports/new" className="mt-6">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Create Report</Button>
            </Link>
          ) : (
            <Button variant="outline" className="mt-6" onClick={() => setFilters(emptyFilters)}>
              Clear filters
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report, index) => (
            <ReportCard
              key={report._id}
              report={report}
              index={index}
              showOwnerActions={report.status === 'pending'}
              onEdit={() => navigate(`/citizen/reports/${report._id}/edit`)}
              onDelete={setDeleteTarget}
              onUpdate={(updated) =>
                setReports((prev) =>
                  prev.map((r) => (r._id === updated._id ? updated : r))
                )
              }
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Report"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteLoading}
      />
    </div>
  )
}
