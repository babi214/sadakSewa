import { forwardRef } from 'react'

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/20',
  secondary:
    'bg-secondary text-white hover:bg-secondary-light shadow-sm',
  outline:
    'border border-border bg-white text-secondary hover:bg-background hover:border-primary/30',
  ghost: 'text-secondary hover:bg-secondary/5',
  accent: 'bg-accent text-white hover:bg-accent-dark shadow-sm shadow-accent/20',
  danger: 'bg-danger text-white hover:bg-red-700 shadow-sm',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
})

export default Button
