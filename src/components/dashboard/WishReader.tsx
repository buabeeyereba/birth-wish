import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Heart, X, ArrowLeft, ArrowRight, Play, Pause } from '@phosphor-icons/react'
import { Avatar } from '../ui'
import { toneEmoji } from '../public/WishCard'
import { spring } from '../../lib/motion'
import type { Wish, Guest } from '../../lib/types'

type WishRow = Wish & { guests: Pick<Guest, 'name' | 'relation'> | null }

function lastSeenKey(id: string): string {
  return `birthwish:lastseen:${id}`
}

type WishReaderProps = {
  open: boolean
  wishes: WishRow[]
  theme: string
  onClose: () => void
  onToggleFavorite: (w: WishRow) => void
}

const AUTOPLAY_MS = 8000

export function WishReader({ open, wishes, theme, onClose, onToggleFavorite }: WishReaderProps) {
  const prefersReduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [playing, setPlaying] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const id = open ? wishes[index]?.id : undefined

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, wishes.length])

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(1, wishes.length))
    setRevealed(false)
  }, [wishes.length])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + wishes.length) % Math.max(1, wishes.length))
    setRevealed(false)
  }, [wishes.length])

  useEffect(() => {
    if (!open) return
    setRevealed(false)
    const revealTimer = window.setTimeout(() => setRevealed(true), 600)
    setIndex((i) => Math.min(i, Math.max(0, wishes.length - 1)))
    return () => window.clearTimeout(revealTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, wishes.length])

  useEffect(() => {
    if (!open || !playing || prefersReduced) return
    const t = window.setTimeout(next, AUTOPLAY_MS)
    return () => window.clearTimeout(t)
  }, [open, playing, prefersReduced, index, next])

  useEffect(() => {
    if (!id || !open) return
    const last = Number(localStorage.getItem(lastSeenKey(id)) ?? 0)
    if (last < new Date(wishes[index]?.created_at ?? 0).getTime()) {
      localStorage.setItem(lastSeenKey(id), String(Date.now()))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open])

  useEffect(() => {
    if (!open || typeof document === 'undefined') return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const wish = wishes[index]

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div ref={ref} className="fixed inset-0 z-[60] flex flex-col" data-theme={theme}>
      <AmbientShell />
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reader"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--glass)] text-[var(--ink-1)]"
        >
          <X size={20} weight="duotone" />
        </button>
        <div className="flex items-center gap-1.5">
          {wishes.map((w, i) => (
            <span
              key={w.id}
              className={
                i === index
                  ? 'h-2 w-6 rounded-full bg-[var(--gold)] transition-all'
                  : 'h-2 w-2 rounded-full bg-[var(--glass-3)]'
              }
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause autoplay' : 'Play autoplay'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--glass)] text-[var(--ink-1)]"
        >
          {playing ? <Pause size={20} weight="duotone" /> : <Play size={20} weight="duotone" />}
        </button>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-4">
        <AnimatePresence mode="wait">
          {wish && (
            <motion.div
              key={wish.id}
              initial={prefersReduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -24 }}
              transition={spring}
              className="mx-auto flex w-full max-w-md flex-col items-center text-center"
            >
              <span className="mb-6 text-3xl" aria-hidden="true">
                {toneEmoji(wish.tone)}
              </span>
              <p className="min-h-[10rem] whitespace-pre-wrap font-display text-[28px] italic leading-snug text-[var(--ink-1)]">
                {wish.message}
              </p>

              <div className="mt-10 flex flex-col items-center gap-2">
                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={spring}
                      className="flex flex-col items-center gap-2"
                    >
                      <Avatar
                        name={wish.guests?.name ?? 'Anonymous'}
                        size={52}
                        ring={wish.is_favorite}
                      />
                      <p className="text-[15px] font-semibold text-[var(--ink-1)]">
                        {wish.guests?.name ? `From ${wish.guests.name}` : 'Anonymous'}
                        {wish.guests?.relation ? ` · ${wish.guests.relation}` : ''}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="relative z-10 flex items-center justify-between px-5 py-5">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous wish"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--glass)] text-[var(--ink-1)]"
        >
          <ArrowLeft size={20} weight="duotone" />
        </button>
        {wish && (
          <button
            type="button"
            onClick={() => onToggleFavorite(wish)}
            className="inline-flex h-11 w-14 items-center justify-center rounded-full bg-[var(--glass)] text-[var(--gold)]"
            aria-label="Favourite"
            aria-pressed={wish.is_favorite}
          >
            <Heart size={20} weight={wish.is_favorite ? 'fill' : 'duotone'} />
          </button>
        )}
        <button
          type="button"
          onClick={next}
          aria-label="Next wish"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--glass)] text-[var(--ink-1)]"
        >
          <ArrowRight size={20} weight="duotone" />
        </button>
      </footer>

      <p className="relative z-10 pb-6 text-center text-sm text-[var(--ink-3)]">
        {index + 1} of {wishes.length}
      </p>
    </div>,
    document.body,
  )
}

function AmbientShell() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'var(--bg-0)' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 20% 10%, var(--ember) 0%, transparent 60%), radial-gradient(50% 45% at 85% 30%, var(--gold) 0%, transparent 55%)',
        }}
      />
    </div>
  )
}
