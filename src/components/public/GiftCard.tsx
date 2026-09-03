import { useState } from 'react'
import { CaretDown, Copy, Gift as GiftIcon } from '@phosphor-icons/react'
import { useToast } from '../ui/Toast'
import { copyToClipboard } from '../../lib/share'
import type { Gift } from '../../lib/types'

type GiftCardProps = {
  gift: Gift
}

function CopyField({ label, value, prominent }: { label: string; value: string; prominent?: boolean }) {
  const { toast } = useToast()
  async function copy() {
    const ok = await copyToClipboard(value)
    toast(ok ? `${label} copied` : 'Could not copy', ok ? 'success' : 'error')
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass-2)] px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-[var(--ink-2)]">{label}</p>
        <p className={prominent ? 'truncate font-semibold tracking-wide text-[var(--ink-1)]' : 'truncate text-sm text-[var(--ink-1)]'}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1 rounded-[var(--r-sm)] border border-[var(--glass-border-2)] bg-[var(--glass-3)] px-2 py-1 text-xs font-semibold text-[var(--ink-1)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--on-accent)]"
      >
        <Copy size={13} weight="bold" /> Copy
      </button>
    </div>
  )
}

export function GiftCard({ gift }: GiftCardProps) {
  const [open, setOpen] = useState(false)

  if (!gift.enabled) return null
  const title = gift.title || 'Send a gift 🎁'

  return (
    <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-[var(--ink-1)]">
          <GiftIcon size={18} weight="fill" className="text-[var(--accent)]" />
          {title}
        </span>
        <CaretDown
          size={18}
          weight="bold"
          className={'shrink-0 text-[var(--ink-3)] transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div className="space-y-2.5 px-4 pb-4">
          {gift.note && <p className="text-sm text-[var(--ink-2)]">{gift.note}</p>}
          {gift.account_number && (
            <CopyField label="Account number" value={gift.account_number} prominent />
          )}
          {gift.account_name && <CopyField label="Account name" value={gift.account_name} />}
          {gift.bank_name && <CopyField label="Bank" value={gift.bank_name} />}
          {gift.link && (
            <a
              href={gift.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[var(--r-sm)] bg-[var(--accent)] px-4 py-3 text-center text-sm font-semibold text-[var(--on-accent)]"
            >
              Send a gift →
            </a>
          )}
          <p className="text-center text-xs text-[var(--ink-3)]">
            Optional. Your wish is the real gift.
          </p>
        </div>
      )}
    </div>
  )
}
