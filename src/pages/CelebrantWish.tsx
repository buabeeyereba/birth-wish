import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { PublicPage } from '../components/public/PublicPage'
import { NameGate } from '../components/public/NameGate'
import { FooterCTA } from '../components/public/FooterCTA'
import { WishCard, type WishRow } from '../components/public/WishCard'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Textarea } from '../components/ui/Textarea'
import { supabase } from '../lib/supabase'
import { clearGuest, getGuest, getWish, saveWish, type StoredGuest } from '../lib/guest'
import type { Celebration, WishTone } from '../lib/types'

const TONES: { value: WishTone; label: string; emoji: string; placeholder: string }[] = [
  { value: 'prayer', label: 'Prayer', emoji: '🙏', placeholder: 'I pray joy, health and every blessing…' },
  { value: 'heartfelt', label: 'Heartfelt', emoji: '❤️', placeholder: 'You mean so much to me…' },
  { value: 'funny', label: 'Funny', emoji: '😂', placeholder: "Another year older, but you don't look a day over…" },
]

export function CelebrantWish({ slug }: { slug: string }) {
  return (
    <PublicPage slug={slug}>
      {(celebration) => <WishContent celebration={celebration} />}
    </PublicPage>
  )
}

function WishContent({ celebration }: { celebration: Celebration }) {
  const [guest, setGuest] = useState<StoredGuest | null>(() => getGuest(celebration.slug))
  const [sent, setSent] = useState(false)

  if (!celebration.accepting_wishes) {
    return (
      <WishClosed celebration={celebration} />
    )
  }

  if (!guest) {
    return (
      <NameGate
        celebration={celebration}
        slug={celebration.slug}
        onComplete={(g) => setGuest(g)}
      />
    )
  }

  return (
    <WishFlow
      celebration={celebration}
      guest={guest}
      sent={sent}
      setSent={setSent}
      onChangeGuest={() => {
        clearGuest(celebration.slug)
        setGuest(null)
      }}
    />
  )
}

function WishClosed({ celebration }: { celebration: Celebration }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="text-5xl" role="img" aria-hidden="true">💛</span>
      <h1 className="mt-4 font-display text-2xl text-[var(--ink-1)]">
        Wishes are closed for now. But you can still <em className="text-[var(--gold)]">read</em> them 💛
      </h1>
      <div className="mt-6 flex flex-col gap-2">
        {celebration.show_wall && (
          <Link
            to={`/${celebration.slug}/wall`}
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--on-accent)]"
          >
            See the wishes
          </Link>
        )}
        <Link to={`/${celebration.slug}`} className="rounded-full border border-[var(--glass-border)] bg-[var(--glass)] px-6 py-3 text-base font-semibold text-[var(--ink-1)]">
          Back to the page
        </Link>
      </div>
      <div className="w-full"><FooterCTA celebration={celebration} /></div>
    </div>
  )
}

type WishFlowProps = {
  celebration: Celebration
  guest: StoredGuest
  sent: boolean
  setSent: (v: boolean) => void
  onChangeGuest: () => void
}

