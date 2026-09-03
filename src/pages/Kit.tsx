import { useState } from 'react'
import {
  ShareNetwork,
  DownloadSimple,
  Copy,
  WhatsappLogo,
  Gift,
  EnvelopeSimple,
  Heart,
  EyeSlash,
  Trash,
  ArrowLeft,
  CaretRight,
  Plus,
  User,
  SignOut,
  ShieldCheck,
  Lock,
  Sparkle,
  Image,
  VideoCamera,
  LinkSimple,
  Check,
  X,
  Warning,
  ArrowSquareOut,
  SlidersHorizontal,
} from '@phosphor-icons/react'
import {
  AmbientBackground,
  Glass,
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Chip,
  Toggle,
  Badge,
  Avatar,
  Skeleton,
  EmptyState,
  SectionHeader,
  Stat,
  Divider,
  Segmented,
} from '../components/ui'

function IconRow({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-[var(--r-sm)] bg-[var(--glass-2)] text-[var(--gold)] [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <span className="text-sm text-[var(--ink-2)]">{name}</span>
    </div>
  )
}

function TypeSpecimens() {
  return (
    <div className="flex flex-col gap-5 rounded-[var(--r-lg)] border border-[var(--glass-border)] bg-[var(--glass)] p-6">
      <div>
        <p className="text-[12px] uppercase tracking-[.12em] text-[var(--ink-3)]">Display · 56/60 → 40/44</p>
        <p className="font-display text-[40px] leading-[1.1] text-[var(--ink-1)] md:text-[56px]">
          One link. <em className="text-[var(--gold)]">All</em> the love.
        </p>
      </div>
      <div>
        <p className="text-[12px] uppercase tracking-[.12em] text-[var(--ink-3)]">H1 · 36/40 → 30/34</p>
        <p className="font-display text-[30px] leading-[1.15] text-[var(--ink-1)] md:text-[36px]">
          Create your page
        </p>
      </div>
      <div>
        <p className="text-[12px] uppercase tracking-[.12em] text-[var(--ink-3)]">H2 · 26/32</p>
        <p className="font-display text-[26px] leading-[1.25] text-[var(--ink-1)]">
          Read the <em className="text-[var(--gold)]">love</em>
        </p>
      </div>
      <div>
        <p className="text-[12px] uppercase tracking-[.12em] text-[var(--ink-3)]">H3 · 20/26 · Manrope 700</p>
        <p className="text-[20px] font-bold leading-[1.3] text-[var(--ink-1)]">Manage your page</p>
      </div>
      <div>
        <p className="text-[12px] uppercase tracking-[.12em] text-[var(--ink-3)]">Body · 16/26 · Manrope 500</p>
        <p className="max-w-[65ch] text-[16px] leading-[1.625] text-[var(--ink-2)]">
          Build a beautiful page in minutes, share a single link, and let the joy roll in with
          wishes from everyone who loves them. Thai text renders beautifully: สุขสันต์วันเกิด
        </p>
      </div>
      <div>
        <p className="text-[12px] uppercase tracking-[.12em] text-[var(--ink-3)]">Small / Caption</p>
        <p className="text-[14px] leading-[1.4] text-[var(--ink-2)]">Small text at 14/20</p>
        <p className="text-[12px] leading-[1.33] text-[var(--ink-3)]">Caption at 12/16</p>
      </div>
      <div>
        <p className="text-[12px] uppercase tracking-[.12em] text-[var(--ink-3)]">Eyebrow · 12/16 · Manrope 700</p>
        <p className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--gold)]">Your dashboard</p>
      </div>
    </div>
  )
}

function ThemePanel() {
  const [theme, setTheme] = useState<'sunset' | 'midnight' | 'garden'>('sunset')
  const [seg, setSeg] = useState('wishes')

  const panels: Array<{ id: string; value: 'sunset' | 'midnight' | 'garden'; label: string }> = [
    { id: 'p1', value: 'sunset', label: 'sunset' },
    { id: 'p2', value: 'midnight', label: 'midnight' },
    { id: 'p3', value: 'garden', label: 'garden' },
  ]

  return (
    <div>
      <Segmented
        value={theme}
        onChange={(v) => setTheme(v as 'sunset' | 'midnight' | 'garden')}
        options={panels.map((p) => ({ value: p.value, label: p.label }))}
        label="Theme"
      />
      <div className={`mt-4 ${theme === 'garden' ? 'text-[var(--ink-1)]' : ''}`}>
        <div
          className="overflow-hidden rounded-[var(--r-lg)] border border-[var(--glass-border)] p-5"
          style={{ background: 'transparent' }}
        >
          <h3 className="font-display text-2xl text-[var(--ink-1)]">
            Under the <em className="text-[var(--accent)]">candlelight</em>
          </h3>
          <p className="mt-1 text-sm text-[var(--ink-2)]">
            A preview panel rendered with the real {theme} tokens.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" size="md" leftIcon={<Sparkle weight="duotone" />}>
              Leave a wish
            </Button>
            <Button variant="secondary" size="md" leftIcon={<EnvelopeSimple weight="duotone" />}>
              Send anonymously
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-4 text-[12px] uppercase tracking-[.12em] text-[var(--ink-3)]">
        Segmented (layoutId pill)
      </p>
      <div className="mt-2">
        <Segmented
          value={seg}
          onChange={setSeg}
          options={[
            { value: 'wishes', label: 'Wishes' },
            { value: 'anonymous', label: 'Anonymous' },
          ]}
          label="Section"
        />
      </div>
    </div>
  )
}

