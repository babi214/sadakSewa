export function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
export function formatDateTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
export function formatStatus(status) {
  if (!status) return 'Unknown'
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
export function formatCategory(category) {
  if (!category) return 'Other'
  return category
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