function WishFlow({ celebration, guest, sent, setSent, onChangeGuest }: WishFlowProps) {
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState<WishTone | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const checkDone = useRef(false)

  useEffect(() => {
    if (checkDone.current || !guest) return
    checkDone.current = true
    if (getWish(celebration.slug)) {
      setSent(true)
      return
    }
    supabase
      .from('wishes')
      .select('*')
      .eq('guest_id', guest.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          saveWish(celebration.slug, {
            message: (data as { message: string }).message,
            tone: (data as { tone: WishTone | null }).tone,
            is_public: (data as { is_public: boolean }).is_public,
            created_at: (data as { created_at: string }).created_at,
          })
          setSent(true)
        }
      })
  }, [celebration.slug, guest, setSent])

  const promptQuestion = celebration.wish_prompt

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)
    const trimmed = message.trim()
    if (trimmed.length < 1) {
      setError('Write a little something first')
      return
    }
    setSubmitting(true)
    const payload = {
      celebration_id: celebration.id,
      guest_id: guest.id,
      message: trimmed,
      tone,
      is_public: celebration.show_wall ? isPublic : true,
    }
    const { error: err } = await supabase.from('wishes').insert(payload)
    setSubmitting(false)

    if (err) {
      if (err.code === '23505') {
        saveWish(celebration.slug, {
          message: trimmed,
          tone,
          is_public: payload.is_public,
          created_at: new Date().toISOString(),
        })
        setSent(true)
        return
      }
      if (err.code === '42501') {
        setError('Wishes just closed 💛')
        return
      }
      setError(err.message)
      return
    }

    saveWish(celebration.slug, {
      message: trimmed,
      tone,
      is_public: payload.is_public,
      created_at: new Date().toISOString(),
    })
    setSent(true)
  }

  if (sent) {
    const { message: m, tone: t } = getWish(celebration.slug) ?? {
      message,
      tone,
    }
    return <WishSent celebration={celebration} guest={guest} message={m} tone={t} />
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-[var(--ink-2)]">
          Writing as <span className="font-semibold text-[var(--ink-1)]">{guest.name}</span>{' '}
          {guest.relation ? `(${guest.relation})` : ''}
          <button type="button" onClick={onChangeGuest} className="ml-1 text-[var(--accent)] underline underline-offset-2">
            Not you? Change
          </button>
        </p>
      </div>

      <h1 className="text-center font-display text-2xl text-[var(--ink-1)]">
        {promptQuestion ? (
          <>
            {guestName(celebration.name)} asks: {promptQuestion}
          </>
        ) : (
          <>Leave {guestName(celebration.name)} a <em className="text-[var(--gold)]">wish</em></>
        )}
      </h1>

      <div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tone">
          {TONES.map((t) => (
            <Chip
              key={t.value}
              selected={tone === t.value}
              onClick={() => {
                setTone((cur) => (cur === t.value ? null : t.value))
              }}
            >
              {t.emoji} {t.label}
            </Chip>
          ))}
        </div>
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={600}
        rows={4}
        placeholder={tone ? TONES.find((t) => t.value === tone)!.placeholder : 'Your wish…'}
        autoFocus
        hint={`${message.length}/600`}
        aria-label="Your wish"
      />

      {celebration.show_wall ? (
        <label className="flex items-center gap-2 text-sm text-[var(--ink-1)]">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            Show my wish on the public wall
            <span className="block text-xs text-[var(--ink-2)]">
              Uncheck if it&apos;s just for {guestName(celebration.name)}&apos;s eyes
            </span>
          </span>
        </label>
      ) : null}

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        Send my wish 🎁
      </Button>

      <div className="w-full"><FooterCTA celebration={celebration} /></div>
    </form>
  )
}

function WishSent({
  celebration,
  guest,
  message,
  tone,
}: {
  celebration: Celebration
  guest: StoredGuest
  message: string
  tone: WishTone | null
}) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
  }, [])

  const preview: WishRow = {
    id: 'you',
    message,
    tone,
    created_at: new Date().toISOString(),
    guests: { name: guest.name, relation: guest.relation },
  }

  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-5xl" role="img" aria-hidden="true">🎉</span>
      <h1 className="mt-4 font-display text-2xl text-[var(--ink-1)]">
        Sent. Your wish is on its way to <em className="text-[var(--gold)]">{guestName(celebration.name)}</em>
      </h1>

      <div className="mt-5 w-full text-left">
        <WishCard wish={preview} />
      </div>

      <div className="mt-6 flex w-full flex-col gap-2">
        <Link
          to={`/${celebration.slug}/card`}
          className="rounded-full bg-[var(--accent)] px-6 py-3.5 text-center text-base font-semibold text-[var(--on-accent)]"
        >
          Create my share card ✨
        </Link>
        {celebration.show_wall && (
          <Link
            to={`/${celebration.slug}/wall`}
            className="rounded-full border border-[var(--glass-border)] bg-[var(--glass)] px-6 py-3 text-center text-base font-semibold text-[var(--ink-1)]"
          >
            See everyone&apos;s wishes
          </Link>
        )}
        <Link
          to={`/${celebration.slug}`}
          className="py-1 text-sm text-[var(--ink-2)] underline underline-offset-2"
        >
          Back to the page
        </Link>
      </div>

      <div className="mt-6 w-full"><FooterCTA celebration={celebration} /></div>
    </div>
  )
}

function guestName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}