function PanelShowcase() {
  const [chip, setChip] = useState('all')
  const [on, setOn] = useState(true)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" size="md" leftIcon={<Sparkle weight="duotone" />}>
          Primary
        </Button>
        <Button variant="secondary" size="md" leftIcon={<ShareNetwork weight="duotone" />}>
          Secondary
        </Button>
        <Button variant="ghost" size="md">
          Ghost
        </Button>
        <Button variant="danger" size="md" leftIcon={<Trash weight="duotone" />}>
          Danger
        </Button>
        <Button variant="whatsapp" size="md" leftIcon={<WhatsappLogo weight="duotone" />}>
          WhatsApp
        </Button>
        <Button size="md" loading>
          Loading
        </Button>
        <Button size="lg" variant="primary" leftIcon={<Plus weight="duotone" />}>
          Large
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <IconButton label="Share">
          <ShareNetwork size={20} weight="duotone" />
        </IconButton>
        <IconButton label="Download" variant="secondary">
          <DownloadSimple size={20} weight="duotone" />
        </IconButton>
        <IconButton label="Copy" variant="secondary" active>
          <Copy size={20} weight="duotone" />
        </IconButton>
        <IconButton label="Danger" variant="danger">
          <Trash size={20} weight="duotone" />
        </IconButton>
      </div>

      <Divider className="my-2" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<User weight="duotone" />}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error="Password must be at least 8 characters"
        />
      </div>
      <Textarea
        label="Your wish"
        placeholder="Write something lovely…"
        counter={24}
        hint="Shown on the wall"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Tone"
          options={[
            { value: 'prayer', label: 'Prayer' },
            { value: 'heartfelt', label: 'Heartfelt' },
            { value: 'funny', label: 'Funny' },
          ]}
        />
        <div className="flex items-end">
          <Toggle checked={on} onChange={setOn} label="Show on the wall" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {['all', 'public', 'private', 'favourites'].map((c) => (
          <Chip key={c} selected={chip === c} onClick={() => setChip(c)}>
            {c === 'all' ? 'All' : c[0].toUpperCase() + c.slice(1)}
          </Chip>
        ))}
        <Chip selected leading={<span aria-hidden="true">🙏</span>}>
          Prayer
        </Chip>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="live">Live</Badge>
        <Badge tone="private">Private</Badge>
        <Badge tone="hidden">Hidden</Badge>
        <Badge tone="new">+3 new</Badge>
        <Badge tone="neutral">Note</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Avatar name="Ada Lovelace" size={44} />
        <Avatar name="Ada Lovelace" size={64} ring />
        <Avatar name="Ada Lovelace" size={96} />
      </div>

      <div className="flex gap-8">
        <Stat value={128} caption="Wishes" />
        <Stat value={42} caption="Anonymous" />
        <Stat value="8.4k" caption="Views" />
      </div>
    </div>
  )
}

function StatesShowcase() {
  return (
    <div className="flex flex-col gap-4">
      <Glass level={1} className="rounded-[var(--r-md)] p-5">
        <p className="text-sm text-[var(--ink-2)]">Glass level 1. Blur on</p>
      </Glass>
      <Glass level={2} className="rounded-[var(--r-md)] p-5">
        <p className="text-sm text-[var(--ink-2)]">Glass level 2</p>
      </Glass>
      <Glass level={3} blur={false} className="rounded-[var(--r-md)] p-5">
        <p className="text-sm text-[var(--ink-2)]">Glass level 3. No blur (opaque inner surface)</p>
      </Glass>

      <SectionHeader eyebrow="Wishes" title={<em>for you</em>} caption="A section header with caption." />

      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-10 w-40" radius={14} />
        <Skeleton className="h-24 w-full" radius={20} />
      </div>

      <Glass className="rounded-[var(--r-md)]">
        <EmptyState
          icon={<Gift weight="duotone" />}
          title="No wishes yet"
          description="Share your link and the love will roll in."
          action={<Button variant="secondary">Share your page</Button>}
        />
      </Glass>
    </div>
  )
}

