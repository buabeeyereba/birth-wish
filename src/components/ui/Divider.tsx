import { cn } from '../../lib/cn'

type DividerProps = {
  className?: string
}

export function Divider({ className }: DividerProps) {
  return (
    <div
      className={cn('h-px w-full', className)}
      style={{ background: 'linear-gradient(90deg, transparent, rgba(232,193,112,0.35), transparent)' }}
      aria-hidden="true"
    />
  )
}
