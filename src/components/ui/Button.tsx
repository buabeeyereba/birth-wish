import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--gold)] text-[var(--bg-0)] shadow-[0_10px_30px_-12px_rgba(232,193,112,0.55)] hover:bg-[var(--gold-2)]',
  secondary:
    'bg-[var(--glass)] text-[var(--ink-1)] border border-[var(--glass-border)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-[var(--glass-2)]',
  ghost: 'bg-transparent text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--glass)]',
  danger: 'bg-[var(--danger)] text-[var(--bg-0)] hover:brightness-105',
  whatsapp: 'bg-[#25D366] text-[#04170b] hover:brightness-105',
}

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[40px] text-sm px-4 rounded-[var(--r-sm)]',
  md: 'min-h-[44px] text-sm px-5 rounded-[var(--r-sm)]',
  lg: 'min-h-[52px] text-base px-6 rounded-[var(--r-md)]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold select-none transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : 'w-fit',
        !disabled && !loading && 'active:scale-[0.98]',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {leftIcon && !loading && (
        <span className="shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="whitespace-nowrap">{children}</span>
      {rightIcon && !loading && (
        <span className="shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  )
}
