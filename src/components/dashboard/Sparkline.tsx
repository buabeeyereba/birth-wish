import { useId } from 'react'

type SparklineProps = {
  values: number[]
  height?: number
}

export function Sparkline({ values, height = 32 }: SparklineProps) {
  const id = useId()
  if (!values || values.length < 2) return null
  const w = 120
  const h = height
  const max = Math.max(...values, 1)
  const step = w / (values.length - 1)
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 4) - 2).toFixed(1)}`)
    .join(' ')

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="mt-2 w-full max-w-[120px]"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#spark-${id})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
