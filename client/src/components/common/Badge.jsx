const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  verified: 'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-accent/10 text-accent border-accent/20',
  rejected: 'bg-danger/10 text-danger border-danger/20',
}

const severityStyles = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-danger/10 text-danger border-danger/20',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

export function StatusBadge({ status }) {
  const key = status?.toLowerCase()
  const label = key
    ? key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Unknown'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[key] || 'bg-secondary/5 text-muted border-border'}`}
    >
      {label}
    </span>
  )
}

export function SeverityBadge({ severity }) {
  const key = severity?.toLowerCase()
  const label = key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Medium'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${severityStyles[key] || severityStyles.medium}`}
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
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-secondary/70">
      {label}
    </span>
  )
}
