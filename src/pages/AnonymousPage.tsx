import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AmbientBackground } from '../components/ui/AmbientBackground'
import { Glass } from '../components/ui/Glass'
import type { Celebration } from '../lib/types'

type Status = 'loading' | 'missing' | 'error' | 'ready' | 'closed'

function EnvelopeSeal() {
  return (
    <svg
      width="88"
      height="76"
      viewBox="0 0 120 100"
      role="img"
      aria-hidden="true"
      className="drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
    >
      {/* envelope back + front */}
      <path d="M10 18 H110 V84 H10 Z" fill="var(--glass-2)" stroke="var(--glass-border)" strokeWidth="2" />
      {/* left + right folded flaps */}
      <path d="M10 18 L60 56 L110 18" fill="none" stroke="var(--glass-border)" strokeWidth="1.5" />
      {/* top flap folded up */}
      <path d="M10 18 L60 56 M110 18 L60 56" fill="none" stroke="var(--glass-border)" strokeWidth="1.5" />
      <path d="M10 18 L60 56 L110 18 Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      {/* bottom seal line */}
      <path d="M10 84 L110 84" stroke="var(--glass-border)" strokeWidth="1.5" />
      {/* wax seal */}
      <circle cx="60" cy="56" r="17" fill="#B3261E" />
      <circle cx="60" cy="56" r="17" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
      <circle cx="60" cy="56" r="13" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
      {/* seal monogram */}
      <text
        x="60"
        y="62"
        textAnchor="middle"
        fontSize="22"
        fill="rgba(255,255,255,0.9)"
        style={{ fontWeight: 800 }}
      >
        ✝
      </text>
    </svg>
  )
}

export function AnonymousPage({ slug }: { slug: string }) {
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let active = true
    supabase
      .from('celebrations')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setStatus('error')
          return
        }
        if (!data || !data.is_published) {
          setStatus('missing')
          return
        }
        setCelebration(data as Celebration)
        setStatus(data.accept_anonymous ? 'ready' : 'closed')
      })
    return () => {
      active = false
    }
  }, [slug])

  if (status === 'loading') {
    return (
      <div data-theme="anonymous">
        <AmbientBackground theme="anonymous" className="grid min-h-svh place-items-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </AmbientBackground>
      </div>
    )
  }

  if (status === 'missing') {
    return (
      <DarkShell>
        <h1 className="font-display text-2xl text-[var(--ink-1)]">
          This page doesn&apos;t exist or isn&apos;t <em className="text-[var(--gold)]">live</em> yet
        </h1>
        <Link to="/" className="mt-6 rounded-full bg-[var(--glass-2)] px-6 py-3 text-[var(--ink-1)]">Back home</Link>
      </DarkShell>
    )
  }

  if (status === 'error' || !celebration) {
    return (
      <DarkShell>
        <p className="text-[var(--ink-2)]">Couldn't load this page.</p>
        <Link to="/" className="mt-4 text-sm text-[var(--ink-2)] underline">Back home</Link>
      </DarkShell>
    )
  }

  if (!celebration.accept_anonymous) {
    return (
      <DarkShell>
        <EnvelopeSeal />
        <h1 className="mt-4 font-display text-2xl text-[var(--ink-1)]">
          {first(celebration.name)} isn&apos;t taking anonymous messages <em className="text-[var(--gold)]">right now</em>
        </h1>
        <Link
          to={`/${celebration.slug}/wish`}
          className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--on-accent)]"
        >
          Leave a normal wish
        </Link>
      </DarkShell>
    )
  }

  return <AnonymousForm celebration={celebration} />
}

