const colorMap = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: 'text-primary',
  },
  accent: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    icon: 'text-accent',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    icon: 'text-warning',
  },
  danger: {
    bg: 'bg-danger/10',
    text: 'text-danger',
    icon: 'text-danger',
  },
  secondary: {
    bg: 'bg-secondary/5',
    text: 'text-secondary',
    icon: 'text-secondary',
  },
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  index = 0,
}) {
  const colors = colorMap[color] || colorMap.primary

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colors.bg}`}>
          {Icon && <Icon strokeWidth={1.5} className={`h-5 w-5 ${colors.icon}`} />}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? 'text-accent' : 'text-danger'}`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className={`mt-4 text-3xl font-bold ${colors.text}`}>{value}</p>
      <p className="mt-1 text-sm text-muted">{title}</p>
    </div>
  )
}
