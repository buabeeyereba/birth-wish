import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Heart,
  Trash,
  EyeSlash,
  Eye,
  MagnifyingGlass,
  Envelope,
  Sparkle,
  BookOpen,
} from '@phosphor-icons/react'
import { Glass, SectionHeader, Chip, Button, Sheet, Input, EmptyState, Skeleton, Avatar, Badge } from '../ui'
import { useToast } from '../ui/Toast'
import { stagger, item, spring } from '../../lib/motion'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { toneEmoji } from '../public/WishCard'
import { WishReader } from './WishReader'
import { waUrl, birthdayShareText } from '../../lib/share'
import type { Wish, Guest, PageType } from '../../lib/types'

type WishRow = Wish & { guests: Pick<Guest, 'name' | 'relation'> | null }

type WishesSectionProps = {
  celebrationId: string
  celebrantName: string
  pageType: PageType
  shareUrl: string
  theme: string
}

type Filter = 'all' | 'public' | 'private' | 'favorites'
const PAGE_SIZE = 20

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

function lastSeenKey(id: string): string {
  return `birthwish:lastseen:${id}`
}

function formatExact(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export function WishesSection({ celebrationId, celebrantName, pageType, shareUrl, theme }: WishesSectionProps) {
  const { toast } = useToast()
  const [wishes, setWishes] = useState<WishRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<WishRow | null>(null)
  const [newCount, setNewCount] = useState(0)
  const [readerOpen, setReaderOpen] = useState(false)
  const newMarker = useRef<Set<string>>(new Set())

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      const base = () =>
        supabase
          .from('wishes')
          .select('*, guests(name, relation)', { count: 'exact' })
          .eq('celebration_id', celebrationId)
          .order('created_at', { ascending: false })
      const { data, count, error: err } = await base().limit(PAGE_SIZE)
      if (!active) return
      if (err) {
        setError(err.message)
      } else {
        const rows = (data as unknown as WishRow[]) ?? []
        setWishes(rows)
        setTotal(count ?? rows.length)
        setHasMore(rows.length === PAGE_SIZE)
        const now = Date.now()
        let unseen = 0
        for (const w of rows) {
          const last = Number(localStorage.getItem(lastSeenKey(w.id)) ?? 0)
          if (last < new Date(w.created_at).getTime() && new Date(w.created_at).getTime() <= now) {
            newMarker.current.add(w.id)
            unseen += 1
          }
        }
        setNewCount(unseen)
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [celebrationId])

  useEffect(() => {
    const channel = supabase
      .channel(`dash-wishes-${celebrationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wishes', filter: `celebration_id=eq.${celebrationId}` },
        (payload) => {
          const row = payload.new as WishRow
          newMarker.current.add(row.id)
          setNewCount((n) => n + 1)
          setTotal((t) => t + 1)
          setWishes((prev) => {
            if (prev.some((w) => w.id === row.id)) return prev
            if (filter === 'private' && row.is_public) return prev
            if (filter === 'public' && !row.is_public) return prev
            if (search && !row.message.toLowerCase().includes(search.toLowerCase())) return prev
            return [row, ...prev]
          })
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [celebrationId, filter, search])

  const filtered = useMemo(() => {
    let rows = wishes
    if (filter === 'public') rows = rows.filter((w) => w.is_public)
    else if (filter === 'private') rows = rows.filter((w) => !w.is_public)
    else if (filter === 'favorites') rows = rows.filter((w) => w.is_favorite)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (w) =>
          w.message.toLowerCase().includes(q) ||
          (w.guests?.name ?? '').toLowerCase().includes(q),
      )
    }
    return rows
  }, [wishes, filter, search])

  async function loadMore() {
    const from = wishes.length
    const { data, error: err } = await supabase
      .from('wishes')
      .select('*, guests(name, relation)')
      .eq('celebration_id', celebrationId)
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

  async function optimistic(id: string, patch: Partial<WishRow>, message: string) {
    const prev = wishes
    setWishes((list) => list.map((w) => (w.id === id ? { ...w, ...patch } : w)))
    if (patch.is_favorite !== undefined && selected?.id === id) {
      setSelected((s) => (s ? { ...s, ...patch } : s))
    }
    const { error: err } = await supabase.from('wishes').update(patch).eq('id', id)
    if (err) {
      setWishes(prev)
      toast('Could not save that change', 'error')
      return
    }
    toast(message, 'success')
  }

  function markSeen(id: string) {
    localStorage.setItem(lastSeenKey(id), String(Date.now()))
    if (newMarker.current.has(id)) {
      newMarker.current.delete(id)
      setNewCount((n) => Math.max(0, n - 1))
    }
  }

  const openWish = useCallback(
    (w: WishRow) => {
      markSeen(w.id)
      setSelected(w)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  async function toggleFavorite(w: WishRow) {
    await optimistic(w.id, { is_favorite: !w.is_favorite }, w.is_favorite ? 'Removed from favourites' : 'Added to favourites')
  }

  async function toggleHidden(w: WishRow) {
    await optimistic(w.id, { is_hidden: !w.is_hidden }, w.is_hidden ? 'Wish is visible again' : 'Wish hidden')
  }

  async function removeWish(w: WishRow) {
    const { error: err } = await supabase.from('wishes').delete().eq('id', w.id)
    if (err) {
      toast('Could not delete that wish', 'error')
      return
    }
    setWishes((list) => list.filter((x) => x.id !== w.id))
    setTotal((t) => Math.max(0, t - 1))
    if (selected?.id === w.id) setSelected(null)
    toast('Wish deleted', 'success')
  }

  const [confirmDelete, setConfirmDelete] = useState(false)

  async function deleteWithConfirm() {
    if (!selected) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await removeWish(selected)
    setConfirmDelete(false)
    setSelected(null)
  }

  function shareWhatsApp() {
    const text = birthdayShareText(pageType, celebrantName, shareUrl)
    window.open(waUrl(text), '_blank', 'noopener')
  }

  const realShown = filtered.filter((w) => !w.is_hidden)

  return (
    <section aria-labelledby="dash-wishes-title">
      <SectionHeader
        eyebrow="Wishes"
        title={`${total} ${total === 1 ? 'wish' : 'wishes'} for ${celebrantName}`}
        caption="Tap a wish to see who sent it and manage it."
        action={
          <div className="flex items-center gap-2">
            {newCount > 0 && <Badge tone="new">+{newCount} new</Badge>}
            {realShown.length > 0 && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<BookOpen weight="duotone" />}
                onClick={() => setReaderOpen(true)}
              >
                Read all
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All'],
              ['public', 'Public'],
              ['private', 'Private'],
              ['favorites', 'Favourites'],
            ] as [Filter, string][]
          ).map(([value, label]) => (
            <Chip key={value} selected={filter === value} onClick={() => setFilter(value)}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="sm:w-56">
          <Input
            placeholder="Search wishes or names"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<MagnifyingGlass weight="duotone" size={18} />}
            aria-label="Search wishes"
          />
        </div>
      </div>

      <div className="mt-5">
        {loading && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 w-full" radius={16} />
            <Skeleton className="h-28 w-full" radius={16} />
          </div>
        )}

        {!loading && error && (
          <Glass level={1} className="rounded-[var(--r-md)] p-5 text-sm text-[var(--danger)]">
            Could not load wishes: {error}
          </Glass>
        )}

        {!loading && !error && realShown.length === 0 && (
          <Glass className="rounded-[var(--r-lg)]">
            <EmptyState
              icon={<Envelope weight="duotone" />}
              title={total === 0 ? 'No wishes yet' : 'No wishes match'}
              description={
                total === 0
                  ? 'Every wish left on your page will appear here.'
                  : 'Try a different filter or search.'
              }
              action={
                total === 0 ? (
                  <Button
                    variant="whatsapp"
                    size="md"
                    leftIcon={<Sparkle />}
                    onClick={shareWhatsApp}
                  >
                    Share your link
                  </Button>
                ) : undefined
              }
            />
          </Glass>
        )}

        {!loading && !error && realShown.length > 0 && (
          <motion.div
            className="grid gap-3 sm:grid-cols-2"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {realShown.map((w) => {
              const isNew = newMarker.current.has(w.id)
              const name = w.guests?.name
              return (
                <motion.button
                  key={w.id}
                  type="button"
                  variants={item}
                  onClick={() => openWish(w)}
                  className="relative flex min-h-[112px] justify-start gap-3 rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition-colors hover:bg-[var(--glass-2)]"
                >
                  {isNew && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--gold)] px-2 py-0.5 text-[11px] font-bold text-[var(--bg-0)]">
                      New
                    </span>
                  )}
                  <span className="shrink-0 text-xl" aria-hidden="true">
                    {toneEmoji(w.tone)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-3 block text-[15px] leading-relaxed text-[var(--ink-1)]">
                      {w.message}
                    </span>
                    <span className="mt-1.5 block text-sm text-[var(--ink-2)]">
                      {name ? `From ${name}` : 'Anonymous'}
                      <span className="ml-1 text-xs opacity-70">· {relativeTime(w.created_at)}</span>
                    </span>
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}

        {!loading && hasMore && (
          <div className="mt-5 flex justify-center">
            <Button variant="secondary" size="md" onClick={loadMore}>
              Show more
            </Button>
          </div>
        )}
      </div>

      <Sheet
        open={!!selected}
        onClose={() => {
          setConfirmDelete(false)
          setSelected(null)
        }}
        title={selected ? 'Wish' : ''}
      >
        {selected && (
          <div>
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, scale: 0.6, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="shrink-0"
                >
                  <Avatar
                    name={selected.guests?.name ?? 'Anonymous'}
                    size={52}
                    ring={selected.is_favorite}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight text-[var(--ink-1)]">
                  {selected.guests?.name ? `From ${selected.guests.name}` : 'Anonymous'}
                </p>
                <p className="text-sm text-[var(--ink-3)]">
                  {selected.guests?.relation ?? 'No relation given'} ·{' '}
                  {formatExact(selected.created_at)}
                </p>
              </div>
              <span className="text-2xl" aria-hidden="true">
                {toneEmoji(selected.tone)}
              </span>
            </div>

            <div className="mt-4 rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass-2)] p-4">
              <p className="whitespace-pre-wrap font-display text-lg italic leading-relaxed text-[var(--ink-1)]">
                {selected.message}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={selected.is_public ? 'live' : 'private'}>
                {selected.is_public ? 'Public' : 'Private'}
              </Badge>
              {selected.is_favorite && <Badge tone="new">Favourite</Badge>}
              {selected.is_hidden && <Badge tone="hidden">Hidden</Badge>}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button
                variant={selected.is_favorite ? 'secondary' : 'ghost'}
                size="md"
                leftIcon={<Heart weight={selected.is_favorite ? 'fill' : 'duotone'} />}
                onClick={() => toggleFavorite(selected)}
              >
                Favourite
              </Button>
              <Button
                variant={selected.is_hidden ? 'primary' : 'ghost'}
                size="md"
                leftIcon={selected.is_hidden ? <Eye weight="duotone" /> : <EyeSlash weight="duotone" />}
                onClick={() => toggleHidden(selected)}
              >
                {selected.is_hidden ? 'Show on wall' : 'Hide from wall'}
              </Button>
              <Button variant="ghost" size="md" disabled leftIcon={<Sparkle weight="duotone" />}>
                Thank-you card
              </Button>
              <Button
                variant={confirmDelete ? 'danger' : 'ghost'}
                size="md"
                leftIcon={<Trash weight={confirmDelete ? 'fill' : 'duotone'} />}
                onClick={deleteWithConfirm}
              >
                {confirmDelete ? 'Confirm delete?' : 'Delete'}
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      <WishReader
        open={readerOpen}
        wishes={realShown}
        theme={theme}
        onClose={() => setReaderOpen(false)}
        onToggleFavorite={(w) => toggleFavorite(w)}
      />
    </section>
  )
}
