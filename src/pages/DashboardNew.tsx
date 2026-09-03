import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CaretRight,
  Check,
  Gift as GiftIcon,
  LinkSimple,
  MaskHappy,
  CircleNotch,
} from '@phosphor-icons/react'
import {
  AmbientBackground,
  Glass,
  Button,
  Input,
  Textarea,
  Select,
  Toggle,
} from '../components/ui'
import { PhotoManager } from '../components/PhotoManager'
import { useAuth } from '../lib/auth'
import { APP_NAME } from '../lib/brand'
import { LIMITS } from '../lib/limits'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/cn'
import type { Gift, Photo, Theme, Video } from '../lib/types'
import { detectTimezone, listTimezones } from '../lib/dates'
import { isReservedSlug, isValidSlug, slugifyName } from '../lib/slug'
import { VideoManager } from '../components/VideoManager'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type PageType = 'self' | 'someone_else'

type GiftForm = {
  title: string
  note: string
  bankName: string
  accountName: string
  accountNumber: string
  link: string
}

type WizardState = {
  pageType: PageType
  name: string
  creatorName: string
  month: string
  day: string
  timezone: string
  headline: string
  intro: string
  wishPrompt: string
  theme: Theme
  photos: Photo[]
  video: Video | null
  giftEnabled: boolean
  gift: GiftForm
  slug: string
  isPublished: boolean
  acceptingWishes: boolean
  acceptAnonymous: boolean
  showWall: boolean
}

const STEPS = [
  { id: 1, title: 'Who is this page for?' },
  { id: 2, title: 'Your words' },
  { id: 3, title: 'Photos and video' },
  { id: 4, title: 'Gift (optional)' },
  { id: 5, title: 'Your link' },
]

const INITIAL: WizardState = {
  pageType: 'self',
  name: '',
  creatorName: '',
  month: '',
  day: '',
  timezone: '',
  headline: '',
  intro: '',
  wishPrompt: '',
  theme: 'sunset',
  photos: [],
  video: null,
  giftEnabled: false,
  gift: { title: '', note: '', bankName: '', accountName: '', accountNumber: '', link: '' },
  slug: '',
  isPublished: true,
  acceptingWishes: true,
  acceptAnonymous: true,
  showWall: true,
}

function defaultHeadline(pageType: PageType, name: string): string {
  return pageType === 'self' ? "It's my birthday! 🎂" : `It's ${name}'s birthday! Help us celebrate 🎂`
}

function defaultIntro(pageType: PageType, name: string, creatorName: string): string {
  if (pageType === 'self') {
    return "Drop a wish or a prayer. It means the world to me. You'll get a card to share too."
  }
  return `${creatorName || 'Your friend'} made this page for ${name}. Drop a wish or a prayer. We'll make sure ${name} sees every one.`
}

function defaultGiftTitle(name: string): string {
  return `Want to bless ${name}? 🎁`
}

const THEME_SWATCHES: Record<Theme, { label: string; blobs: string }> = {
  sunset: {
    label: 'Golden Hour',
    blobs:
      'radial-gradient(circle at 25% 30%, rgba(255,122,89,0.5), transparent 62%), radial-gradient(circle at 75% 70%, rgba(232,193,112,0.4), transparent 62%)',
  },
  midnight: {
    label: 'Midnight',
    blobs:
      'radial-gradient(circle at 25% 30%, rgba(52,84,209,0.5), transparent 62%), radial-gradient(circle at 75% 70%, rgba(47,184,166,0.4), transparent 62%)',
  },
  garden: {
    label: 'Garden',
    blobs:
      'radial-gradient(circle at 25% 30%, rgba(191,227,180,0.6), transparent 62%), radial-gradient(circle at 75% 70%, rgba(249,207,221,0.6), transparent 62%)',
  },
}

function ThemePreview({ theme, selected, onSelect }: { theme: Theme; selected: boolean; onSelect: () => void }) {
  const swatch = THEME_SWATCHES[theme]
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'overflow-hidden rounded-[var(--r-md)] border p-2 text-left transition-colors',
        selected ? 'border-[var(--gold)]' : 'border-[var(--glass-border)]',
      )}
    >
      <div
        className="h-16 w-full rounded-[var(--r-sm)]"
        style={{ backgroundColor: 'var(--bg-0)', backgroundImage: swatch.blobs }}
        aria-hidden="true"
      />
      <div className="flex items-center justify-between px-1 py-2">
        <span className="text-sm font-medium capitalize text-[var(--ink-1)]">{swatch.label}</span>
        {selected && <Check size={16} weight="bold" className="text-[var(--gold)]" />}
      </div>
    </button>
  )
}

