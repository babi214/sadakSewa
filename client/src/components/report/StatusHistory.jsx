import {
  CheckCircle2,
  FileText,
  UserCheck,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { ShieldDot } from '../common/StatusShield'
import { Skeleton } from '../common/Skeleton'
import { formatDateTime, formatStatus } from '../../utils/formatters'

const actionConfig = {
  created: { icon: FileText, color: 'bg-status-verified/10 text-status-verified', label: 'Report submitted' },
  updated: { icon: RefreshCw, color: 'bg-status-in-progress/10 text-status-in-progress', label: 'Report updated' },
  assigned: { icon: UserCheck, color: 'bg-status-verified/15 text-status-verified', label: 'Worker assigned' },
  status_changed: {
    icon: CheckCircle2,
    color: 'bg-status-resolved/10 text-status-resolved',
    label: 'Status changed',
  },
  deleted: { icon: Trash2, color: 'bg-status-rejected/10 text-status-rejected', label: 'Report deleted' },
}

const actionStatusMap = {
  status_changed: true,
  created: true,
}

function getActionDetail(entry) {
  const { action, details } = entry

  if (action === 'status_changed' && details?.from && details?.to) {
    return `${formatStatus(details.from)} \u2192 ${formatStatus(details.to)}`
  }
  if (action === 'assigned' && details?.workerName) {
    return `Assigned to ${details.workerName}`
  }
  if (action === 'created' && details?.title) {
    return details.title
  }
  return null
}

export default function StatusHistory({ history = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">No history available yet.</p>
    )
  }

  return (
    <ol className="relative space-y-0">
      {history.map((entry, index) => {
        const config = actionConfig[entry.action] || actionConfig.updated
        const Icon = config.icon
        const detail = getActionDetail(entry)
        const isLast = index === history.length - 1
        const showShield = actionStatusMap[entry.action] && entry.details?.to

        return (
          <li key={entry._id} className="relative flex gap-4 pb-6">
            {!isLast && (
              <span className="absolute left-[18px] top-9 h-full w-px bg-border" />
            )}
            <div
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}
            >
              {showShield && entry.details?.to ? (
                <ShieldDot status={entry.details.to} />
              ) : (
                <Icon strokeWidth={1.5} className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-secondary">{config.label}</p>
              {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
              <p className="mt-1 text-xs text-muted">
                {entry.performedBy?.fullName || 'System'} &middot; {formatDateTime(entry.createdAt)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
