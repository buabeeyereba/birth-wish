import { Glass, Stat } from '../ui'
import { Skeleton } from '../ui/Skeleton'
import { Sparkline } from './Sparkline'

type StatsRowProps = {
  viewCount: number | null
  wishCount: number | null
  anonCount: number | null
  shareCount: number | null
  loading: boolean
  sparkline?: number[] | null
}

export function StatsRow({
  viewCount,
  wishCount,
  anonCount,
  shareCount,
  loading,
  sparkline,
}: StatsRowProps) {
  const tiles = [
    { value: viewCount, caption: 'Page views' },
    { value: wishCount, caption: 'Wishes', spark: sparkline ?? null },
    { value: anonCount, caption: 'Anonymous' },
    { value: shareCount, caption: 'Card shares' },
  ]
  const present = tiles.filter((t) => t.value !== null)

  if (loading) {
    return (
      <Glass level={1} className="rounded-[var(--r-lg)] p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" radius={12} />
          ))}
        </div>
      </Glass>
    )
  }

  if (present.length === 0) return null

  return (
    <Glass level={1} className="rounded-[var(--r-lg)] p-5">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {present.map((t) => (
          <div key={t.caption} className="flex flex-col gap-1">
            <Stat value={t.value ?? 0} caption={t.caption} />
            {t.spark && Array.isArray(t.spark) && t.spark.length >= 2 && (
              <Sparkline values={t.spark} />
            )}
          </div>
        ))}
      </div>
    </Glass>
  )
}