const ICON_MAP: Array<{ name: string; node: React.ReactNode }> = [
  { name: 'share → ShareNetwork', node: <ShareNetwork weight="duotone" /> },
  { name: 'download → DownloadSimple', node: <DownloadSimple weight="duotone" /> },
  { name: 'copy → Copy', node: <Copy weight="duotone" /> },
  { name: 'WhatsApp → WhatsappLogo', node: <WhatsappLogo weight="duotone" /> },
  { name: 'wish → Gift', node: <Gift weight="duotone" /> },
  { name: 'anonymous → EnvelopeSimple', node: <EnvelopeSimple weight="duotone" /> },
  { name: 'favourite → Heart', node: <Heart weight="duotone" /> },
  { name: 'hide/show → EyeSlash / Eye', node: <EyeSlash weight="duotone" /> },
  { name: 'delete → Trash', node: <Trash weight="duotone" /> },
  { name: 'back → ArrowLeft', node: <ArrowLeft weight="duotone" /> },
  { name: 'next → CaretRight', node: <CaretRight weight="duotone" /> },
  { name: 'add → Plus', node: <Plus weight="duotone" /> },
  { name: 'account → User', node: <User weight="duotone" /> },
  { name: 'sign out → SignOut', node: <SignOut weight="duotone" /> },
  { name: 'secure → ShieldCheck', node: <ShieldCheck weight="duotone" /> },
  { name: 'lock → Lock', node: <Lock weight="duotone" /> },
  { name: 'card → Sparkle', node: <Sparkle weight="duotone" /> },
  { name: 'photo → Image', node: <Image weight="duotone" /> },
  { name: 'video → VideoCamera', node: <VideoCamera weight="duotone" /> },
  { name: 'link → LinkSimple', node: <LinkSimple weight="duotone" /> },
  { name: 'success → Check', node: <Check weight="duotone" /> },
  { name: 'close → X', node: <X weight="duotone" /> },
  { name: 'warning → Warning', node: <Warning weight="duotone" /> },
  { name: 'open external → ArrowSquareOut', node: <ArrowSquareOut weight="duotone" /> },
  { name: 'manage → SlidersHorizontal', node: <SlidersHorizontal weight="duotone" /> },
]

export function Kit() {
  return (
    <AmbientBackground>
      <div className="mx-auto max-w-4xl px-5 py-12">
        <SectionHeader
          eyebrow="Design kit"
          title={
            <>
              The <em className="text-[var(--gold)]">candlelit</em> glass system
            </>
          }
          caption="Every primitive, in every state, on the app-shell background and under each celebration theme."
        />

        <section className="mt-8" aria-labelledby="kit-primitives">
          <h2 id="kit-primitives" className="mb-4 text-[12px] font-bold uppercase tracking-[.12em] text-[var(--ink-3)]">
            Primitives
          </h2>
          <Glass className="rounded-[var(--r-lg)] p-6">
            <PanelShowcase />
          </Glass>
        </section>

        <section className="mt-10" aria-labelledby="kit-states">
          <h2 id="kit-states" className="mb-4 text-[12px] font-bold uppercase tracking-[.12em] text-[var(--ink-3)]">
            Glass levels, sections, loading & empty
          </h2>
          <StatesShowcase />
        </section>

        <section className="mt-10" aria-labelledby="kit-type">
          <h2 id="kit-type" className="mb-4 text-[12px] font-bold uppercase tracking-[.12em] text-[var(--ink-3)]">
            Type specimens
          </h2>
          <TypeSpecimens />
        </section>

        <section className="mt-10" aria-labelledby="kit-themes">
          <h2 id="kit-themes" className="mb-4 text-[12px] font-bold uppercase tracking-[.12em] text-[var(--ink-3)]">
            Celebration themes
          </h2>
          <ThemePanel />

          <div className="mt-6" data-theme="anonymous">
            <div className="rounded-[var(--r-lg)] border border-[var(--glass-border)] p-5 ambient-base">
              <h3 className="font-display text-2xl text-[var(--ink-1)]">
                Anonymous <em className="text-[var(--gold)]">sealed</em> palette
              </h3>
              <p className="mt-1 text-sm text-[var(--ink-2)]">
                A faint wine blob on near-black. The wax seal lives only in the envelope illustration.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" size="md" leftIcon={<EnvelopeSimple weight="duotone" />}>
                  Send anonymously
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="kit-icons">
          <h2 id="kit-icons" className="mb-4 text-[12px] font-bold uppercase tracking-[.12em] text-[var(--ink-3)]">
            Icon mapping. Phosphor duotone, 20px
          </h2>
          <Glass className="rounded-[var(--r-lg)] p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ICON_MAP.map((i) => (
                <IconRow key={i.name} icon={i.node} name={i.name} />
              ))}
            </div>
          </Glass>
        </section>
      </div>
    </AmbientBackground>
  )
}
