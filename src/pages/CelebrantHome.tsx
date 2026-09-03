import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { getWish } from '../lib/guest'
import { headlineFallback, introFallback, madeWithLove } from '../lib/copy'
import type { Celebration } from '../lib/types'
import { PublicPage } from '../components/public/PublicPage'
import { DateBanner } from '../components/public/DateBanner'
import { Gallery } from '../components/public/Gallery'
import { GiftCard } from '../components/public/GiftCard'
import { VideoCard } from '../components/VideoCard'
import { FooterCTA } from '../components/public/FooterCTA'
import { WishCard, type WishRow } from '../components/public/WishCard'

export function CelebrantHome({ slug }: { slug: string }) {
  return (
    <PublicPage slug={slug}>
      {(celebration) => <HomeContent celebration={celebration} />}
    </PublicPage>
  )
}

function HomeContent({ celebration }: { celebration: Celebration }) {
  const { user } = useAuth()
  const [previews, setPreviews] = useState<WishRow[]>([])
  const [wishCount, setWishCount] = useState<number | null>(null)
  const alreadySent = useMemo(() => getWish(celebration.slug), [celebration.slug])

  useEffect(() => {
    const key = `birthwish:viewed:${celebration.slug}:${todayKey()}`
    if (localStorage.getItem(key)) return
    if (user && user.id === celebration.owner_id) return
    supabase.rpc('bump_counter', { p_slug: celebration.slug, p_kind: 'view' }).then(() => {
      localStorage.setItem(key, '1')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebration.slug, celebration.owner_id, user])

  useEffect(() => {
    if (!celebration.show_wall) return
    let active = true
    supabase
      .from('wishes')
      .select('*, guests(name)')
      .eq('celebration_id', celebration.id)
      .filter('is_hidden', 'eq', false)
      .filter('is_public', 'eq', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (!active) return
        setPreviews((data as unknown as WishRow[]) ?? [])
      })
    supabase
      .from('wishes')
      .select('id', { count: 'exact', head: true })
      .eq('celebration_id', celebration.id)
      .filter('is_hidden', 'eq', false)
      .filter('is_public', 'eq', true)
      .then(({ count }) => {
        if (active) setWishCount(count)
      })
    return () => {
      active = false
    }
  }, [celebration.id, celebration.show_wall])

  const cover = celebration.photos[0]
  const headline = celebration.headline || headlineFallback(celebration.page_type, celebration.name)
  const intro = celebration.intro || introFallback(celebration.page_type, celebration.name, celebration.creator_name)
  const badge = madeWithLove(celebration.creator_name)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--glass-border)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
        {cover ? (
          <img src={cover.url} alt="" className="h-72 w-full object-cover" />
        ) : (
          <div className="grid h-72 w-full place-items-center ambient-base" style={{ backgroundImage: 'radial-gradient(560px 360px at 50% 0%, rgba(232,193,112,0.4), transparent 65%), radial-gradient(500px 400px at 85% 100%, rgba(255,122,89,0.3), transparent 60%)' }}>
            <span className="font-display text-7xl text-[var(--ink-1)]">
              {celebration.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <DateBanner birthday={celebration.birthday} timezone={celebration.timezone} />
          <h1 className="mt-2 font-display text-3xl leading-tight text-white">
            {celebration.name}
          </h1>
          {badge && (
            <p className="mt-1 text-sm text-white/90">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                {badge}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Words */}
      <div className="mt-5 text-center">
        <h2 className="font-display text-xl text-[var(--ink-1)]">
          {headline}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[var(--ink-2)]">
          {intro}
        </p>
      </div>

      {/* Video */}
      {celebration.video && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-[var(--ink-1)]">
            {celebration.page_type === 'someone_else'
              ? `🎥 A little something about ${celebration.name}`
              : `🎥 A message from ${celebration.name}`}
          </h3>
          <VideoCard video={celebration.video} name={celebration.name} />
        </div>
      )}

      {/* Gallery */}
      {celebration.photos.length > 0 && (
        <div className="mt-6">
          <Gallery photos={celebration.photos} />
        </div>
      )}

      {/* Wall preview */}
      {celebration.show_wall && (
        <div className="mt-8">
          {wishCount !== null && wishCount > 0 && (
            <p className="text-sm font-semibold text-[var(--ink-1)]">
              {wishCount} {wishCount === 1 ? 'person has' : 'people have'} sent wishes
            </p>
          )}
          {previews.length > 0 && (
            <div className="mt-3 flex flex-col gap-3">
              {previews.map((w) => (
                <WishCard key={w.id} wish={w} compact />
              ))}
            </div>
          )}
          {(previews.length > 0 || (wishCount ?? 0) > 0) && (
            <Link
              to={`/${celebration.slug}/wall`}
              className="mt-3 inline-block text-sm font-semibold text-[var(--accent)] underline underline-offset-2"
            >
              See all wishes
            </Link>
          )}
        </div>
      )}

      {/* Gift */}
      {celebration.gift?.enabled && (
        <div className="mt-6">
          <GiftCard gift={celebration.gift} />
        </div>
      )}

      {/* Sticky CTA */}
      <div className="sticky bottom-3 z-20 mt-8">
        <div className="flex flex-col gap-2 rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass-3)] p-2 shadow-[var(--shadow-float)] glass-blur-3 backdrop-blur-[var(--glass-blur)]">
          {alreadySent ? (
            <Link
              to={`/${celebration.slug}/card`}
              className="w-full rounded-[var(--r-sm)] bg-[var(--accent)] px-4 py-3.5 text-center text-base font-semibold text-[var(--on-accent)]"
            >
              Wish sent. Make your share card
            </Link>
          ) : celebration.accepting_wishes ? (
            <Link
              to={`/${celebration.slug}/wish`}
              className="w-full rounded-[var(--r-sm)] bg-[var(--accent)] px-4 py-3.5 text-center text-base font-semibold text-[var(--on-accent)]"
            >
              Leave a wish 🎁
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-[var(--r-sm)] bg-[var(--accent)]/40 px-4 py-3.5 text-center text-base font-semibold text-[var(--on-accent)]"
            >
              Wishes are closed 💛
            </button>
          )}
          {celebration.accept_anonymous && (
            <Link
              to={`/${celebration.slug}/anonymous`}
              className="w-full rounded-[var(--r-sm)] bg-[var(--glass-2)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--ink-1)]"
            >
              Send an anonymous message 🤫
            </Link>
          )}
        </div>
      </div>

      <FooterCTA celebration={celebration} />
    </div>
  )
}

function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