function AnonymousForm({ celebration }: { celebration: Celebration }) {
  const [message, setMessage] = useState('')
  const [stage, setStage] = useState<'write' | 'sent'>('write')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const cooldownRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (cooldownRef.current) window.clearInterval(cooldownRef.current)
    }
  }, [])

  async function send(e: FormEvent) {
    e.preventDefault()
    if (sending) return
    const trimmed = message.trim()
    if (!trimmed) {
      setError('Write something first')
      return
    }
    setError(null)
    setSending(true)
    const { error: err } = await supabase.from('anonymous_messages').insert({
      celebration_id: celebration.id,
      message: trimmed,
    })
    setSending(false)

    if (err) {
      setError("Couldn't send that just now. Please try again.")
      return
    }

    setStage('sent')
    setMessage('')
    setCooldown(20)
    cooldownRef.current = window.setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) window.clearInterval(cooldownRef.current)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  return (
    <div data-theme="anonymous">
      <AmbientBackground theme="anonymous" embers>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col min-h-svh px-5 py-10">
          {stage === 'write' ? (
            <>
              <div className="mx-auto">
                <EnvelopeSeal />
              </div>
              <h1 className="mt-4 text-center font-display text-2xl text-[var(--ink-1)]">
                Say it anonymously to <em className="text-[var(--gold)]">{first(celebration.name)}</em>
              </h1>
              <p className="mt-1 text-center text-sm text-[var(--ink-2)]">
                No name needed. Just honest words.
              </p>

              <form onSubmit={send} className="mt-6 flex flex-col gap-3">
                <Glass level={2} className="rounded-[var(--r-md)] p-3">
                  <label htmlFor="anon-message" className="sr-only">
                    Your anonymous message
                  </label>
                  <textarea
                    id="anon-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={1000}
                    rows={5}
                    placeholder="Your message…"
                    className="w-full resize-none rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass)] px-4 py-3 text-[15px] leading-relaxed text-[var(--ink-1)] placeholder:text-[var(--ink-3)] outline-none focus:border-[var(--gold)]"
                  />
                  <div className="mt-1 text-right text-xs text-[var(--ink-3)]">{message.length}/1000</div>

                  {error && <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>}

                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-2 w-full rounded-[var(--r-sm)] bg-[var(--accent)] px-5 py-3.5 text-base font-semibold text-[var(--on-accent)] transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {sending ? 'Sending…' : 'Send anonymously 🤫'}
                  </button>
                </Glass>
              </form>

              <div className="mt-7 rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)] p-5">
                <h2 className="text-sm font-semibold text-[var(--ink-1)]">How this stays anonymous</h2>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[var(--ink-2)]">
                  <li>• We save only the text of your message.</li>
                  <li>• No name, email, phone, IP address or device info is stored with it.</li>
                  <li>• The time is rounded to the day, so it can't be matched to anything else you did here.</li>
                  <li>• {first(celebration.name)} sees the words. Nothing else. Not even we know it was you.</li>
                </ul>
              </div>

              <Link to={`/${celebration.slug}/wish`} className="mt-6 text-center text-sm text-[var(--ink-3)] underline underline-offset-2">
                Leave a normal wish instead
              </Link>
            </>
          ) : (
            <Fade>
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <EnvelopeSeal />
                <h1 className="mt-4 font-display text-2xl text-[var(--ink-1)]">
                  Delivered 🤍. {first(celebration.name)} will read it and will never know <em className="text-[var(--gold)]">who</em> sent it.
                </h1>
                <div className="mt-6 flex w-full flex-col gap-2">
                  <button
                    type="button"
                    disabled={cooldown > 0}
                    onClick={() => setStage('write')}
                    className="w-full rounded-[var(--r-sm)] bg-[var(--accent)] px-5 py-3.5 text-base font-semibold text-[var(--on-accent)] disabled:opacity-60"
                  >
                    {cooldown > 0 ? `Send another (${cooldown}s)` : 'Send another'}
                  </button>
                  <Link
                    to={`/${celebration.slug}/wish`}
                    className="py-2 text-center text-sm text-[var(--ink-3)] underline underline-offset-2"
                  >
                    Leave a normal wish instead
                  </Link>
                </div>
              </div>
            </Fade>
          )}

          <div className="mt-auto pt-8 text-center">
            <p className="text-xs text-[var(--ink-3)]">Got a birthday coming up? Create your own birth-wish page.</p>
            <Link to={`/signup?ref=${celebration.slug}`} className="mt-2 inline-block text-sm text-[var(--ink-2)] underline underline-offset-2">
              Create mine
            </Link>
          </div>
        </div>
      </AmbientBackground>
    </div>
  )
}

function DarkShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="anonymous">
      <AmbientBackground
        theme="anonymous"
        className="flex min-h-svh flex-col items-center justify-center px-6 text-center"
      >
        <div className="max-w-sm">{children}</div>
      </AmbientBackground>
    </div>
  )
}

function Fade({ children }: { children: React.ReactNode }) {
  return <div className="flex-1">{children}</div>
}

function first(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}
