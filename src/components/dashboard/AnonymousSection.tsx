import { useEffect, useMemo, useRef, useState } from 'react'
import { EnvelopeSimple, LockSimple } from '@phosphor-icons/react'
import { Glass, SectionHeader, Button, EmptyState, Skeleton } from '../ui'
import { useToast } from '../ui/Toast'
import { spring } from '../../lib/motion'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import type { AnonymousMessage } from '../../lib/types'

type AnonRow = AnonymousMessage

type AnonymousSectionProps = {
  celebrationId: string
}

function haptics() {
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }
  nav.vibrate?.(10)
}

function EnvelopeSeal() {
  return (
    <svg
      width={48}
      height={36}
      viewBox="0 0 48 36"
      fill="none"
      aria-hidden="true"
      className="text-[var(--gold)]"
    >
      <path
        d="M4 6a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6Z"
        fill="currentColor"
        opacity="0.25"
      />
      <path
        d="M4 8 24 23 44 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="18" r="4" fill="currentColor" />
      <title>Sealed message</title>
    </svg>
  )
}

export function AnonymousSection({ celebrationId }: AnonymousSectionProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<AnonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([])
  const [opening, setOpening] = useState<string | null>(null)
  const orderInitialized = useRef(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('anonymous_messages')
        .select('*')
        .eq('celebration_id', celebrationId)
        .order('created_on', { ascending: false })
      if (!active) return
      if (err) {
        setError(err.message)
      } else {
        setMessages((data as unknown as AnonRow[]) ?? [])
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [celebrationId])

  const sealable = useMemo(() => messages.filter((m) => !m.is_opened), [messages])

  useEffect(() => {
    if (orderInitialized.current) return
    if (sealable.length === 0) return
    orderInitialized.current = true
    const ids = sealable.map((m) => m.id)
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }
    setShuffledOrder(ids)
  }, [sealable])

  useEffect(() => {
    const channel = supabase
      .channel(`dash-anon-${celebrationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'anonymous_messages', filter: `celebration_id=eq.${celebrationId}` },
        (payload) => {
          setMessages((prev) => {
            const row = payload.new as AnonRow
            if (prev.some((m) => m.id === row.id)) return prev
            return [row, ...prev]
          })
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [celebrationId])

  const sealOrder = useMemo(
    () => shuffledOrder.filter((id) => sealable.some((m) => m.id === id)),
    [shuffledOrder, sealable],
  )

  async function openMessage(id: string) {
    haptics()
    setOpening(id)
    setMessages((prev) => {
      const row = prev.find((m) => m.id === id)
      if (!row) return prev
      return prev.map((m) => (m.id === id ? { ...m, is_opened: true } : m))
    })
    const { error } = await supabase.from('anonymous_messages').update({ is_opened: true }).eq('id', id)
    if (error) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_opened: false } : m)))
      toast('Could not open that message', 'error')
    }
    setOpening((cur) => (cur === id ? null : cur))
  }

  async function removeMessage(id: string) {
    const { error: err } = await supabase.from('anonymous_messages').delete().eq('id', id)
    if (err) {
      toast('Could not delete that message', 'error')
      return
    }
    setMessages((prev) => prev.filter((m) => m.id !== id))
    setShuffledOrder((prev) => prev.filter((x) => x !== id))
    setConfirmDeleteId(null)
    toast('Message deleted', 'success')
  }

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmOpenAll, setConfirmOpenAll] = useState(false)

  const opened = messages.filter((m) => m.is_opened)
  const unopenedCount = sealable.length

  async function openAll() {
    if (!confirmOpenAll) {
      setConfirmOpenAll(true)
      return
    }
    const ids = sealable.map((m) => m.id)
    if (ids.length === 0) return
    haptics()
    setMessages((prev) =>
      prev.map((m) => (sealable.some((x) => x.id === m.id) ? { ...m, is_opened: true } : m)),
    )
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      await new Promise((r) => setTimeout(r, 150 * i))
      haptics()
      await supabase.from('anonymous_messages').update({ is_opened: true }).eq('id', id)
    }
    setConfirmOpenAll(false)
    toast(`Opened ${ids.length} ${ids.length === 1 ? 'message' : 'messages'}`, 'success')
  }

  function formatDay(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(d)
  }

  return (
    <section aria-labelledby="dash-anon-title" className="mt-12">
      <SectionHeader
        eyebrow="Anonymous messages"
        title={
          unopenedCount > 0
            ? `${unopenedCount} sealed ${unopenedCount === 1 ? 'envelope' : 'envelopes'}`
            : 'Anonymous messages'
        }
        caption="Truly anonymous. We never stored who sent these, and the order is random."
        action={
          sealable.length > 1 ? (
            <Button variant="secondary" size="md" leftIcon={<LockSimple weight="duotone" />} onClick={openAll}>
              {confirmOpenAll ? 'Confirm open all?' : `Open all`}
            </Button>
          ) : undefined
        }
      />

      <div className="mt-5">
        {loading && <Skeleton className="h-28 w-full" radius={16} />}

        {!loading && error && (
          <Glass level={1} className="rounded-[var(--r-md)] p-5 text-sm text-[var(--danger)]">
            Could not load messages: {error}
          </Glass>
        )}

        {!loading && !error && messages.length === 0 && (
          <Glass className="rounded-[var(--r-lg)]">
            <EmptyState
              icon={<EnvelopeSimple weight="duotone" />}
              title="No anonymous messages yet"
              description="Secret messages left without a name will appear here as sealed envelopes."
            />
          </Glass>
        )}

        {!loading && !error && messages.length > 0 && (
          <>
            {sealable.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {sealOrder.map((id) => {
                  const m = sealable.find((x) => x.id === id)
                  if (!m) return null
                  const isOpening = opening === id
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      onClick={() => openMessage(id)}
                      animate={isOpening ? { rotateX: [0, -60, 0], scale: 1.04 } : {}}
                      transition={spring}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)] p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition-transform hover:scale-[1.02] hover:bg-[var(--glass-2)]"
                    >
                      <span className="text-[var(--gold)]">
                        <EnvelopeSeal />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">
                        Tap to open
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            )}

            {opened.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[13px] font-bold uppercase tracking-[.12em] text-[var(--gold)]">
                  Opened
                </h3>
                <div className="mt-3 flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {opened.map((m) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={spring}
                        className="flex items-start justify-between gap-3 rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-wrap font-display text-lg italic leading-relaxed text-[var(--ink-1)]">
                            {m.message}
                          </p>
                          <p className="mt-1 text-xs text-[var(--ink-3)]">
                            Opened · {formatDay(m.created_on)}
                          </p>
                        </div>
                        <Button
                          variant={confirmDeleteId === m.id ? 'danger' : 'ghost'}
                          size="sm"
                          onClick={() => {
                            if (confirmDeleteId === m.id) {
                              removeMessage(m.id)
                            } else {
                              setConfirmDeleteId(m.id)
                            }
                          }}
                        >
                          {confirmDeleteId === m.id ? 'Confirm?' : 'Delete'}
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
