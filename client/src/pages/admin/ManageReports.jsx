import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, FileText, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Pagination from '../../components/common/Pagination'
import { ReportCardSkeleton } from '../../components/common/Skeleton'
import { CategoryBadge, SeverityBadge, StatusBadge } from '../../components/common/Badge'
import AssignWorkerModal from '../../components/report/AssignWorkerModal'
import ReportFilters from '../../components/report/ReportFilters'
import UpdateStatusModal from '../../components/report/UpdateStatusModal'
import { reportService } from '../../services/reportService'
import { formatDate } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/validators'

const emptyFilters = { search: '', status: '', category: '', severity: '' }
const ADMIN_REVIEW_STATUSES = ['verified', 'rejected']

export default function ManageReports() {
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)

  const [assignReport, setAssignReport] = useState(null)
  const [statusReport, setStatusReport] = useState(null)
  const [assignLoading, setAssignLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 400)
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters.status, filters.category, filters.severity])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (debouncedSearch) params.search = debouncedSearch
      if (filters.status) params.status = filters.status
      if (filters.category) params.category = filters.category
      if (filters.severity) params.severity = filters.severity

      const response = await reportService.getAllReports(params)
      if (response.success) {
        setReports(response.reports || [])
        setPagination({ total: response.total || 0, pages: response.pages || 1 })
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load reports'))
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters.status, filters.category, filters.severity])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleAssign = async (workerId) => {
    if (!assignReport) return
    setAssignLoading(true)
    try {
      const response = await reportService.assignWorker(assignReport._id, workerId)
      if (response.success) {
        toast.success('Worker assigned')
        setAssignReport(null)
        fetchReports()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to assign worker'))
    } finally {
      setAssignLoading(false)
    }
  }

  const handleStatusUpdate = async (status, rejectionReason) => {
    if (!statusReport) return
    setStatusLoading(true)
    try {
      const response = await reportService.updateReportStatus(statusReport._id, status, rejectionReason)
      if (response.success) {
        toast.success('Status updated')
        setStatusReport(null)
        fetchReports()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update status'))
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">Manage Reports</h1>
        <p className="mt-1 text-muted">Review, assign, and track report progress</p>
      </div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
        resultCount={pagination.total}
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-white py-20 text-center">
          <FileText strokeWidth={1.5} className="h-12 w-12 text-muted/30" />
          <p className="mt-4 text-muted">No reports found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report._id} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={report.status} />
                    <CategoryBadge category={report.category} />
                    <SeverityBadge severity={report.severity} />
                    {report.flagged && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                        <AlertCircle strokeWidth={1.5} className="h-3 w-3" />
                        Flagged
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold text-secondary">{report.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{report.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                    <span>{formatDate(report.createdAt)}</span>
                    {report.reportedBy?.fullName && <span>By {report.reportedBy.fullName}</span>}
                    {report.assignedWorker?.fullName && (
                      <span className="text-primary">Assigned: {report.assignedWorker.fullName}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to={`/reports/${report._id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  {report.status === 'verified' && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<UserPlus strokeWidth={1.5} className="h-3.5 w-3.5" />}
                      onClick={() => setAssignReport(report)}
                    >
                      {report.assignedWorker ? 'Reassign' : 'Assign'}
                    </Button>
                  )}
                  {report.status === 'pending' && (
                    <Button size="sm" onClick={() => setStatusReport(report)}>
                      Review
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            page={page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={setPage}
          />
        </>
      )}

      <AssignWorkerModal
        isOpen={Boolean(assignReport)}
        onClose={() => setAssignReport(null)}
        report={assignReport}
        onSubmit={handleAssign}
        isLoading={assignLoading}
      />

      <UpdateStatusModal
        isOpen={Boolean(statusReport)}
        onClose={() => setStatusReport(null)}
        report={statusReport}
        onSubmit={handleStatusUpdate}
        isLoading={statusLoading}
        allowedStatuses={ADMIN_REVIEW_STATUSES}
      />
    </div>
  )
}
