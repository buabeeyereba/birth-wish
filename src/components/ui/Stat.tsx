import { cn } from '../../lib/cn'

type StatProps = {
  value: string | number
  caption: string
  className?: string
}

export function Stat({ value, caption, className }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="font-display text-[36px] leading-none text-[var(--ink-1)]">{value}</span>
      <span className="text-sm text-[var(--ink-3)]">{caption}</span>
    </div>
  )
}
