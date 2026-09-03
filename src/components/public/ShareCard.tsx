import { useEffect, useRef, useState } from 'react'
import {
  ArrowSquareOut,
  DownloadSimple,
  ShareNetwork,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { FooterCTA } from './FooterCTA'
import { CopyButton } from '../ui/CopyButton'
import { useToast } from '../ui/Toast'
import { APP_NAME } from '../../lib/brand'
import { makeCardImage } from '../../lib/card'
import { getGuest, getWish } from '../../lib/guest'
import { copyToClipboard, waUrl } from '../../lib/share'
import { supabase } from '../../lib/supabase'
import type { Celebration } from '../../lib/types'

type ShareCardProps = {
  celebration: Celebration
}

function canonicalUrl(slug: string): string {
  if (typeof window === 'undefined') return `https://${APP_NAME}.page/${slug}`
  return `${window.location.origin}/${slug}`
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, base64] = dataUrl.split(',')
  const mime = head.match(/data:(.*?);/)?.[1] ?? 'image/png'
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export function ShareCard({ celebration }: ShareCardProps) {
  const { toast } = useToast()
  const [image, setImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bumped = useRef(false)

  const savedWish = getWish(celebration.slug)
  const savedGuest = getGuest(celebration.slug)
  const message = savedWish?.message?.trim()
  const url = canonicalUrl(celebration.slug)
  const shareText = `I just left a wish for ${celebration.name} on ${APP_NAME} 🎂`

  useEffect(() => {
    let active = true
    if (!message) return
    makeCardImage({
      celebration: {
        name: celebration.name,
        theme: celebration.theme,
        photos: celebration.photos,
      },
      guest: savedGuest
        ? { name: savedGuest.name, relation: savedGuest.relation }
        : null,
      message,
      tone: savedWish?.tone ?? null,
    })
      .then((dataUrl) => {
        if (active) setImage(dataUrl)
      })
      .catch(() => {
        if (active) setError('Couldn’t generate the card')
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebration.slug, celebration.id, message])

  function bumpShare() {
    if (bumped.current) return
    bumped.current = true
    supabase.rpc('bump_counter', { p_slug: celebration.slug, p_kind: 'share' }).then(() => {})
  }

  function download() {
    if (!image) return
    bumpShare()
    const a = document.createElement('a')
    a.href = image
    a.download = `wish-card-${celebration.slug}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    toast('Card downloaded', 'success')
  }

  async function copyImage() {
    if (!image) return
    bumpShare()
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': dataUrlToBlob(image) }),
      ])
      toast('Card image copied. Paste it anywhere', 'success')
    } catch {
      toast('Copying the image is not supported here. Try Download', 'error')
    }
  }

  async function shareSheet() {
    if (!image) return
    bumpShare()
    const nav = navigator as Navigator & {
      canShare?: (data?: { files?: File[] }) => boolean
      share?: (data: { files?: File[]; url?: string; text?: string }) => Promise<void>
    }
    const file = new File([dataUrlToBlob(image)], 'wish-card.png', { type: 'image/png' })
    if (nav.canShare?.({ files: [file] }) && nav.share) {
      try {
        await nav.share({ files: [file], url, text: shareText })
      } catch {
        // user cancelled
      }
      return
    }
    const ok = await copyToClipboard(url)
    toast(
      ok ? 'Sharing is not supported here. Link copied' : 'Could not share',
      ok ? 'success' : 'error',
    )
  }

  if (!message) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <span className="text-5xl" role="img" aria-hidden="true">
          🃏
        </span>
        <h1 className="mt-4 font-display text-2xl text-[var(--ink-1)]">
          Make your <em className="text-[var(--gold)]">share card</em>
        </h1>
        <p className="mt-2 max-w-xs text-sm text-[var(--ink-2)]">
          First, leave a wish for {celebration.name}. Then we’ll turn it into a card you can post.
        </p>
        <Link
          to={`/${celebration.slug}/wish`}
          className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--on-accent)]"
        >
          Leave a wish 🎁
        </Link>
      </div>
    )
  }

      const nav = navigator as Navigator & {
    canShare?: (data?: { files?: File[] }) => boolean
    share?: (data: { files?: File[]; url?: string; text?: string }) => Promise<void>
  }
  const sharesFiles = Boolean(
    nav.canShare?.({ files: [new File([new Blob()], 'x', { type: 'image/png' })] }),
  )

  return (
    <div className="flex flex-col">
      <h1 className="font-display text-2xl text-[var(--ink-1)]">
        Your wish card ✨
      </h1>
      <p className="mt-1 text-sm text-[var(--ink-2)]">
        A beautiful card with your wish. Download it or share the link.
      </p>

      <div className="mx-auto mt-5 w-full max-w-sm">
        {error ? (
          <div className="grid aspect-[4/5] w-full place-items-center rounded-[var(--r-lg)] border border-[var(--glass-border)] bg-[var(--glass)] text-sm text-[var(--ink-2)]">
            {error}
          </div>
        ) : image ? (
          <img
            src={image}
            alt={`Your wish card for ${celebration.name}`}
            className="w-full rounded-[var(--r-lg)] border border-[var(--glass-border)] shadow-[var(--shadow-float)]"
          />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={download}
          disabled={!image}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--r-md)] bg-[var(--accent)] px-6 py-3.5 text-base font-semibold text-[var(--on-accent)] transition-colors hover:opacity-90 disabled:opacity-60"
        >
          <DownloadSimple size={20} weight="bold" /> Download card
        </button>
        {sharesFiles && (
          <button
            type="button"
            onClick={shareSheet}
            disabled={!image}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass-2)] px-6 py-3 text-base font-semibold text-[var(--ink-1)] transition-colors hover:bg-[var(--glass-3)] disabled:opacity-60"
          >
            <ShareNetwork size={19} weight="bold" /> Share card
          </button>
        )}
        <button
          type="button"
          onClick={copyImage}
          disabled={!image}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass-2)] px-6 py-3 text-base font-semibold text-[var(--ink-1)] transition-colors hover:bg-[var(--glass-3)] disabled:opacity-60"
        >
          <ShareNetwork size={19} weight="bold" /> Copy card image
        </button>
      </div>

      <details className="mt-4 overflow-hidden rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)]">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--ink-1)]">
          Share the link to the page
          <ArrowSquareOut size={16} weight="bold" className="text-[var(--ink-3)]" />
        </summary>
        <div className="space-y-2.5 px-4 pb-4">
          <CopyButton text={url} label="Copy page link" size="sm" variant="secondary" fullWidth />
          <a
            href={waUrl(`${shareText}\n${url}`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => bumpShare()}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass-2)] px-4 py-2.5 text-sm font-semibold text-[var(--ink-1)] transition-colors hover:bg-[var(--glass-3)]"
          >
            Share on WhatsApp ↗
          </a>
        </div>
      </details>

      <div className="mt-6 w-full">
        <FooterCTA celebration={celebration} />
      </div>
    </div>
  )
}
