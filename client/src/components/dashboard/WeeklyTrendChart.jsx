import Card, { CardHeader } from '../common/Card'
import { buildWeeklyTrend } from '../../utils/chartHelpers'

const BAR_AREA_HEIGHT = 160

export default function WeeklyTrendChart({
  reports = [],
  title = 'Weekly Activity',
  subtitle,
}) {
  const data = buildWeeklyTrend(reports)
  const max = Math.max(...data.map((d) => d.value), 1)
  const hasData = data.some((d) => d.value > 0)

  return (
    <Card padding="md" className="h-full">
      <CardHeader title={title} subtitle={subtitle} />

      <div className="mt-8 flex h-52 items-end justify-between gap-2 px-1">
        {data.map((day) => {
          const barHeight =
            day.value > 0
              ? Math.max((day.value / max) * BAR_AREA_HEIGHT, 20)
              : 6

          return (
            <div
              key={day.date}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-xs font-medium text-secondary">{day.value}</span>
              <div
                className="flex w-full max-w-10 items-end justify-center"
                style={{ height: BAR_AREA_HEIGHT }}
              >
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/40 transition-all duration-500"
                  style={{ height: barHeight }}
                  title={`${day.value} report(s)`}
                />
              </div>
              <span className="text-[10px] text-muted">{day.label}</span>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        {hasData
          ? 'Reports submitted in the last 7 days'
          : 'No reports in the last 7 days'}
      </p>
    </Card>
  )
}
