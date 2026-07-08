import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { ReportCardSkeleton } from '../../components/common/Skeleton'
import { CategoryBadge, SeverityBadge, StatusBadge } from '../../components/common/Badge'
import ReportFilters from '../../components/report/ReportFilters'
import UpdateStatusModal from '../../components/report/UpdateStatusModal'
import { reportService } from '../../services/reportService'
import { formatCategory, formatDate } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/validators'

const emptyFilters = { search: '', status: '', category: '', severity: '' }

const getWorkerStatusOptions = (status) => {
  if (status === 'verified') return ['in_progress']
  if (status === 'in_progress') return ['resolved']
  return []
}

export default function AssignedReports() {
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await reportService.getAssignedReports()
      if (response.success) setReports(response.reports)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load assigned reports'))
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
        const q = filters.search.toLowerCase()
        const text = [report.title, report.description, report.locationName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [reports, filters])

  const handleStatusUpdate = async (status) => {
    if (!selectedReport) return
    setStatusLoading(true)
    try {
      const response = await reportService.updateReportStatus(selectedReport._id, status)
      if (response.success) {
        toast.success('Status updated')
        setReports((prev) =>
          prev.map((r) => (r._id === selectedReport._id ? response.report : r))
        )
        setSelectedReport(null)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update status'))
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">Assigned Reports</h1>
          <p className="mt-1 text-muted">Update status and track progress on assigned issues</p>
        </div>
        <Button variant="outline" leftIcon={<RefreshCw strokeWidth={1.5} className="h-4 w-4" />} onClick={fetchReports}>
          Refresh
        </Button>
      </div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
        resultCount={filteredReports.length}
      />

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-white py-20 text-center">
          <ClipboardList strokeWidth={1.5} className="h-12 w-12 text-muted/30" />
          <h3 className="mt-4 text-lg font-medium text-secondary">
            {reports.length === 0 ? 'No assigned reports' : 'No matching reports'}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report._id} hover className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={report.status} />
                  <CategoryBadge category={report.category} />
                  <SeverityBadge severity={report.severity} />
                </div>
                <h3 className="mt-2 text-base font-semibold text-secondary">{report.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{report.description}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                  <span>{formatCategory(report.category)}</span>
                  <span>{formatDate(report.createdAt)}</span>
                  {report.reportedBy?.fullName && (
                    <span>By {report.reportedBy.fullName}</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link to={`/reports/${report._id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                {getWorkerStatusOptions(report.status).length > 0 && (
                  <Button size="sm" onClick={() => setSelectedReport(report)}>
                    Update Status
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <UpdateStatusModal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
        onSubmit={handleStatusUpdate}
        isLoading={statusLoading}
        allowedStatuses={getWorkerStatusOptions(selectedReport?.status)}
      />
    </div>
  )
}
