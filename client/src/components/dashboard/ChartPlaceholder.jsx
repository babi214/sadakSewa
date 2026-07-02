import { BarChart3 } from 'lucide-react'
import Card, { CardHeader } from '../common/Card'

export default function ChartPlaceholder({ title = 'Reports Overview', subtitle }) {
  const bars = [65, 45, 80, 55, 90, 70, 40]

  return (
    <Card padding="md" className="h-full">
      <CardHeader title={title} subtitle={subtitle} />
      <div className="mt-8 flex h-48 items-end justify-between gap-2 px-2">
        {bars.map((height, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-primary/80 to-primary/30 transition-all duration-500"
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] text-muted">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-background py-3 text-xs text-muted">
        <BarChart3 className="h-4 w-4" />
        Interactive charts coming soon
      </div>
    </Card>
  )
}
