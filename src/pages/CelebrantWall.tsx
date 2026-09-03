import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicPage } from '../components/public/PublicPage'
import { FooterCTA } from '../components/public/FooterCTA'
import { WishCard, type WishRow } from '../components/public/WishCard'
import { supabase } from '../lib/supabase'
import { getWish } from '../lib/guest'
import type { Celebration } from '../lib/types'

const PAGE_SIZE = 30

export function CelebrantWall({ slug }: { slug: string }) {
  return (
    <PublicPage slug={slug}>
      {(celebration) => <WallContent celebration={celebration} />}
    </PublicPage>
  )
}

function WallContent({ celebration }: { celebration: Celebration }) {
  const [wishes, setWishes] = useState<WishRow[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const alreadySent = getWish(celebration.slug)

  useEffect(() => {
    let active = true
    setWishes([])
    setLoading(true)
    setError(null)
    supabase
      .from('wishes')
      .select('*, guests(name, relation)', { count: 'exact' })
      .eq('celebration_id', celebration.id)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)
      .then(({ data, count: c, error: err }) => {
        if (!active) return
        if (err) {
          setError(err.message)
          setLoading(false)
          return
        }
        setWishes((data as unknown as WishRow[]) ?? [])
        setCount(c)
        if ((data?.length ?? 0) > 0 && (data?.length ?? 0) === PAGE_SIZE) setHasMore(true)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [celebration.id])

  async function loadMore() {
    const from = wishes.length
    const { data, error: err } = await supabase
      .from('wishes')
      .select('*, guests(name, relation)')
      .eq('celebration_id', celebration.id)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    if (err) return
    const rows = (data as unknown as WishRow[]) ?? []
    setWishes((prev) => {
      const seen = new Set(prev.map((w) => w.id))
      return [...prev, ...rows.filter((w) => !seen.has(w.id))]
    })
    if (rows.length < PAGE_SIZE) setHasMore(false)
  }

  useEffect(() => {
    const channel = supabase
      .channel(`wall-${celebration.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wishes', filter: `celebration_id=eq.${celebration.id}` },
        () => {
          setCount((c) => (c === null ? c : c + 1))
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [celebration.id])

  if (!celebration.show_wall) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <span className="text-5xl" role="img" aria-hidden="true">💌</span>
        <h1 className="mt-4 font-display text-2xl text-[var(--ink-1)]">
          {celebrOne(celebration.name)} is keeping the wishes <em className="text-[var(--gold)]">private</em> 💌
        </h1>
        <Link
          to={`/${celebration.slug}/wish`}
          className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--on-accent)]"
        >
          Leave yours
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-[var(--ink-1)]">
          {count ?? ''} {count === 1 ? 'wish' : 'wishes'} for {celebrOne(celebration.name)}
        </h1>
        {alreadySent ? (
          <span className="text-xs font-semibold text-[var(--success)]">Your wish is in ✓</span>
        ) : (
          <Link to={`/${celebration.slug}/wish`} className="text-sm font-semibold text-[var(--accent)]">
            Add yours
          </Link>
        )}
      </div>

      {loading && (
        <div className="mt-8 flex justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      )}
      {!loading && error && <p className="mt-6 text-center text-sm text-[var(--danger)]">Couldn't load wishes.</p>}

      {!loading && !error && wishes.length === 0 && (
        <div className="mt-10 text-center">
          <p className="text-[var(--ink-2)]">No wishes yet. Be the first!</p>
          <Link
            to={`/${celebration.slug}/wish`}
            className="mt-4 inline-block rounded-full bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--on-accent)]"
          >
            Leave a wish 🎁
          </Link>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {wishes.map((w) => (
          <WishCard key={w.id} wish={w} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          className="mt-4 self-center rounded-full border border-[var(--glass-border)] bg-[var(--glass)] px-6 py-3 text-sm font-semibold text-[var(--ink-1)] transition-colors hover:bg-[var(--glass-2)]"
        >
          Load more
        </button>
      )}

      <div className="mt-8 w-full"><FooterCTA celebration={celebration} /></div>
    </div>
  )
}

function celebrOne(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}
