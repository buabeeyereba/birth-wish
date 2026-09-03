import { cn } from '../../lib/cn'

type SkeletonProps = {
  className?: string
  style?: React.CSSProperties
  radius?: number
}

export function Skeleton({ className, style, radius }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton relative overflow-hidden bg-[var(--glass-2)]',
        className,
      )}
      style={{
        backgroundImage:
          'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.08) 50%, transparent 80%)',
        backgroundSize: '200% 100%',
        animation: 'bw-shimmer 1.6s linear infinite',
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
