import { Clock, FileText, ThumbsUp, CheckCircle2, AlertCircle } from 'lucide-react'
import Card, { CardHeader } from '../common/Card'
import { formatDateTime, formatStatus } from '../../utils/formatters'

const actionIcons = {
  created: FileText,
  upvoted: ThumbsUp,
  status_changed: AlertCircle,
  resolved: CheckCircle2,
}

const actionColors = {
  created: 'bg-primary/10 text-primary',
  upvoted: 'bg-accent/10 text-accent',
  status_changed: 'bg-warning/10 text-warning',
  resolved: 'bg-accent/10 text-accent',
}

function buildActivitiesFromReports(reports) {
  return reports.slice(0, 5).map((report) => ({
    id: report._id,
    action: 'created',
    title: report.title,
    detail: `Status: ${formatStatus(report.status)}`,
    time: report.createdAt,
  }))
}

export default function RecentActivity({ reports = [] }) {
  const activities = buildActivitiesFromReports(reports)

  return (
    <Card padding="md" className="h-full">
      <CardHeader
        title="Recent Activity"
        subtitle="Your latest report updates"
      />

      {activities.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-10 w-10 text-muted/40" />
          <p className="mt-3 text-sm text-muted">No activity yet</p>
          <p className="mt-1 text-xs text-muted/70">
            Submit your first report to see updates here
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {activities.map((activity) => {
            const Icon = actionIcons[activity.action] || FileText
            const colorClass = actionColors[activity.action] || actionColors.created

            return (
              <li key={activity.id} className="flex gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-secondary">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted">{activity.detail}</p>
                  <p className="mt-0.5 text-xs text-muted/70">
                    {formatDateTime(activity.time)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
