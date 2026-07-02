import Card, { CardHeader } from '../common/Card'
import { buildStatusChartData } from '../../utils/chartHelpers'

export default function StatusBreakdownChart({
  stats,
  title = 'Status Breakdown',
  subtitle,
}) {
  const data = buildStatusChartData(stats)
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <Card padding="md" className="h-full">
      <CardHeader title={title} subtitle={subtitle} />

      {total === 0 ? (
        <div className="mt-8 flex h-48 items-center justify-center text-sm text-muted">
          No data to display yet
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map((item) => (
            <div key={item.key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-secondary">{item.label}</span>
                <span className="text-muted">
                  {item.value}{' '}
                  <span className="text-xs">({Math.round((item.value / total) * 100)}%)</span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(item.value / max) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}

          {/* Donut summary */}
          <div className="mt-6 flex flex-col items-center justify-center gap-6 border-t border-border pt-6 sm:flex-row">
            <div
              className="relative h-24 w-24 shrink-0 rounded-full"
              style={{
                background: total
                  ? `conic-gradient(${data
                      .map((item, i) => {
                        const start = data
                          .slice(0, i)
                          .reduce((s, d) => s + (d.value / total) * 360, 0)
                        const end = start + (item.value / total) * 360
                        return `${item.color} ${start}deg ${end}deg`
                      })
                      .join(', ')})`
                  : '#e2e8f0',
              }}
            >
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white text-center">
                <div>
                  <p className="text-lg font-bold text-secondary">{total}</p>
                  <p className="text-[10px] text-muted">Total</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
