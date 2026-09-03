import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { WhatsappLogo, Copy, DownloadSimple } from '@phosphor-icons/react'
import { Sheet, Button, Divider } from '../ui'
import { useToast } from '../ui/Toast'
import { supabase } from '../../lib/supabase'
import { copyToClipboard, waUrl } from '../../lib/share'
import { CopyButton } from '../ui/CopyButton'
import type { Celebration } from '../../lib/types'

type ShareKitSheetProps = {
  open: boolean
  onClose: () => void
  celebration: Celebration
  url: string
}

function captionChips(pageType: Celebration['page_type'], name: string, url: string) {
  return [
    {
      label: 'WhatsApp status',
      text:
        pageType === 'self'
          ? `It's my birthday 🎂 Leave me a wish here: ${url}`
          : `It's ${name}'s birthday 🎂 Leave a wish here: ${url}`,
    },
    {
      label: 'Instagram story',
      text:
        pageType === 'self'
          ? `My birthday wish wall is open. ${url}`
          : `${name}'s birthday wish wall is open. ${url}`,
    },
    {
      label: 'X',
      text:
        pageType === 'self'
          ? `It's my birthday. Drop a wish or a prayer: ${url}`
          : `It's ${name}'s birthday. Drop a wish or a prayer: ${url}`,
    },
  ]
}

export function ShareKitSheet({ open, onClose, celebration, url }: ShareKitSheetProps) {
  const { toast } = useToast()
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const sessionKey = `birthwish:card-share:${celebration.slug}`

  useEffect(() => {
    if (!open) return
    QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: '#0E0B12', light: '#F4F0E8' } })
      .then(setQrUrl)
      .catch(() => setQrUrl(null))
  }, [open, url])

  useEffect(() => {
    if (!open) return
    try {
      if (sessionStorage.getItem(sessionKey)) return
      sessionStorage.setItem(sessionKey, '1')
      supabase.rpc('bump_counter', { p_slug: celebration.slug, p_kind: 'share' }).then(() => {})
    } catch {
      // ignore
    }
  }, [open, celebration.slug, sessionKey])

  async function handleWhatsApp() {
    const text =
      celebration.page_type === 'self'
        ? `It's my birthday 🎂 Leave me a wish here: ${url}`
        : `It's ${celebration.name}'s birthday 🎂 Leave a wish here: ${url}`
    window.open(waUrl(text), '_blank', 'noopener')
  }

  function downloadQr() {
    if (!qrUrl) return
    setDownloading(true)
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = `birth-wish-${celebration.slug}-qr.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setDownloading(false)
  }

  const chips = captionChips(celebration.page_type, celebration.name, url)

  return (
    <Sheet open={open} onClose={onClose} title="Share kit">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 truncate rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass)] px-3 py-2.5 text-sm text-[var(--ink-2)]">
            {url}
          </div>
          <CopyButton text={url} label="Copy" size="md" variant="secondary" />
        </div>

        <Divider />

        <div className="flex flex-col gap-3">
          <Button variant="whatsapp" size="lg" fullWidth leftIcon={<WhatsappLogo weight="fill" />} onClick={handleWhatsApp}>
            Share on WhatsApp
          </Button>
        </div>

        <Divider />

        <div className="flex justify-center">
          {qrUrl ? (
            <button
              type="button"
              onClick={downloadQr}
              disabled={downloading}
              className="group flex flex-col items-center gap-2 rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)] p-4"
            >
              <img src={qrUrl} alt="QR code for your page" className="h-40 w-40" />
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--ink-2)] group-hover:text-[var(--ink-1)]">
                <DownloadSimple weight="duotone" size={16} />
                Download QR
              </span>
            </button>
          ) : (
            <div className="h-40 w-40" />
          )}
        </div>

        <Divider />

        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--gold)]">Captions</p>
          {chips.map((chip) => (
            <div key={chip.label} className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--ink-1)]">{chip.label}</p>
                <p className="mt-0.5 break-words text-sm text-[var(--ink-3)]">{chip.text}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Copy weight="duotone" />}
                onClick={async () => {
                  const ok = await copyToClipboard(chip.text)
                  toast(ok ? 'Caption copied' : 'Could not copy', ok ? 'success' : 'error')
                }}
              >
                Copy
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  )
}
