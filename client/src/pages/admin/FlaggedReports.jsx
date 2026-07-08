import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { ReportCardSkeleton } from '../../components/common/Skeleton'
import { SeverityBadge, StatusBadge } from '../../components/common/Badge'
import { reportService } from '../../services/reportService'
import { formatDate } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/validators'

export default function FlaggedReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const response = await reportService.getFlaggedReports()
      if (response.success) setReports(response.reports)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load flagged reports'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  const handleClearFlag = async (id) => {
    try {
      const response = await reportService.clearFlag(id)
      if (response.success) {
        toast.success('Flag cleared')
        setReports((prev) => prev.filter((r) => r._id !== id))
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to clear flag'))
    }
  }

  if (loading) return <ReportCardSkeleton count={3} />

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <AlertCircle strokeWidth={1.5} className="h-7 w-7 text-status-rejected" />
          <div>
            <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">Flagged Reports</h1>
            <p className="mt-1 text-muted">
              Reports flagged as potential duplicates requiring admin review
            </p>
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center text-sm text-muted">
          No flagged reports
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="rounded-xl border border-danger/20 bg-white p-5 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/reports/${report._id}`}
                      className="text-lg font-semibold text-secondary hover:text-primary"
                    >
                      {report.title}
                    </Link>
                    <StatusBadge status={report.status} />
                    <SeverityBadge severity={report.severity} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{report.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span>by {report.reportedBy?.fullName || 'Unknown'}</span>
                    <span>{formatDate(report.createdAt)}</span>
                    {report.district && <span>{report.district}</span>}
                    {report.municipality && <span>{report.municipality}</span>}
                  </div>
                  {report.flaggedReason && (
                    <p className="mt-2 text-xs font-medium text-danger/80">{report.flaggedReason}</p>
                  )}
                  {report.userFlags && report.userFlags.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-danger/10 pt-3">
                      <p className="text-xs font-semibold text-muted">Flagged by ({report.userFlags.length}):</p>
                      {report.userFlags.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted">
                          <span className="font-medium text-secondary">{f.user?.fullName || 'Unknown'}</span>
                          <span className="text-danger/40">&middot;</span>
                          <span className="capitalize text-danger/70">{f.reason?.replace(/_/g, ' ')}</span>
                          {f.customReason && <span className="text-muted">&mdash; &quot;{f.customReason}&quot;</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearFlag(report._id)}
                  className="shrink-0"
                >
                  <CheckCircle2 strokeWidth={1.5} className="mr-1 h-4 w-4" />
                  Clear Flag
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
