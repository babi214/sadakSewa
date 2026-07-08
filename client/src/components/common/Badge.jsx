import StatusShield from './StatusShield'

const statusStyles = {
  pending: 'bg-status-pending/10 text-status-pending border-status-pending/25',
  verified: 'bg-status-verified/10 text-status-verified border-status-verified/25',
  in_progress: 'bg-status-in-progress/10 text-status-in-progress border-status-in-progress/25',
  resolved: 'bg-status-resolved/10 text-status-resolved border-status-resolved/25',
  rejected: 'bg-status-rejected/10 text-status-rejected border-status-rejected/25',
}

const severityStyles = {
  low: 'bg-muted/10 text-muted border-muted/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-danger/10 text-danger border-danger/20',
  critical: 'bg-danger/15 text-danger border-danger/30',
}

export function StatusBadge({ status, showShield = true }) {
  const key = status?.toLowerCase()
  const label = key
    ? key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Unknown'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyles[key] || 'bg-secondary/5 text-muted border-border'}`}
    >
      {showShield && <StatusShield status={status} size="sm" />}
      {label}
    </span>
  )
}

export function SeverityBadge({ severity }) {
  const key = severity?.toLowerCase()
  const label = key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Medium'

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${severityStyles[key] || severityStyles.medium}`}
    >
      {label}
    </span>
  )
}

export function CategoryBadge({ category }) {
  const label = category
    ? category.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Other'

  return (
    <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-secondary/70">
      {label}
    </span>
  )
}
