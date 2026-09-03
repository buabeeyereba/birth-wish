import type { ElementType, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type GlassLevel = 1 | 2 | 3

type GlassProps = {
  level?: GlassLevel
  blur?: boolean
  as?: ElementType
  className?: string
  children?: ReactNode
}

const levelBg: Record<GlassLevel, string> = {
  1: 'var(--glass)',
  2: 'var(--glass-2)',
  3: 'var(--glass-3)',
}

export function Glass({
  level = 1,
  blur = true,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: GlassProps & Record<string, unknown>) {
  return (
    <Tag
      className={cn(
        'relative border border-[var(--glass-border)]',
        'bg-[var(--glass)]',
        level === 2 && 'bg-[var(--glass-2)]',
        level === 3 && 'bg-[var(--glass-3)]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]',
        blur && 'glass-blur backdrop-blur-[var(--glass-blur)]',
        className,
      )}
      style={{ '--glass-bg': levelBg[level] } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  )
}
