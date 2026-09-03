# birth-wish — Design System

> **"Candlelit glass"** — deep warm-dark base, frosted-glass panels with a 1px luminous edge,
> champagne-gold accents, soft film grain, editorial serif headlines with italic emphasis,
> generous radii, calm spring motion.

Future prompts should say **"follow DESIGN.md"**.

---

## Audit

Current anti-patterns found across pages, with the intended replacement. Fix in order of
impact (highest first). This list drives the page-refactor tasks.

| # | File / area | Anti-pattern | Replacement |
|---|-------------|--------------|-------------|
| 1 | `theme/themes.ts` + public pages + share card | Violet→purple gradient & orange full-bleed backgrounds on public pages and the canvas card | `data-theme` overrides (sunset/midnight/garden/anonymous) on `--bg-0` + radial-gradient ambient blobs |
| 2 | App shell / dashboard | Orange full-bleed `--page-gradient` behind white headings (Landing, Login, Signup, Dashboard) | `AmbientBackground` on the app-shell palette (`--bg-0`) with gold headings |
| 3 | Public pages | Opaque white cards floating on bright gradients | `Glass` panels (1px `--glass-border` + `--glass-edge` highlight, `--glass-blur` 18px) |
| 4 | `Landing.tsx` | Centred single column, emoji-as-logo, uniform centred CTA | Asymmetric 7/5 hero, compact glass navbar, drifting glass composition |
| 5 | Login/Signup | Centred white card, grey "Continue with Google" secondary button (already removed), placeholder-only inputs | Off-centre `Glass` panel, real labels, gold autofocus |
| 6 | Buttons everywhere | Default `rounded-xl shadow-lg`, grey secondary, default blue focus rings | Token variants (primary gold / secondary glass / ghost / danger / whatsapp), `--focus` gold ring |
| 7 | Labels on translucent cards | Low-contrast labels / placeholders on glass | `--ink-1` labels, `--ink-3` placeholders (≥ 4.5:1) |
| 8 | Icons | Any lucide/heroicons/react-icons, emoji-as-icons in buttons | `@phosphor-icons/react` only (duotone, fill for active, 20px / 18px dense) |
| 9 | Cards | Uniform `rounded-xl`, `shadow-lg`, `rounded-2xl` inline | Token radii `--r-sm/md/lg/xl`, `--shadow-float` only on floating layers |
| 10 | Focus | Default blue `ring` / no visible focus ring | `--focus` gold ring on all interactive elements |

---

## Tokens

All tokens are CSS custom properties in `src/styles/tokens.css` under `:root`, mirrored into
the Tailwind `@theme` block in `src/index.css` as `bw.*`/`--color-*`/`--radius-*`.

### Colour

| Token | Value | Use |
|-------|-------|-----|
| `--bg-0 / --bg-1 / --bg-2` | `#0E0B12 / #161220 / #1F192B` | app-shell base, panels, raised |
| `--ember / --gold / --gold-2 / --gold-deep / --wine` | `#FF7A59 / #E8C170 / #F3D48F / #B8893A / #8E2F4F` | ambient & accents |
| `--glass / -2 / -3` | `rgba(255,255,255,.06/.10/.14)` | panel fills (level 1/2/3) |
| `--glass-border / -2` | `rgba(255,255,255,.12/.20)` | panel edges |
| `--glass-blur · --glass-edge` | `18px · inset 0 1px 0 rgba(255,255,255,.14)` | blur + luminous top edge |
| `--ink-1 / -2 / -3` | `#F6F1E8 / #CFC8D8 / #948DA3` | text hierarchy |
| `--success / --danger / --info / --whatsapp` | `#7DD3A0 / #FF6B6B / #8FB8FF / #25D366` | semantic (WhatsApp button only) |
| `--focus` | `0 0 0 3px rgba(232,193,112,.38)` | focus ring |
| `--r-sm/md/lg/xl` | `14 / 20 / 28 / 36 px` | radii |
| `--shadow-float` | `0 24px 70px -30px rgba(0,0,0,.65)` | floating layers only |

**Primary action** = solid `--gold` with `--bg-0` text; hover `--gold-2`; glow
`0 10px 30px -12px rgba(232,193,112,.55)`. **Never a gradient button.**

### Celebration themes (`[data-theme]` overrides)

- **sunset "Golden Hour"**: `--bg-0 #1A0F14`; blobs `--ember`+`--gold`; `--accent #F3D48F`.
- **midnight**: `--bg-0 #090E1E`; blobs indigo `#3454D1`+teal `#2FB8A6`; `--accent #7FE0D0`.
- **garden** (the one light theme): `--bg-0 #F4F0E8`; blobs `#BFE3B4`+`#F9CFDD`; glass becomes white
  `rgba(255,255,255,.55/.72)`; inks `#1E1B26 / #4A4556 / #7A7487`; `--accent #2F6B4F`.
- **anonymous** (fixed, ignores theme): `--bg-0 #08070B`; one faint `--wine` blob; `--accent --gold`;
  wax-seal red `#B3261E` used **only** in the envelope illustration.

### Ambient background

Base colour + 2–3 `radial-gradient` blobs (no `filter: blur`), a 30s `bw-blob-drift` keyframe
(disabled under reduced motion), and a film-grain `body::after` (inline SVG `feTurbulence` data-URI,
`opacity .05`, `mix-blend-mode: overlay`, `pointer-events: none`).

### Glass performance (mid-range Android)

- ≤ 3 `backdrop-filter` layers visible per route.
- Never blur inside blur — inner surfaces use solid `rgba` without `backdrop-filter`.
- Ambient blobs use `radial-gradient`, not `filter: blur`.
- `@supports not (backdrop-filter: blur(1px))` fallback → more opaque glass (`.glass-blur[-2|-3]`).

