import { useState } from 'react'
import { ArrowSquareOut, WhatsappLogo, SlidersHorizontal, ShareNetwork } from '@phosphor-icons/react'
import { Glass, Badge, Button } from './ui'
import { CopyButton } from './ui/CopyButton'
import { ShareKitSheet } from './dashboard/ShareKitSheet'
import { birthdayShareText, waUrl } from '../lib/share'
import { formatBirthday } from '../lib/dates'
import type { Celebration } from '../lib/types'

type CelebrationCardProps = {
  celebration: Celebration
  origin: string
  onManage: (id: string) => void
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function CelebrationCard({ celebration, origin, onManage }: CelebrationCardProps) {
  const url = `${origin}/${celebration.slug}`
  const [shareKitOpen, setShareKitOpen] = useState(false)
  const coverEl = celebration.photos?.[0]
  const birthday = formatBirthday(celebration.birthday)

  const title =
    celebration.page_type === 'someone_else'
      ? `Surprise page for ${celebration.name}`
      : `${celebration.name}'s page`
  const badgeName = celebration.name

  async function shareWhatsApp() {
    const text = birthdayShareText(celebration.page_type, badgeName, url)
    window.open(waUrl(text), '_blank', 'noopener')
  }

  return (
    <Glass level={1} className="overflow-hidden rounded-[var(--r-lg)]">
      <div className="grid gap-4 p-5 sm:grid-cols-12">
        <div className="sm:col-span-3 sm:row-span-2">
          {coverEl ? (
            <img
              src={coverEl.thumb}
              alt=""
              className="h-[88px] w-[88px] shrink-0 rounded-[20px] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-[20px] bg-[var(--glass-2)] font-display text-2xl text-[var(--gold)]">
              {initials(badgeName)}
            </div>
          )}
        </div>

        <div className="min-w-0 sm:col-span-9">
          <h3 className="truncate font-display text-[22px] leading-tight text-[var(--ink-1)]">
            {title}
          </h3>
          <p className="mt-0.5 text-sm text-[var(--ink-2)]">
            {birthday ? `Birthday: ${birthday}` : 'Birthday not set'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={celebration.is_published ? 'live' : 'hidden'}>
              {celebration.is_published ? 'Live' : 'Hidden'}
            </Badge>
          </div>
        </div>

        <div className="sm:col-span-9">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass)] px-3 py-2.5">
              <p className="truncate text-sm text-[var(--ink-2)]">{url}</p>
            </div>
            <CopyButton text={url} label="Copy" size="sm" variant="secondary" />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="whatsapp"
              size="md"
              leftIcon={<WhatsappLogo weight="fill" />}
              onClick={shareWhatsApp}
            >
              Share on WhatsApp
            </Button>
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
            <Button
              variant="secondary"
              size="md"
              leftIcon={<SlidersHorizontal weight="duotone" />}
              onClick={() => onManage(celebration.id)}
            >
              Manage
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<ShareNetwork weight="duotone" />}
              onClick={() => setShareKitOpen(true)}
            >
              Share kit
            </Button>
          </div>
        </div>
      </div>

      <ShareKitSheet
        open={shareKitOpen}
        onClose={() => setShareKitOpen(false)}
        celebration={celebration}
        url={url}
      />
    </Glass>
  )
}

