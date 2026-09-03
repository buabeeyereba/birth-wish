import type { WishTone } from '../../lib/types'

export function toneEmoji(tone: WishTone | null): string {
  if (tone === 'prayer') return '🙏'
  if (tone === 'heartfelt') return '❤️'
  if (tone === 'funny') return '😂'
  return '💛'
}

export type WishRow = {
  id: string
  message: string
  tone: WishTone | null
  created_at: string
  guests: { name: string; relation?: string | null } | null
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.floor((Date.now() - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export function WishCard({ wish, compact }: { wish: WishRow; compact?: boolean }) {
  const guestName = wish.guests?.name
  const relation = wish.guests?.relation
  const attributed = guestName
    ? relation
      ? `From ${guestName} · ${relation}`
      : `From ${guestName}`
    : 'Anonymous'

  return (
    <div className="rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
      <p className="text-xl">{toneEmoji(wish.tone)}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-1)]">{wish.message}</p>
      <p className="mt-2 text-sm text-[var(--ink-2)]">
        {attributed}
        {!compact && <span className="ml-1 text-xs">· {relativeTime(wish.created_at)}</span>}
      </p>
    </div>
  )
}
