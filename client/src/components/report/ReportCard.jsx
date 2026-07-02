import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Pencil, ThumbsUp, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { CategoryBadge, SeverityBadge, StatusBadge } from '../common/Badge'
import Button from '../common/Button'
import { formatDate } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'
import { reportService } from '../../services/reportService'
import { getApiErrorMessage } from '../../utils/validators'

export default function ReportCard({
  report,
  index = 0,
  showOwnerActions = false,
  onEdit,
  onDelete,
  onUpdate,
}) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const imageUrl = report.images?.[0]?.url || report.images?.[0]
  const upvotes = report.upvoteCount ?? report.upvotes?.length ?? 0

  const hasUpvoted = report.upvotes?.some(
    (uid) => String(uid?._id || uid) === String(user?._id)
  )

  const handleCardClick = () => {
    navigate(`/reports/${report._id}`)
  }

  const handleUpvote = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please log in to upvote')
      navigate('/login', { state: { from: { pathname: `/reports/${report._id}` } } })
      return
    }

    try {
      const response = await reportService.toggleUpvote(report._id)
      if (response.success) {
        onUpdate?.({
          ...report,
          upvoteCount: response.upvoteCount,
          upvotes: response.upvotes,
        })
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upvote'))
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit?.(report)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(report)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/[0.03]" />

      <div className="relative h-40 overflow-hidden bg-background">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={report.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
            <MapPin className="h-10 w-10 text-primary/30" />
          </div>
        )}
        <div className="absolute left-3 top-3 z-20">
          <StatusBadge status={report.status} />
        </div>

        {/* Hover hint */}
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-secondary/0 opacity-0 transition-all duration-300 group-hover:bg-secondary/20 group-hover:opacity-100">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-secondary shadow-sm">
            View details
          </span>
        </div>
      </div>

      <div className="relative z-20 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={report.category} />
          <SeverityBadge severity={report.severity} />
        </div>

        <h3 className="mt-3 line-clamp-1 text-base font-semibold text-secondary group-hover:text-primary">
          {report.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-muted">{report.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          {report.municipality && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {report.municipality}
            </span>
          )}
          {report.locationName && (
            <span className="truncate">{report.locationName}</span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted">{formatDate(report.createdAt)}</span>

          <div className="relative z-30 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUpvote}
              className={[
                'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
                hasUpvoted
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-background hover:text-accent',
              ].join(' ')}
              title={hasUpvoted ? 'Remove upvote' : 'Upvote'}
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
              {upvotes}
            </button>

            {showOwnerActions && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="!px-2 !py-1"
                  onClick={handleEdit}
                  title="Edit report"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="!px-2 !py-1 text-danger hover:bg-red-50 hover:text-danger"
                  onClick={handleDelete}
                  title="Delete report"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
