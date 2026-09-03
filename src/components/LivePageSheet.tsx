import { ArrowSquareOut, WhatsappLogo } from '@phosphor-icons/react'
import { Sheet } from './ui/Sheet'
import { CopyButton } from './ui/CopyButton'
import { birthdayShareText, waUrl } from '../lib/share'
import type { Celebration } from '../lib/types'

type LivePageSheetProps = {
  celebration: Celebration | null
  onClose: () => void
}

export function LivePageSheet({ celebration, onClose }: LivePageSheetProps) {
  if (!celebration) return null
  const url = `${window.location.origin}/${celebration.slug}`
  const text = birthdayShareText(celebration.page_type, celebration.name, url)

  return (
    <Sheet open={!!celebration} onClose={onClose} title="Your page is live! 🎉">
      <p className="text-sm text-[var(--ink-2)]">Share it and let the love roll in.</p>
      <div className="mt-4 overflow-hidden rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass)]">
        <p className="truncate px-3 py-2.5 text-sm text-[var(--ink-1)]">{url}</p>
      </div>
      <div className="mt-3 flex gap-2">
        <CopyButton text={url} label="Copy link" size="md" variant="secondary" className="flex-1" />
        <a
          href={waUrl(text)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--r-sm)] bg-[var(--whatsapp)] px-4 py-3 text-base font-semibold text-[var(--on-accent)] transition-opacity hover:opacity-90"
        >
          <WhatsappLogo size={18} weight="fill" /> WhatsApp
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--r-sm)] border border-[var(--glass-border-2)] bg-[var(--glass-2)] px-4 py-3 text-base font-semibold text-[var(--ink-1)] hover:bg-[var(--glass-3)]"
        >
          <ArrowSquareOut size={18} weight="bold" /> Open
        </a>
      </div>
    </Sheet>
  )
}