---

## Typography

- **Display/headings**: `Instrument Serif` (400 + italic). Every headline emphasises one word with `<em>`.
- **UI/body**: `Manrope` (500/600/700/800).
- Every font stack ends with `"Noto Sans Thai"`, `system-ui`.

| Role | px / line-height |
|------|------------------|
| display | 56/60 → 40/44 |
| h1 | 36/40 → 30/34 |
| h2 | 26/32 |
| h3 (Manrope 700) | 20/26 |
| body (Manrope 500) | 16/26 |
| small | 14/20 |
| caption | 12/16 |
| eyebrow (Manrope 700, uppercase) | 12/16, letter-spacing `.12em` |

Paragraph measure ≤ 65ch. Numbers in stats use Instrument Serif at h1 size.

---

## Layout & motion

- **4px grid.** Asymmetry by default on ≥ `md`: landing hero 7/5; dashboard bento (page card 12,
  stats 4×3, Wishes 7 / Anonymous 5); auth = one off-centre glass panel, light source top-left.
- Public pages: single column max-w 520px but varied rhythm — avatar overlapping hero bottom edge by
  40px, gallery bleeding edge-to-edge, gold hairline (`--gold` 35%) section dividers.
- Sticky bottom bars: `padding-bottom: calc(16px + env(safe-area-inset-bottom))`, fade into page.
- Motion presets in `src/lib/motion.ts`:
  - `spring = { type:'spring', stiffness:380, damping:30, mass:.8 }` for hover/press/sheets.
  - `enter` = fade + y 12→0, 280ms, ease `[.2,.8,.2,1]`.
  - list `stagger` 60ms; `whileTap` scale .98; `Segmented` active pill via `layoutId`; sheets slide up.
- Everything gated by `useReducedMotion`.

---

## Component API (`src/components/ui`)

| Component | Props |
|-----------|-------|
| `AmbientBackground` | `theme?`, `embers?`, `className` |
| `Glass` | `level? 1\|2\|3`, `blur?` (default true), `as?`, `className` |
| `Button` | `variant? primary\|secondary\|ghost\|danger\|whatsapp`, `size? md\|lg`, `loading?`, `fullWidth?`, `leftIcon/rightIcon` (Phosphor) |
| `IconButton` | `label`, `variant?`, `size?`, `active?` |
| `Input` | `label`, `error`, `hint`, `leftIcon`, input attrs |
| `Textarea` | `label`, `error`, `hint`, `counter`, auto-grow |
| `Select` | `label`, `error`, `options`, `leadingIcon` |
| `Chip` | `selected?`, `leading?` (selectable) |
| `Toggle` | `checked`, `onChange`, `label`, `description`, `disabled` |
| `Badge` | `tone? pro\|private\|hidden\|live\|neutral\|new` |
| `Avatar` | `name`, `src?`, `size?`, `ring?` (initials fallback) |
| `Toast` | `useToast().toast(msg, kind?)` |
| `Sheet` | `open`, `onClose`, `title?` (bottom on mobile, centred on desktop, focus trap, ESC) |
| `Skeleton` | shimmer on glass |
| `EmptyState` | `icon`, `title`, `description?`, `action?` |
| `SectionHeader` | `eyebrow`, `title`, `caption?`, `action?` |
| `Stat` | `value` (serif), `caption` |
| `Divider` | gold hairline |
| `Segmented` | `value`, `onChange`, `options`, `label?` (layoutId pill) |

---

## Icon mapping (Phosphor, duotone; fill when active; 20px, 18px dense)

| Intent | Icon | Intent | Icon |
|--------|------|--------|------|
| share | `ShareNetwork` | download | `DownloadSimple` |
| copy | `Copy` | WhatsApp | `WhatsappLogo` |
| wish | `Gift` | anonymous | `EnvelopeSimple` |
| favourite | `Heart` | hide/show | `EyeSlash` / `Eye` |
| delete | `Trash` | back | `ArrowLeft` |
| next | `CaretRight` | add | `Plus` |
| account | `User` | sign out | `SignOut` |
| secure | `ShieldCheck` | lock | `Lock` |
| card | `Sparkle` | photo | `Image` |
| video | `VideoCamera` | link | `LinkSimple` |
| success | `Check` | close | `X` |
| warning | `Warning` | open external | `ArrowSquareOut` |
| manage | `SlidersHorizontal` | | |

**Ban** lucide-react, heroicons, react-icons. Emoji are allowed **inside content** (wishes, tone
chips, celebrant copy) — never as icons inside buttons or nav.

---

## DO / DON'T

**DO**
- Use tokens only — never a raw hex/gradient/shadow/radius outside `tokens.css`.
- Put the primary CTA in solid gold on the dark base (never share a hue with the background).
- 1px `--glass-border` + `--glass-edge` on every panel; heavy shadow only on floating layers.
- Real `<label>`s, visible gold focus rings, tap targets ≥ 44px, `prefers-reduced-motion` respected.
- Keep text contrast ≥ 4.5:1 on its actual background (glass included).
- Use `data-theme` for public pages + share card; force `anonymous` palette on the anonymous page.

**DON'T**
- No blue/purple gradients, no full-bleed saturated orange with white text, no opaque white cards
  on gradients, no centred single-column Tailwind layouts, no default `rounded-xl shadow-lg`.
- No `filter: blur` on large elements; no blur inside blur; ≤ 3 backdrop-filter layers per route.
- No emoji-as-icons in buttons/nav; no Google/**non-Phosphor** icons.
- No hardcoded celebrant names/slugs/demo data in real pages (kit page is explicitly generic).
