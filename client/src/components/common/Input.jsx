import { forwardRef } from 'react'

const baseInputClasses = [
  'w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-secondary',
  'placeholder:text-muted/60 transition-all duration-200',
  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
  'disabled:cursor-not-allowed disabled:bg-background disabled:opacity-60',
].join(' ')

export function FormField({ label, error, hint, required, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

export const Input = forwardRef(function Input(
  { className = '', error, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={[
        baseInputClasses,
        error && 'border-danger/50 focus:border-danger focus:ring-danger/20',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})

export const Textarea = forwardRef(function Textarea(
  { className = '', error, rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={[
        baseInputClasses,
        'resize-none',
        error && 'border-danger/50 focus:border-danger focus:ring-danger/20',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select(
  { className = '', error, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={[
        baseInputClasses,
        'cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236f777d%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
        error && 'border-danger/50 focus:border-danger focus:ring-danger/20',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </select>
  )
})
