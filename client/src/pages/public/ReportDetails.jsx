import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Flag,
  MapPin,
  Pencil,
  ShieldCheck,
  ThumbsUp,
  Trash2,
  User,
  UserMinus,
  UserPlus,
} from 'lucide-react'
import StatusShield from '../../components/common/StatusShield'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card, { CardHeader } from '../../components/common/Card'
import ConfirmModal from '../../components/common/ConfirmModal'
import { ReportCardSkeleton } from '../../components/common/Skeleton'
import { CategoryBadge, SeverityBadge, StatusBadge } from '../../components/common/Badge'
import AssignWorkerModal from '../../components/report/AssignWorkerModal'
import ReportMap from '../../components/report/ReportMap'
import StatusHistory from '../../components/report/StatusHistory'
import UpdateStatusModal from '../../components/report/UpdateStatusModal'
import { useAuth } from '../../hooks/useAuth'
import { reportService } from '../../services/reportService'
import { getReportCoordinates } from '../../utils/leafletSetup'
import { formatCategory, formatDate, formatDateTime } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/validators'

export default function ReportDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [upvoteLoading, setUpvoteLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [notFound, setNotFound] = useState(false)
  const [flagOpen, setFlagOpen] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [flagCustom, setFlagCustom] = useState('')
  const [flagLoading, setFlagLoading] = useState(false)
  const [statusReport, setStatusReport] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [assignReport, setAssignReport] = useState(null)
  const [assignLoading, setAssignLoading] = useState(false)

  const fetchReport = useCallback(async () => {
    try {
      const response = await reportService.getReportById(id)
      if (response.success) {
        setReport(response.report)
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setNotFound(true)
      } else {
        toast.error(getApiErrorMessage(error, 'Failed to load report'))
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return
    setHistoryLoading(true)
    try {
      const response = await reportService.getReportHistory(id)
      if (response.success) {
        setHistory(response.history)
      }
    } catch {
      // History is optional — don't block the page
    } finally {
      setHistoryLoading(false)
    }
  }, [id, isAuthenticated])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const hasUpvoted = report?.upvotes?.some(
    (uid) => String(uid?._id || uid) === String(user?._id)
  )

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to upvote')
      return
    }

    setUpvoteLoading(true)
    try {
      const response = await reportService.toggleUpvote(id)
      if (response.success) {
        setReport((prev) => ({
          ...prev,
          upvoteCount: response.upvoteCount,
          upvotes: response.upvotes,
        }))
        fetchHistory()
        toast.success(response.message)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upvote'))
    } finally {
      setUpvoteLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const response = await reportService.deleteReport(id)
      if (response.success) {
        toast.success('Report deleted')
        navigate(user?.role === 'admin' ? '/admin/reports' : '/citizen/reports')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete report'))
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ReportCardSkeleton />
      </div>
    )
  }

  if (notFound || !report) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-secondary">Report Not Found</h1>
        <p className="mt-2 text-muted">This report may have been removed or does not exist.</p>
        <Link to="/reports" className="mt-6 inline-block">
          <Button variant="outline">Browse Reports</Button>
        </Link>
      </div>
    )
  }

  const coords = getReportCoordinates(report)
  const images = report.images || []
  const upvoteCount = report.upvoteCount ?? report.upvotes?.length ?? 0

  const handleFlag = async () => {
    if (!flagReason) return
    setFlagLoading(true)
    try {
      const response = await reportService.flagReport(id, flagReason, flagCustom)
      if (response.success) {
        toast.success(response.message)
        setFlagOpen(false)
        setFlagReason('')
        setFlagCustom('')
        fetchReport()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to report'))
    } finally {
      setFlagLoading(false)
    }
  }

  const handleStatusUpdate = async (status, rejectionReason) => {
    if (!report) return
    setStatusLoading(true)
    try {
      const response = await reportService.updateReportStatus(report._id, status, rejectionReason)
      if (response.success) {
        toast.success('Status updated')
        setStatusReport(null)
        fetchReport()
        fetchHistory()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update status'))
    } finally {
      setStatusLoading(false)
    }
  }

  const handleAssign = async (workerId) => {
    if (!assignReport) return
    setAssignLoading(true)
    try {
      const response = await reportService.assignWorker(assignReport._id, workerId)
      if (response.success) {
        toast.success('Worker assigned successfully')
        setAssignReport(null)
        fetchReport()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to assign worker'))
    } finally {
      setAssignLoading(false)
    }
  }

  const hasFlagged = report?.userFlags?.some(
    (f) => String(f.user?._id || f.user) === String(user?._id)
  )

  const isOwner =
    String(report.reportedBy?._id || report.reportedBy) === String(user?._id)
  const canManage = isOwner && report?.status === 'pending'
  const canDelete = user?.role === 'admin' || (isOwner && (report?.status === 'pending' || report?.status === 'rejected'))

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-secondary"
      >
        <ArrowLeft strokeWidth={1.5} className="h-4 w-4" />
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={report.status} />
              <CategoryBadge category={report.category} />
              <SeverityBadge severity={report.severity} />
            </div>
            <h1 className="mt-2 text-xl font-bold text-secondary sm:text-2xl">
              {report.title}
            </h1>
            <p className="mt-1 text-sm text-muted line-clamp-3">{report.description}</p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-1.5">
            <Button
              variant={hasUpvoted ? 'accent' : 'outline'}
              onClick={handleUpvote}
              isLoading={upvoteLoading}
              leftIcon={<ThumbsUp strokeWidth={1.5} className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />}
              size="sm"
            >
              {upvoteCount} {upvoteCount === 1 ? 'Upvote' : 'Upvotes'}
            </Button>
            {canManage && (
              <Link to={`/citizen/reports/${id}/edit`}>
                <Button variant="outline" size="sm" leftIcon={<Pencil strokeWidth={1.5} className="h-4 w-4" />}>
                  Edit
                </Button>
              </Link>
            )}
            {canDelete && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 strokeWidth={1.5} className="h-4 w-4" />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            )}
            {user?.role === 'admin' && report?.status === 'pending' && (
              <Button
                variant="warning"
                size="sm"
                leftIcon={<ShieldCheck strokeWidth={1.5} className="h-4 w-4" />}
                onClick={() => setStatusReport(report)}
              >
                Review
              </Button>
            )}
            {user?.role === 'admin' && report?.status === 'verified' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UserPlus strokeWidth={1.5} className="h-4 w-4" />}
                onClick={() => setAssignReport(report)}
              >
                Assign Worker
              </Button>
            )}
          </div>
        </div>

        {/* Images */}
        {images.length > 0 && (
          <Card padding="sm" className="mt-4 overflow-hidden">
            <div className="flex items-center justify-center overflow-hidden rounded-xl bg-black/5 max-h-80">
              <img
                src={images[activeImage]?.url || images[activeImage]}
                alt={report.title}
                className="max-h-80 w-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, index) => (
                  <button
                    key={img.publicId || index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={[
                      'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                      activeImage === index
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent opacity-70 hover:opacity-100',
                    ].join(' ')}
                  >
                    <img
                      src={img.url || img}
                      alt={`${report.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-4 lg:col-span-2">
            {/* Map */}
            {coords && (
              <Card>
                <CardHeader title="Location" subtitle={report.locationName || 'Issue location on map'} />
                <div className="mt-3">
                  <ReportMap
                    lat={coords.lat}
                    lng={coords.lng}
                    height="h-52"
                    popup={report.locationName || report.title}
                  />
                </div>
                {(report.locationName || report.province || report.district || report.municipality) && (
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                    {report.locationName && (
                      <span className="flex items-center gap-1.5">
                        <MapPin strokeWidth={1.5} className="h-4 w-4 text-primary" />
                        {report.locationName}
                      </span>
                    )}
                    {[report.province, report.district, report.municipality].filter(Boolean).length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <MapPin strokeWidth={1.5} className="h-4 w-4 text-primary" />
                        {[report.province, report.district, report.municipality].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* History */}
            <Card>
              <CardHeader title="Status History" subtitle="Timeline of report activity" />
              {!isAuthenticated ? (
                <div className="mt-3 rounded-xl bg-background px-4 py-4 text-center">
                  <p className="text-sm text-muted">
                    <Link to="/login" state={{ from: { pathname: `/reports/${id}` } }} className="font-medium text-primary hover:underline">
                      Log in
                    </Link>{' '}
                    to view the full status history
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <StatusHistory history={history} loading={historyLoading} />
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Report Info" />
              <dl className="mt-3 space-y-3">
                <div className="flex items-start gap-2.5">
                  <User strokeWidth={1.5} className="mt-0.5 h-4 w-4 text-muted" />
                  <div>
                    <dt className="text-xs text-muted">Reported by</dt>
                    <dd className="text-sm font-medium text-secondary">
                      {report.reportedBy?.fullName || 'Anonymous'}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar strokeWidth={1.5} className="mt-0.5 h-4 w-4 text-muted" />
                  <div>
                    <dt className="text-xs text-muted">Submitted</dt>
                    <dd className="text-sm font-medium text-secondary">
                      {formatDateTime(report.createdAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin strokeWidth={1.5} className="mt-0.5 h-4 w-4 text-muted" />
                  <div>
                    <dt className="text-xs text-muted">Category</dt>
                    <dd className="text-sm font-medium text-secondary">
                      {formatCategory(report.category)}
                    </dd>
                  </div>
                </div>
                {report.assignedWorker && (
                  <div className="flex items-start gap-2.5">
                    <User strokeWidth={1.5} className="mt-0.5 h-4 w-4 text-muted" />
                    <div className="flex-1">
                      <dt className="text-xs text-muted">Assigned worker</dt>
                      <dd className="text-sm font-medium text-secondary">
                        {report.assignedWorker.fullName}
                      </dd>
                    </div>
                    {user?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await reportService.unassignWorker(report._id);
                            if (res.success) { toast.success(res.message); fetchReport(); }
                          } catch (e) {
                            toast.error('Failed to unassign worker');
                          }
                        }}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        title="Unassign worker"
                      >
                        <UserMinus strokeWidth={1.5} className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
                {report.rejectionReason && report.status === 'rejected' && (
                  <div className="flex items-start gap-2.5">
                    <AlertCircle strokeWidth={1.5} className="mt-0.5 h-4 w-4 text-danger" />
                    <div>
                      <dt className="text-xs text-danger">Rejected</dt>
                      <dd className="text-sm font-medium text-secondary">
                        {report.rejectionReason}
                      </dd>
                    </div>
                  </div>
                )}
                {report.resolvedAt && (
                  <div className="flex items-start gap-2.5">
                    <Calendar strokeWidth={1.5} className="mt-0.5 h-4 w-4 text-muted" />
                    <div>
                      <dt className="text-xs text-muted">Resolved</dt>
                      <dd className="text-sm font-medium text-secondary">
                        {formatDate(report.resolvedAt)}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </Card>

            {isAuthenticated && !isOwner && !hasFlagged && user?.role !== 'admin' && report?.status !== 'resolved' && (
              <Card>
                <Button
                  variant="danger"
                  outline
                  className="w-full"
                  size="sm"
                  leftIcon={<Flag strokeWidth={1.5} className="h-4 w-4" />}
                  onClick={() => setFlagOpen(true)}
                >
                  Report this issue
                </Button>
              </Card>
            )}

            {isAuthenticated && hasFlagged && user?.role !== 'admin' && (
              <Card className="bg-red-50 border-red-200">
                <p className="text-center text-xs text-red-600">
                  You reported this issue
                </p>
              </Card>
            )}

            {user?.role === 'admin' && (
              <Card className="bg-primary/5 border-primary/20">
                <p className="text-xs font-medium text-secondary">Admin Actions</p>
                <div className="mt-3 flex flex-col gap-2">
                  {report?.status === 'pending' && (
                    <Button
                      size="sm"
                      leftIcon={<ShieldCheck strokeWidth={1.5} className="h-4 w-4" />}
                      onClick={() => setStatusReport(report)}
                    >
                      Review Report
                    </Button>
                  )}
                  {report?.status === 'verified' && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<UserPlus strokeWidth={1.5} className="h-4 w-4" />}
                      onClick={() => setAssignReport(report)}
                    >
                      Assign Worker
                    </Button>
                  )}
                  <Link to={`/admin/flagged-reports`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Back to Flagged
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            {!isAuthenticated && (
              <Card className="bg-primary/5 border-primary/20">
                <p className="text-sm text-secondary">
                  Want to upvote or track this issue?
                </p>
                <Link to="/login" state={{ from: { pathname: `/reports/${id}` } }} className="mt-3 block">
                  <Button className="w-full" size="sm">Log in</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Report"
        description={`Are you sure you want to delete "${report.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteLoading}
      />

      {/* Flag Report Modal */}
      {flagOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-secondary">Report this issue</h3>
            <p className="mt-1 text-sm text-muted">Why are you reporting this report?</p>

            <div className="mt-4 space-y-2">
              {['fake', 'duplicate', 'inappropriate', 'wrong_location'].map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    flagReason === r
                      ? 'border-red-400 bg-red-50'
                      : 'border-border hover:border-red-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="flagReason"
                    value={r}
                    checked={flagReason === r}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="h-4 w-4 text-red-600"
                  />
                  <span className="text-sm capitalize text-secondary">{r.replace(/_/g, ' ')}</span>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  flagReason === 'other'
                    ? 'border-red-400 bg-red-50'
                    : 'border-border hover:border-red-200'
                }`}
              >
                <input
                  type="radio"
                  name="flagReason"
                  value="other"
                  checked={flagReason === 'other'}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="h-4 w-4 text-red-600"
                />
                <span className="text-sm text-secondary">Other</span>
              </label>
              {flagReason === 'other' && (
                <input
                  type="text"
                  placeholder="Describe the issue..."
                  value={flagCustom}
                  onChange={(e) => setFlagCustom(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-red-400"
                />
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setFlagOpen(false)
                  setFlagReason('')
                  setFlagCustom('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleFlag}
                isLoading={flagLoading}
                disabled={!flagReason}
              >
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}

      <UpdateStatusModal
        isOpen={Boolean(statusReport)}
        onClose={() => setStatusReport(null)}
        report={statusReport}
        onSubmit={handleStatusUpdate}
        isLoading={statusLoading}
        allowedStatuses={['verified', 'rejected']}
      />

      <AssignWorkerModal
        isOpen={Boolean(assignReport)}
        onClose={() => setAssignReport(null)}
        report={assignReport}
        onSubmit={handleAssign}
        isLoading={assignLoading}
      />
    </div>
  )
}
