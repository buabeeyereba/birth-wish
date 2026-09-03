import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  leading?: ReactNode
  children: ReactNode
}

export function Chip({ selected = false, leading, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors',
        'border-[var(--glass-border)] text-[var(--ink-2)]',
        selected
          ? 'border-[var(--gold)] bg-[var(--gold)] text-[var(--bg-0)]'
          : 'bg-[var(--glass)] hover:bg-[var(--glass-2)] hover:text-[var(--ink-1)]',
        className,
      )}
      {...rest}
    >
      {leading && <span aria-hidden="true">{leading}</span>}
      {children}
    </button>
  )
}
