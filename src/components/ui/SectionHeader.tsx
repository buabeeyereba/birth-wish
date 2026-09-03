import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type SectionHeaderProps = {
  eyebrow?: string
  title: ReactNode
  caption?: ReactNode
  action?: ReactNode
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  caption,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {eyebrow && (
        <span className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--gold)]">
          {eyebrow}
        </span>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-[26px] leading-[1.2] text-[var(--ink-1)]">{title}</h2>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {caption && <p className="max-w-[65ch] text-sm text-[var(--ink-3)]">{caption}</p>}
    </div>
  )
}
