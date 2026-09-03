import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Cake, Plus, SignOut, User, List, WhatsappLogo, Fire } from '@phosphor-icons/react'
import {
  AmbientBackground,
  Glass,
  Button,
  IconButton,
  Sheet,
  Skeleton,
  EmptyState,
  Segmented,
} from '../components/ui'
import { CelebrationCard } from '../components/CelebrationCard'
import { LivePageSheet } from '../components/LivePageSheet'
import { StatsRow } from '../components/dashboard/StatsRow'
import { WishesSection } from '../components/dashboard/WishesSection'
import { AnonymousSection } from '../components/dashboard/AnonymousSection'
import { SetupChecklist } from '../components/dashboard/SetupChecklist'
import { useAuth } from '../lib/auth'
import { APP_NAME } from '../lib/brand'
import { supabase } from '../lib/supabase'
import { dateBanner } from '../lib/dates'
import { waUrl, birthdayShareText } from '../lib/share'
import type { Celebration } from '../lib/types'

const PAGE_KEY = 'birthwish:dashboard:page'

function todayCopy(
  banner: { kind: 'today' | 'upcoming' | 'passed'; days: number },
  celebrantName: string,
  wishCount: number,
): string {
  const count = `${wishCount} ${wishCount === 1 ? 'wish' : 'wishes'}`
  if (banner.kind === 'today') return `It's ${celebrantName}'s day! ${count} so far`
  if (banner.kind === 'upcoming') {
    return `${banner.days} ${banner.days === 1 ? 'day' : 'days'} to go · ${count} waiting`
  }
  return `Your birthday was ${banner.days} ${banner.days === 1 ? 'day' : 'days'} ago · ${count} waiting`
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [celebrations, setCelebrations] = useState<Celebration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [liveSheet, setLiveSheet] = useState<Celebration | null>(
    (location.state as { published?: Celebration } | null)?.published ?? null,
  )
  const [wishCount, setWishCount] = useState<number | null>(null)
  const [anonCount, setAnonCount] = useState<number | null>(null)
  const [sparkline, setSparkline] = useState<number[] | null>(null)

  useEffect(() => {
    if (!user) return
    const userId = user.id
    let active = true
    async function load() {
      const { data, error: err } = await supabase
        .from('celebrations')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
      if (!active) return
      if (err) {
        setError(err.message)
      } else {
        setCelebrations(data ?? [])
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  const origin = window.location.origin

  const activeId = useMemo(() => {
    if (celebrations.length === 0) return null
    const stored = localStorage.getItem(PAGE_KEY)
    if (stored && celebrations.some((c) => c.id === stored)) return stored
    return celebrations[0].id
  }, [celebrations])

  const activeCelebration = useMemo(
    () => celebrations.find((c) => c.id === activeId) ?? null,
    [celebrations, activeId],
  )

  function setActivePage(id: string) {
    localStorage.setItem(PAGE_KEY, id)
  }

  useEffect(() => {
    setWishCount(null)
    setAnonCount(null)
    setSparkline(null)
    const celeb = activeCelebration
    if (!celeb) return
    const celebId = celeb.id
    const tz = celeb.timezone || 'UTC'
    let active = true
    async function load() {
      const days: string[][] = []
      for (let d = 6; d >= 0; d--) {
        const day = new Date()
        day.setUTCDate(day.getUTCDate() - d)
        const key = day.toISOString().slice(0, 10)
        const next = new Date(day)
        next.setUTCDate(next.getUTCDate() + 1)
        const nextKey = next.toISOString().slice(0, 10)
        days.push([
          `${key} 00:00:00`,
          `${nextKey} 00:00:00`,
        ])
      }

      const [wishRes, anonRes, sparkRes] = await Promise.all([
        supabase
          .from('wishes')
          .select('id', { count: 'exact', head: true })
          .eq('celebration_id', celebId),
        supabase
          .from('anonymous_messages')
          .select('id', { count: 'exact', head: true })
          .eq('celebration_id', celebId),
        supabase
          .from('wishes')
          .select('created_at')
          .eq('celebration_id', celebId)
          .gte('created_at', `${days[0][0]}`)
          .lte('created_at', `${days[6][1]}`),
      ])
      if (!active) return
      setWishCount(wishRes.count)
      setAnonCount(anonRes.count)
      const rows = (sparkRes.data ?? []) as { created_at: string }[]
      const dayKey = (dt: Date) => {
        try {
          return new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          }).format(dt)
        } catch {
          return dt.toISOString().slice(0, 10)
        }
      }
      const dayLabels = days.map(([start]) => dayKey(new Date(start)))
      const perDay = dayLabels.map(() => 0)
      for (const row of rows) {
        const idx = dayLabels.indexOf(dayKey(new Date(row.created_at)))
        if (idx >= 0) perDay[idx] += 1
      }
      setSparkline(perDay)
    }
    load()
    return () => {
      active = false
    }
  }, [activeCelebration?.id])

  const pageSwitcher = useMemo(() => {
    if (!celebrations || celebrations.length < 2) return null
    return (
      <div className="mt-4">
        <Segmented
          value={activeId ?? ''}
          onChange={setActivePage}
          label="Choose a page"
          options={celebrations.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>
    )
  }, [celebrations, activeId])

  const navItems = (
    <>
      <Button
        variant="ghost"
        size="md"
        leftIcon={<User weight="duotone" />}
        onClick={() => navigate('/dashboard/account')}
      >
        Account
      </Button>
      <Button
        variant="secondary"
        size="md"
        leftIcon={<Plus weight="duotone" />}
        onClick={() => navigate('/dashboard/new')}
      >
        New page
      </Button>
      <Button variant="ghost" size="md" leftIcon={<SignOut weight="duotone" />} onClick={signOut}>
        Sign out
      </Button>
    </>
  )

  return (
    <AmbientBackground>
      <div className="mx-auto w-full max-w-[760px] px-5 pb-16">
        <header className="flex items-center justify-between gap-3 py-5">
          <a href="/" className="flex items-center gap-2 text-[var(--ink-1)]">
            <Cake size={24} weight="duotone" className="text-[var(--gold)]" />
            <span className="text-lg font-extrabold tracking-tight">{APP_NAME}</span>
          </a>
          <div className="hidden items-center gap-2 sm:flex">{navItems}</div>
          <div className="sm:hidden">
            <IconButton label="Menu" onClick={() => setMenuOpen(true)}>
              <List size={20} weight="duotone" />
            </IconButton>
          </div>
        </header>

        <main className="mt-4">
          <span className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--gold)]">
            Your dashboard
          </span>
          <p className="mt-1 text-sm text-[var(--ink-3)]">{user?.email}</p>

          {loading && (
            <div className="mt-8 flex flex-col gap-4">
              <Skeleton className="h-32 w-full" radius={20} />
              <Skeleton className="h-32 w-full" radius={20} />
            </div>
          )}

          {!loading && error && (
            <Glass level={1} className="mt-8 rounded-[var(--r-md)] p-6 text-sm text-[var(--danger)]">
              Couldn&apos;t load your pages: {error}
            </Glass>
          )}

          {!loading && !error && celebrations.length === 0 && (
            <div className="mt-8">
              <Glass className="rounded-[var(--r-lg)]">
                <EmptyState
                  icon={<Cake weight="duotone" />}
                  title="Create your birthday page in 2 minutes"
                  description="Photos, a wish wall, and one link to share."
                  action={
                    <Button size="lg" onClick={() => navigate('/dashboard/new')}>
                      Create your birthday page
                    </Button>
                  }
                />
              </Glass>
            </div>
          )}

          {!loading && !error && celebrations.length > 0 && (
            <>
              {pageSwitcher}
              <div className="mt-6 flex flex-col gap-4">
                {celebrations.map((c) => (
                  <CelebrationCard
                    key={c.id}
                    celebration={c}
                    origin={origin}
                    onManage={(id) => navigate(`/dashboard/c/${id}`)}
                  />
                ))}
              </div>

              {activeCelebration && (
                <div className="mt-8 flex flex-col gap-10">
                  {(() => {
                    const banner = dateBanner(
                      activeCelebration.birthday,
                      activeCelebration.timezone,
                    )
                    if (!banner) return null
                    const url = `${origin}/${activeCelebration.slug}`
                    return (
                      <Glass level={2} className="rounded-[var(--r-lg)] p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            {banner.kind === 'today' ? (
                              <Fire size={22} weight="duotone" className="mt-0.5 shrink-0 text-[var(--gold)]" />
                            ) : (
                              <span className="font-display shrink-0 text-[40px] leading-none text-[var(--gold)]">
                                {banner.kind === 'upcoming'
                                  ? banner.days
                                  : `-${banner.days}`}
                              </span>
                            )}
                            <div>
                              <p
                                className="font-display text-[20px] leading-tight text-[var(--ink-1)]"
                                style={
                                  banner.kind === 'today'
                                    ? { fontStyle: 'italic' }
                                    : undefined
                                }
                              >
                                {banner.kind === 'today'
                                  ? `It's today!`
                                  : todayCopy(banner, activeCelebration.name, wishCount ?? 0)}
                              </p>
                              {banner.kind === 'today' && (
                                <p className="text-sm text-[var(--ink-2)]">
                                  {todayCopy(banner, activeCelebration.name, wishCount ?? 0)}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="whatsapp"
                            size="md"
                            leftIcon={<WhatsappLogo weight="fill" />}
                            onClick={() =>
                              window.open(
                                waUrl(birthdayShareText(activeCelebration.page_type, activeCelebration.name, url)),
                                '_blank',
                                'noopener',
                              )
                            }
                          >
                            Share on WhatsApp
                          </Button>
                        </div>
                      </Glass>
                    )
                  })()}

                  <SetupChecklist
                    celebration={activeCelebration}
                    wishCount={wishCount ?? 0}
                    onHide={() => {}}
                  />

                  <StatsRow
                    viewCount={activeCelebration.view_count}
                    wishCount={wishCount}
                    anonCount={anonCount}
                    shareCount={activeCelebration.share_count}
                    loading={loading}
                    sparkline={sparkline}
                  />

                  <div className="grid gap-10 md:grid-cols-12">
                    <div className="md:col-span-7">
                      <WishesSection
                        celebrationId={activeCelebration.id}
                        celebrantName={activeCelebration.name}
                        pageType={activeCelebration.page_type}
                        shareUrl={`${origin}/${activeCelebration.slug}`}
                        theme={activeCelebration.theme}
                      />
                    </div>
                    <div className="md:col-span-5">
                      <AnonymousSection celebrationId={activeCelebration.id} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <div className="flex flex-col gap-3">{navItems}</div>
      </Sheet>

      <LivePageSheet celebration={liveSheet} onClose={() => setLiveSheet(null)} />
    </AmbientBackground>
  )
}
