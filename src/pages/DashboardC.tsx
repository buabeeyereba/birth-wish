import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowSquareOut,
  EyeSlash,
  Eye,
  Gift as GiftIcon,
  Heart,
  EnvelopeSimple,
  Trash,
  LinkSimple,
  Check,
} from '@phosphor-icons/react'
import {
  AmbientBackground,
  Glass,
  Button,
  IconButton,
  Skeleton,
  EmptyState,
  SectionHeader,
  Divider,
  Badge,
  useToast,
} from '../components/ui'
import { APP_NAME } from '../lib/brand'
import { supabase } from '../lib/supabase'
import type { Celebration, WishTone } from '../lib/types'

type Status = 'loading' | 'missing' | 'error' | 'ready'

type WishRow = {
  id: string
  message: string
  tone: WishTone | null
  is_public: boolean
  is_hidden: boolean
  is_favorite: boolean
  created_at: string
  guests: { name: string } | null
}

type AnonymousRow = {
  id: string
  message: string
  is_opened: boolean
  created_on: string
}

function toneEmoji(tone: WishTone | null): string {
  if (tone === 'prayer') return '🙏'
  if (tone === 'heartfelt') return '❤️'
  if (tone === 'funny') return '😂'
  return '💛'
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

export function DashboardC() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  const [wishes, setWishes] = useState<WishRow[]>([])
  const [wishesLoading, setWishesLoading] = useState(true)

  const [anonymous, setAnonymous] = useState<AnonymousRow[]>([])
  const [anonLoading, setAnonLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setStatus('missing')
      return
    }
    let active = true
    supabase
      .from('celebrations')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setStatus('error')
          return
        }
        if (!data) {
          setStatus('missing')
          return
        }
        setCelebration(data as Celebration)
        setStatus('ready')
      })
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (status !== 'ready' || !celebration) return
    let active = true
    setWishesLoading(true)
    supabase
      .from('wishes')
      .select('*, guests(name)')
      .eq('celebration_id', celebration.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!active) return
        setWishes((data as unknown as WishRow[]) ?? [])
        setWishesLoading(false)
      })
    return () => {
      active = false
    }
  }, [status, celebration?.id])

  useEffect(() => {
    if (status !== 'ready' || !celebration) return
    let active = true
    setAnonLoading(true)
    supabase
      .from('anonymous_messages')
      .select('*')
      .eq('celebration_id', celebration.id)
      .order('created_on', { ascending: false })
      .then(({ data }) => {
        if (!active) return
        setAnonymous((data as unknown as AnonymousRow[]) ?? [])
        setAnonLoading(false)
      })
    return () => {
      active = false
    }
  }, [status, celebration?.id])

  if (status === 'loading') {
    return (
      <AmbientBackground className="min-h-svh">
        <div className="mx-auto w-full max-w-[760px] px-5 py-6">
          <Skeleton className="h-9 w-44" radius={14} />
          <div className="mt-6 flex flex-col gap-4">
            <Skeleton className="h-24 w-full" radius={20} />
            <Skeleton className="h-24 w-full" radius={20} />
          </div>
        </div>
      </AmbientBackground>
    )
  }

  if (status === 'missing') {
    return (
      <AmbientBackground className="min-h-svh">
        <div className="mx-auto w-full max-w-[760px] px-5 py-6">
          <Glass className="rounded-[var(--r-lg)]">
            <EmptyState
              icon={<GiftIcon weight="duotone" />}
              title="We couldn't find that page"
              description="It may have been removed or the link is wrong."
              action={
                <Button size="md" onClick={() => navigate('/dashboard')}>
                  Back to dashboard
                </Button>
              }
            />
          </Glass>
        </div>
      </AmbientBackground>
    )
  }

  if (status === 'error' || !celebration) {
    return (
      <AmbientBackground className="min-h-svh">
        <div className="mx-auto w-full max-w-[760px] px-5 py-6">
          <Glass level={1} className="rounded-[var(--r-md)] p-6 text-sm text-[var(--danger)]">
            Couldn't load this page.
          </Glass>
        </div>
      </AmbientBackground>
    )
  }

  const url = `${window.location.origin}/${celebration.slug}`
  const title =
    celebration.page_type === 'someone_else'
      ? `Surprise page for ${celebration.name}`
      : `${celebration.name}'s page`
  const openedCount = anonymous.filter((a) => a.is_opened).length

  async function toggleFavorite(w: WishRow) {
    const next = !w.is_favorite
    setWishes((ws) => ws.map((x) => (x.id === w.id ? { ...x, is_favorite: next } : x)))
    const { error } = await supabase
      .from('wishes')
      .update({ is_favorite: next })
      .eq('id', w.id)
    if (error) {
      toast("Couldn't update that wish", 'error')
      setWishes((ws) => ws.map((x) => (x.id === w.id ? { ...x, is_favorite: !next } : x)))
    } else {
      toast(next ? 'Favourited' : 'Removed from favourites', 'success')
    }
  }

  async function toggleHidden(w: WishRow) {
    const next = !w.is_hidden
    setWishes((ws) => ws.map((x) => (x.id === w.id ? { ...x, is_hidden: next } : x)))
    const { error } = await supabase
      .from('wishes')
      .update({ is_hidden: next })
      .eq('id', w.id)
    if (error) {
      toast("Couldn't change this wish", 'error')
      setWishes((ws) => ws.map((x) => (x.id === w.id ? { ...x, is_hidden: !next } : x)))
    } else {
      toast(next ? 'Wish hidden from the wall' : 'Wish visible again', 'success')
    }
  }

  async function deleteAnonymous(a: AnonymousRow) {
    setAnonymous((as) => as.filter((x) => x.id !== a.id))
    const { error } = await supabase.from('anonymous_messages').delete().eq('id', a.id)
    if (error) {
      toast("Couldn't delete that message", 'error')
      return
    }
    toast('Deleted', 'success')
  }

  return (
    <AmbientBackground>
      <div className="mx-auto w-full max-w-[760px] px-5 pb-16">
        <header className="flex items-center gap-3 py-5">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-sm)] bg-[var(--glass)] text-[var(--ink-1)] transition-colors hover:bg-[var(--glass-2)]"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} weight="duotone" />
          </button>
          <div className="min-w-0">
            <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-[var(--ink-1)]">
              {APP_NAME}
              <Badge tone={celebration.is_published ? 'live' : 'hidden'}>
                {celebration.is_published ? 'Live' : 'Hidden'}
              </Badge>
            </span>
            <p className="truncate text-sm text-[var(--ink-3)]">Manage. {celebration.name}</p>
          </div>
        </header>

        <Glass className="rounded-[var(--r-lg)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-[28px] leading-tight text-[var(--ink-1)]">{title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--ink-2)]">
                <LinkSimple size={16} weight="duotone" className="text-[var(--gold)]" />
                <span className="truncate">{url}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--ink-1)]"
              >
                <Button variant="secondary" size="md" leftIcon={<ArrowSquareOut weight="duotone" />}>
                  Open page
                </Button>
              </a>
            </div>
          </div>
        </Glass>

        <main className="mt-8 flex flex-col gap-8">
          {/* Wishes */}
          <section aria-label="Wishes">
            <SectionHeader
              eyebrow="Wishes"
              title={
                <>
                  {wishes.length > 0 ? (
                    <>
                      {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'} for{' '}
                      <em className="text-[var(--gold)]">{celebration.name}</em>
                    </>
                  ) : (
                    <>Wishes</>
                  )}
                </>
              }
              caption="Favourite the ones that matter and hide anything you don't want on the wall."
            />

            <Divider className="my-4" />

            {wishesLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-24 w-full" radius={20} />
                <Skeleton className="h-24 w-full" radius={20} />
              </div>
            ) : wishes.length === 0 ? (
              <Glass className="rounded-[var(--r-lg)]">
                <EmptyState
                  icon={<GiftIcon weight="duotone" />}
                  title="No wishes yet"
                  description="Share your page and the wishes will start rolling in."
                />
              </Glass>
            ) : (
              <div className="flex flex-col gap-3">
                {wishes.map((w) => (
                  <Glass
                    key={w.id}
                    className={w.is_hidden ? 'rounded-[var(--r-md)] opacity-60' : 'rounded-[var(--r-md)]'}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="text-xl" aria-hidden="true">
                            {toneEmoji(w.tone)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[15px] leading-relaxed text-[var(--ink-1)]">
                              {w.message}
                            </p>
                            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-[var(--ink-2)]">
                              <span className="font-semibold">{w.guests?.name ?? 'Anonymous'}</span>
                              <span className="text-xs text-[var(--ink-3)]">
                                · {relativeTime(w.created_at)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <IconButton
                            label={w.is_favorite ? 'Remove favourite' : 'Favourite'}
                            active={w.is_favorite}
                            onClick={() => toggleFavorite(w)}
                          >
                            <Heart size={20} weight={w.is_favorite ? 'duotone' : 'regular'} />
                          </IconButton>
                          <IconButton
                            label={w.is_hidden ? 'Show on wall' : 'Hide from wall'}
                            active={w.is_hidden}
                            onClick={() => toggleHidden(w)}
                          >
                            {w.is_hidden ? (
                              <Eye size={20} weight="duotone" />
                            ) : (
                              <EyeSlash size={20} weight="duotone" />
                            )}
                          </IconButton>
                        </div>
                      </div>
                      {!w.is_public && (
                        <span className="mt-2 inline-block text-xs text-[var(--ink-3)]">
                          Private to {celebration.name}
                        </span>
                      )}
                    </div>
                  </Glass>
                ))}
              </div>
            )}
          </section>

          {/* Anonymous */}
          <section aria-label="Anonymous messages">
            <SectionHeader
              eyebrow="Anonymous messages"
              title={
                <>
                  {anonymous.length > 0 ? (
                    <>
                      {openedCount} of {anonymous.length} delivered
                    </>
                  ) : (
                    <>Anonymous messages</>
                  )}
                </>
              }
              caption="These come in with no name attached. You can only read and delete them."
            />

            <Divider className="my-4" />

            {anonLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-24 w-full" radius={20} />
                <Skeleton className="h-24 w-full" radius={20} />
              </div>
            ) : anonymous.length === 0 ? (
              <Glass className="rounded-[var(--r-lg)]">
                <EmptyState
                  icon={<EnvelopeSimple weight="duotone" />}
                  title="No anonymous messages yet"
                  description="Friends can send one without leaving a name."
                />
              </Glass>
            ) : (
              <div className="flex flex-col gap-3">
                {anonymous.map((a) => (
                  <Glass key={a.id} className="rounded-[var(--r-md)]">
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <EnvelopeSimple
                          size={22}
                          weight={a.is_opened ? 'duotone' : 'fill'}
                          className={a.is_opened ? 'mt-0.5 text-[var(--ink-3)]' : 'mt-0.5 text-[var(--gold)]'}
                        />
                        <div className="min-w-0">
                          <p className="text-[15px] leading-relaxed text-[var(--ink-1)]">
                            {a.message}
                          </p>
                          <p className="mt-1.5 text-xs text-[var(--ink-3)]">{a.created_on}</p>
                        </div>
                      </div>
                      <IconButton
                        label="Delete message"
                        variant="danger"
                        onClick={() => deleteAnonymous(a)}
                      >
                        <Trash size={20} weight="duotone" />
                      </IconButton>
                    </div>
                  </Glass>
                ))}
                {openedCount < anonymous.length && (
                  <p className="flex items-center gap-1.5 px-1 text-xs text-[var(--ink-3)]">
                    <Check size={14} weight="bold" className="text-[var(--gold)]" />
                    New sealed messages appear gold until you open this page.
                  </p>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </AmbientBackground>
  )
}