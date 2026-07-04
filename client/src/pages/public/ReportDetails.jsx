import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Pencil,
  ThumbsUp,
  Trash2,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card, { CardHeader } from '../../components/common/Card'
import ConfirmModal from '../../components/common/ConfirmModal'
import { ReportCardSkeleton } from '../../components/common/Skeleton'
import { CategoryBadge, SeverityBadge, StatusBadge } from '../../components/common/Badge'
import ReportMap from '../../components/report/ReportMap'
import StatusHistory from '../../components/report/StatusHistory'
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
        <h1 className="text-2xl font-bold text-secondary">Report Not Found</h1>
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

  const isOwner =
    String(report.reportedBy?._id || report.reportedBy) === String(user?._id)
  const canManage = isOwner && report?.status === 'pending'

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
      <Link
        to="/reports"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to reports
      </Link>

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
              leftIcon={<ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />}
              size="sm"
            >
              {upvoteCount} {upvoteCount === 1 ? 'Upvote' : 'Upvotes'}
            </Button>
            {canManage && (
              <>
                <Link to={`/citizen/reports/${id}/edit`}>
                  <Button variant="outline" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              </>
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
                {(report.locationName || report.municipality) && (
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                    {report.locationName && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary" />
                        {report.locationName}
                      </span>
                    )}
                    {report.municipality && (
                      <span>{report.municipality}</span>
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
                  <User className="mt-0.5 h-4 w-4 text-muted" />
                  <div>
                    <dt className="text-xs text-muted">Reported by</dt>
                    <dd className="text-sm font-medium text-secondary">
                      {report.reportedBy?.fullName || 'Anonymous'}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted" />
                  <div>
                    <dt className="text-xs text-muted">Submitted</dt>
                    <dd className="text-sm font-medium text-secondary">
                      {formatDateTime(report.createdAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted" />
                  <div>
                    <dt className="text-xs text-muted">Category</dt>
                    <dd className="text-sm font-medium text-secondary">
                      {formatCategory(report.category)}
                    </dd>
                  </div>
                </div>
                {report.assignedWorker && (
                  <div className="flex items-start gap-2.5">
                    <User className="mt-0.5 h-4 w-4 text-muted" />
                    <div>
                      <dt className="text-xs text-muted">Assigned worker</dt>
                      <dd className="text-sm font-medium text-secondary">
                        {report.assignedWorker.fullName}
                      </dd>
                    </div>
                  </div>
                )}
                {report.resolvedAt && (
                  <div className="flex items-start gap-2.5">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted" />
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
    </div>
  )
}
