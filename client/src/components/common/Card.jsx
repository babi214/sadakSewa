export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  glass = false,
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={[
        'rounded-2xl border border-border bg-white shadow-card',
        glass && 'glass',
        hover && 'transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5',
        paddings[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-secondary">{title}</h3>}
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