export function DashboardNew() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(INITIAL)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [publishing, setPublishing] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [publishError, setPublishError] = useState<string | null>(null)
  const debounceRef = useRef<number | null>(null)

  const timezones = useMemo(() => listTimezones(), [])

  useEffect(() => {
    if (!state.timezone) {
      setState((s) => ({ ...s, timezone: detectTimezone() }))
    }
  }, [state.timezone])

  useEffect(() => {
    if (touched.slug) return
    const derived = slugifyName(state.name)
    if (derived !== state.slug) {
      setState((s) => ({ ...s, slug: derived }))
    }
  }, [state.name, state.slug, touched.slug])

  useEffect(() => {
    const name = state.name.trim()
    if (!touched.headline) {
      setState((s) => ({ ...s, headline: defaultHeadline(state.pageType, name) }))
    }
    if (!touched.intro) {
      setState((s) => ({ ...s, intro: defaultIntro(state.pageType, name, state.creatorName.trim()) }))
    }
    if (!touched.giftTitle && !state.gift.title) {
      setState((s) => ({ ...s, gift: { ...s.gift, title: defaultGiftTitle(name) } }))
    }
  }, [state.pageType, state.name, state.creatorName, touched.headline, touched.intro, touched.giftTitle, state.gift.title])

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    const slug = state.slug.trim()
    if (!isValidSlug(slug) || isReservedSlug(slug)) {
      setSlugStatus(slug.length === 0 ? 'idle' : 'invalid')
      return
    }
    setSlugStatus('checking')
    debounceRef.current = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('slug_available', { candidate: slug })
      if (error) {
        setSlugStatus('idle')
        return
      }
      setSlugStatus(data ? 'available' : 'taken')
    }, 400)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [state.slug])

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((s) => ({ ...s, [key]: value }))
  }

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  const canProceed = (() => {
    if (step === 1) {
      if (!state.name.trim()) return false
      if (state.pageType === 'someone_else' && !state.creatorName.trim()) return false
      return true
    }
    if (step === 3) return state.photos.length > 0
    if (step === 5) return slugStatus === 'available'
    return true
  })()

  function goNext() {
    if (!canProceed) return
    if (step < 5) setStep((s) => s + 1)
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  async function handlePublish() {
    if (slugStatus !== 'available' || !user) return
    setPublishError(null)
    setPublishing(true)

    const giftPayload: Gift | null = state.giftEnabled
      ? {
          enabled: true,
          title: state.gift.title.trim() || `Want to bless ${state.name.trim()}? 🎁`,
          note: state.gift.note.trim() || null,
          bank_name: state.gift.bankName.trim() || null,
          account_name: state.gift.accountName.trim() || null,
          account_number: state.gift.accountNumber.trim() || null,
          link: state.gift.link.trim() || null,
        }
      : null

    const birthday = state.day && state.month ? `2000-${state.month}-${state.day}` : null

    const { data, error } = await supabase
      .from('celebrations')
      .insert({
        owner_id: user.id,
        slug: state.slug.trim(),
        page_type: state.pageType,
        name: state.name.trim(),
        creator_name: state.pageType === 'someone_else' ? state.creatorName.trim() || null : null,
        birthday,
        timezone: state.timezone,
        headline: state.headline.trim() || null,
        intro: state.intro.trim() || null,
        wish_prompt: state.wishPrompt.trim() || null,
        photos: state.photos,
        video: state.video,
        gift: giftPayload,
        theme: state.theme,
        is_published: state.isPublished,
        accepting_wishes: state.acceptingWishes,
        accept_anonymous: state.acceptAnonymous,
        show_wall: state.showWall,
      })
      .select()
      .single()

    setPublishing(false)
    if (error) {
      if (error.code === '23505') {
        setPublishError('That link was just taken, try another.')
      } else {
        setPublishError(error.message)
      }
      return
    }

    navigate('/dashboard', { state: { published: data } })
  }

  const pageHeading = state.pageType === 'self' ? "It's for me 🎂" : 'A surprise page 🎁'

  return (
    <AmbientBackground>
      <div className="mx-auto w-full max-w-[720px] px-5 pb-32">
        <header className="mb-6 flex items-center gap-3 py-5">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-sm)] bg-[var(--glass)] text-[var(--ink-1)] transition-colors hover:bg-[var(--glass-2)]"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} weight="duotone" />
          </button>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-[var(--ink-1)]">
              {APP_NAME}
            </span>
            <p className="text-sm text-[var(--ink-3)]">
              Step {step} of {STEPS.length}. {STEPS[step - 1].title}
            </p>
          </div>
        </header>

        <div className="mb-6">
          <div className="flex h-1 gap-1">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={
                  s.id <= step ? 'flex-1 rounded-full bg-[var(--gold)]' : 'flex-1 rounded-full bg-[var(--glass-border)]'
                }
              />
            ))}
          </div>
          <div className="mt-3">
            <span className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--gold)]">
              {STEPS[step - 1].title}
            </span>
          </div>
        </div>

        <Glass level={1} className="rounded-[var(--r-lg)] p-6">
          {step === 1 && (
            <section>
              <h1 className="font-display text-[26px] text-[var(--ink-1)]">{pageHeading}</h1>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    markTouched('pageType')
                    update('pageType', 'self')
                  }}
                  aria-pressed={state.pageType === 'self'}
                  className={cn(
                    'flex flex-col gap-2 rounded-[var(--r-md)] border p-4 text-left transition-colors',
                    state.pageType === 'self'
                      ? 'border-[var(--gold)] bg-[var(--glass-2)]'
                      : 'border-[var(--glass-border)] bg-[var(--glass)] hover:bg-[var(--glass-2)]',
                  )}
                >
                  <MaskHappy size={28} weight="fill" className="text-[var(--gold)]" />
                  <span className="text-sm font-semibold text-[var(--ink-1)]">
                    Me. It&apos;s my birthday 🎂
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markTouched('pageType')
                    update('pageType', 'someone_else')
                  }}
                  aria-pressed={state.pageType === 'someone_else'}
                  className={cn(
                    'flex flex-col gap-2 rounded-[var(--r-md)] border p-4 text-left transition-colors',
                    state.pageType === 'someone_else'
                      ? 'border-[var(--gold)] bg-[var(--glass-2)]'
                      : 'border-[var(--glass-border)] bg-[var(--glass)] hover:bg-[var(--glass-2)]',
                  )}
                >
                  <GiftIcon size={28} weight="fill" className="text-[var(--gold)]" />
                  <span className="text-sm font-semibold text-[var(--ink-1)]">
                    Someone else. A surprise page 🎁
                  </span>
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <Input
                  label="Celebrant's name"
                  value={state.name}
                  maxLength={60}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Ada"
                />
                {state.pageType === 'someone_else' && (
                  <Input
                    label="Your name (shown as 'made with love by …')"
                    value={state.creatorName}
                    maxLength={60}
                    onChange={(e) => update('creatorName', e.target.value)}
                    placeholder="e.g. Chidi (the surprise-maker)"
                  />
                )}

                <div>
                  <span className="mb-1.5 block text-[13px] font-bold uppercase tracking-[.08em] text-[var(--ink-1)]">
                    Birthday
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      aria-label="Month"
                      value={state.month}
                      onChange={(e) => update('month', e.target.value)}
                      options={[
                        { value: '', label: 'Month' },
                        ...MONTHS.map((m, i) => ({
                          value: String(i + 1).padStart(2, '0'),
                          label: m,
                        })),
                      ]}
                    />
                    <Select
                      aria-label="Day"
                      value={state.day}
                      onChange={(e) => update('day', e.target.value)}
                      options={[
                        { value: '', label: 'Day' },
                        ...Array.from({ length: 31 }, (_, i) => ({
                          value: String(i + 1).padStart(2, '0'),
                          label: String(i + 1),
                        })),
                      ]}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--ink-3)]">
                    We only ever show the day and month.
                  </p>
                </div>

                <div>
                  <span className="mb-1.5 block text-[13px] font-bold uppercase tracking-[.08em] text-[var(--ink-1)]">
                    Timezone
                  </span>
                  <Select
                    value={state.timezone}
                    onChange={(e) => update('timezone', e.target.value)}
                    options={timezones}
                  />
                  <p className="mt-1.5 text-xs text-[var(--ink-3)]">
                    So the page says &quot;It&apos;s today!&quot; at the right midnight.
                  </p>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h1 className="font-display text-[26px] text-[var(--ink-1)]">Your words</h1>
              <div className="mt-4 flex flex-col gap-4">
                <Input
                  label="Headline"
                  value={state.headline}
                  maxLength={120}
                  onChange={(e) => {
                    markTouched('headline')
                    update('headline', e.target.value)
                  }}
                />
                <Textarea
                  label="Intro"
                  value={state.intro}
                  maxLength={400}
                  rows={4}
                  onChange={(e) => {
                    markTouched('intro')
                    update('intro', e.target.value)
                  }}
                />
                <Input
                  label="Wish prompt (optional)"
                  value={state.wishPrompt}
                  maxLength={160}
                  onChange={(e) => update('wishPrompt', e.target.value)}
                  placeholder="What's your favourite memory of us? / One prayer for my new year?"
                />
                <p className="text-xs text-[var(--ink-3)]">
                  This shows as the question above the wish box.
                </p>
                <div>
                  <span className="mb-2 block text-[13px] font-bold uppercase tracking-[.08em] text-[var(--ink-1)]">
                    Theme
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(THEME_SWATCHES) as Theme[]).map((t) => (
                      <ThemePreview
                        key={t}
                        theme={t}
                        selected={state.theme === t}
                        onSelect={() => update('theme', t)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h1 className="font-display text-[26px] text-[var(--ink-1)]">Photos and video</h1>
              <p className="mt-1 text-sm text-[var(--ink-3)]">
                Up to {LIMITS.maxPhotos} photos and one {LIMITS.videoMaxSeconds}-second video.
              </p>
              <div className="mt-4">
                {user && (
                  <PhotoManager
                    userId={user.id}
                    photos={state.photos}
                    onChange={(photos) => update('photos', photos)}
                    maxPhotos={LIMITS.maxPhotos}
                  />
                )}
              </div>
              {state.photos.length === 0 && (
                <p className="mt-3 text-center text-sm text-[var(--ink-3)]">
                  Add at least one photo to continue.
                </p>
              )}
              <div className="mt-4">
                <span className="mb-1.5 block text-[13px] font-bold uppercase tracking-[.08em] text-[var(--ink-1)]">
                  Video
                </span>
                {user && (
                  <VideoManager
                    userId={user.id}
                    video={state.video}
                    onChange={(video) => update('video', video)}
                  />
                )}
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <h1 className="font-display text-[26px] text-[var(--ink-1)]">Gift (optional)</h1>
              <div className="mt-3">
                <Toggle
                  checked={state.giftEnabled}
                  onChange={(v) => update('giftEnabled', v)}
                  label="Let friends send a gift 🎁"
                  description="Show banking or a payment link on your page."
                />
              </div>

              {state.giftEnabled && (
                <div className="mt-4 flex flex-col gap-4">
                  <Input
                    label="Title"
                    value={state.gift.title}
                    maxLength={80}
                    onChange={(e) => {
                      markTouched('giftTitle')
                      update('gift', { ...state.gift, title: e.target.value })
                    }}
                  />
                  <Input
                    label="Note"
                    value={state.gift.note}
                    maxLength={200}
                    onChange={(e) => update('gift', { ...state.gift, note: e.target.value })}
                    placeholder="Totally optional. Your wish is the real gift"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Bank name"
                      value={state.gift.bankName}
                      maxLength={60}
                      onChange={(e) => update('gift', { ...state.gift, bankName: e.target.value })}
                    />
                    <Input
                      label="Account name"
                      value={state.gift.accountName}
                      maxLength={60}
                      onChange={(e) => update('gift', { ...state.gift, accountName: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Account number"
                    value={state.gift.accountNumber}
                    maxLength={40}
                    onChange={(e) => update('gift', { ...state.gift, accountNumber: e.target.value })}
                  />
                  <Input
                    label="or a payment link (Paystack / PayPal / anything)"
                    value={state.gift.link}
                    maxLength={300}
                    onChange={(e) => update('gift', { ...state.gift, link: e.target.value })}
                    placeholder="https://…"
                  />
                  <p className="text-xs text-[var(--ink-3)]">
                    We only display these details; we never process payments.
                  </p>
                </div>
              )}
            </section>
          )}

          {step === 5 && (
            <section>
              <h1 className="font-display text-[26px] text-[var(--ink-1)]">Your link</h1>
              <p className="mt-1 text-sm text-[var(--ink-3)]">Your page will live at</p>
              <div className="mt-2 flex items-center gap-2">
                <LinkSimple size={18} weight="duotone" className="shrink-0 text-[var(--gold)]" />
                <span className="truncate rounded-[var(--r-sm)] bg-[var(--glass)] px-2 py-1 font-mono text-sm text-[var(--ink-2)]">
                  {window.location.origin}/
                </span>
              </div>
              <div className="mt-2">
                <Input
                  value={state.slug}
                  maxLength={40}
                  onChange={(e) => {
                    markTouched('slug')
                    update('slug', slugifyName(e.target.value))
                  }}
                  placeholder="your-page-name"
                />
                <div className="mt-1 flex items-center gap-1.5 text-sm">
                  {slugStatus === 'checking' && (
                    <span className="flex items-center gap-1.5 text-[var(--ink-3)]">
                      <CircleNotch
                        size={16}
                        className="animate-spin text-[var(--gold)]"
                        weight="duotone"
                      />
                      Checking…
                    </span>
                  )}
                  {slugStatus === 'available' && (
                    <span className="flex items-center gap-1.5 text-[var(--success)]">
                      <Check size={16} weight="bold" /> {window.location.origin}/{state.slug} is yours
                    </span>
                  )}
                  {slugStatus === 'taken' && (
                    <span className="flex items-center gap-1.5 text-[var(--danger)]">
                      That link is taken
                    </span>
                  )}
                  {slugStatus === 'invalid' && (
                    <span className="flex items-center gap-1.5 text-[var(--danger)]">
                      Use 3 to 40 letters, numbers or dashes
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <Toggle
                  checked={state.isPublished}
                  onChange={(v) => update('isPublished', v)}
                  label="Page is live"
                />
                <Toggle
                  checked={state.acceptingWishes}
                  onChange={(v) => update('acceptingWishes', v)}
                  label="Accept wishes"
                />
                <Toggle
                  checked={state.acceptAnonymous}
                  onChange={(v) => update('acceptAnonymous', v)}
                  label="Accept anonymous messages"
                />
                <Toggle
                  checked={state.showWall}
                  onChange={(v) => update('showWall', v)}
                  label="Show wishes publicly"
                />
              </div>

              {publishError && (
                <p className="mt-3 rounded-[var(--r-sm)] bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
                  {publishError}
                </p>
              )}
            </section>
          )}
        </Glass>

        <div className="fixed inset-x-0 bottom-0 z-20">
          <div className="glass-blur border-t border-[var(--glass-border)] bg-[var(--bg-1)]/80 backdrop-blur-[var(--glass-blur)]">
            <div
              className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-3 px-5"
              style={{ paddingTop: 16, paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
            >
              <Button variant="ghost" size="md" leftIcon={<ArrowLeft weight="duotone" />} onClick={goBack} disabled={step === 1}>
                Back
              </Button>
              {step < 5 ? (
                <Button size="md" rightIcon={<CaretRight weight="duotone" />} onClick={goNext} disabled={!canProceed}>
                  Next
                </Button>
              ) : (
                <Button
                  size="md"
                  loading={publishing}
                  disabled={!canProceed}
                  onClick={handlePublish}
                  rightIcon={!publishing ? <Check weight="duotone" /> : undefined}
                >
                  Publish my page 🎉
                </Button>
              )}
            </div>
          </div>
          <div className="h-[32px] bg-gradient-to-t from-[var(--bg-1)] via-[var(--bg-1)]/40 to-transparent" />
        </div>
      </div>
    </AmbientBackground>
  )
}
