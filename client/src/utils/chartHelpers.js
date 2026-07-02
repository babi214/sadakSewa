import { REPORT_STATUSES } from './constants'
import { formatStatus } from './formatters'

const STATUS_COLORS = {
  pending: '#F59E0B',
  verified: '#2563EB',
  in_progress: '#64748B',
  resolved: '#10B981',
  rejected: '#EF4444',
}

export function buildStatusChartData(stats = {}) {
  return REPORT_STATUSES.map((status) => ({
    key: status,
    label: formatStatus(status),
    value: stats[status] ?? stats[status === 'in_progress' ? 'inProgress' : status] ?? 0,
    color: STATUS_COLORS[status],
  })).filter((item) => item.value > 0)
}

export function buildWeeklyTrend(reports = []) {
  const days = []
  const now = new Date()

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDay = new Date(date)
    nextDay.setDate(date.getDate() + 1)

    const count = reports.filter((report) => {
      const created = new Date(report.createdAt)
      return created >= date && created < nextDay
    }).length

    days.push({
      label: date.toLocaleDateString('en-NP', { weekday: 'short' }),
      value: count,
      date: date.toISOString(),
    })
  }

  return days
}

export { STATUS_COLORS }
