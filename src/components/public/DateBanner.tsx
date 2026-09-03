import { dateBanner } from '../../lib/dates'

type DateBannerProps = {
  birthday?: string | null
  timezone: string
}

export function DateBanner({ birthday, timezone }: DateBannerProps) {
  const banner = dateBanner(birthday, timezone)
  if (!banner) return null

  if (banner.kind === 'today') {
    return (
      <p className="rounded-full bg-[var(--glass-3)] px-4 py-1.5 text-sm font-semibold text-[var(--ink-1)]">
        🎉 It&apos;s today!
      </p>
    )
  }
  if (banner.kind === 'upcoming') {
    return (
      <p className="rounded-full bg-[var(--glass-3)] px-4 py-1.5 text-sm font-semibold text-[var(--ink-1)]">
        🎈 {banner.days} {banner.days === 1 ? 'day' : 'days'} to go
      </p>
    )
  }
  return (
    <p className="rounded-full bg-[var(--glass-3)] px-4 py-1.5 text-sm font-semibold text-[var(--ink-1)]">
      🎂 Was {banner.days} {banner.days === 1 ? 'day' : 'days'} ago. There is still time to send love
    </p>
  )
}
