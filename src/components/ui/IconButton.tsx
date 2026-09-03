import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  variant?: 'ghost' | 'secondary' | 'danger'
  size?: 'md' | 'lg'
  active?: boolean
  children: ReactNode
}

const variantClasses = {
  ghost:
    'text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--glass)]',
  secondary:
    'bg-[var(--glass)] text-[var(--ink-1)] border border-[var(--glass-border)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-[var(--glass-2)]',
  danger: 'text-[var(--danger)] hover:bg-[var(--danger)]/10',
}

const sizeClasses = {
  md: 'h-[44px] w-[44px]',
  lg: 'h-[52px] w-[52px]',
}

export function IconButton({
  label,
  variant = 'ghost',
  size = 'md',
  active = false,
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[var(--r-sm)] transition-colors',
        'active:scale-[0.96]',
        variantClasses[variant],
        sizeClasses[size],
        active && 'text-[var(--gold)]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
