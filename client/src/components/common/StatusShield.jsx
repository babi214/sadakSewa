import { Shield } from 'lucide-react'

const statusColors = {
  pending: 'bg-status-pending',
  verified: 'bg-status-verified',
  in_progress: 'bg-status-in-progress',
  resolved: 'bg-status-resolved',
  rejected: 'bg-status-rejected',
}

const statusIcons = {
  pending: null,
  verified: null,
  in_progress: null,
  resolved: null,
  rejected: null,
}

export default function StatusShield({ status, size = 'md', className = '' }) {
  const key = status?.toLowerCase()
  const colorClass = statusColors[key] || 'bg-muted'

  const sizes = {
    sm: 'status-shield status-shield--sm',
    md: 'status-shield',
    lg: 'status-shield status-shield--lg',
  }

  return (
    <span
      className={`${sizes[size]} ${colorClass} ${className}`}
      aria-label={`Status: ${key}`}
    />
  )
}

export function ShieldDot({ status, className = '' }) {
  const key = status?.toLowerCase()
  const colorClass = statusColors[key] || 'bg-muted'

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass} ${className}`}
      aria-hidden="true"
    />
  )
}
