import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type BadgeTone = 'private' | 'hidden' | 'live' | 'neutral' | 'new'

const tones: Record<BadgeTone, string> = {
  private: 'bg-[var(--glass-2)] text-[var(--ink-2)] border border-[var(--glass-border)]',
  hidden: 'bg-[var(--glass-2)] text-[var(--ink-3)] border border-[var(--glass-border)]',
  live: 'bg-[var(--success)] text-[var(--bg-0)]',
  neutral: 'bg-[var(--glass)] text-[var(--ink-2)] border border-[var(--glass-border)]',
  new: 'bg-[var(--gold)] text-[var(--bg-0)]',
}

type BadgeProps = {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
