import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--glass-2)] text-[var(--gold)] [&>svg]:h-7 [&>svg]:w-7">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl text-[var(--ink-1)]">{title}</h3>
      {description && <p className="max-w-sm text-sm text-[var(--ink-3)]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
