import { useRef, useState, type ChangeEvent } from 'react'
import { Link, Play, Trash, UploadSimple, YoutubeLogo } from '@phosphor-icons/react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { useToast } from './ui/Toast'
import { uploadVideo, parseVideoLink, probeVideo } from '../lib/media'
import type { Video } from '../lib/types'
import { cn } from '../lib/cn'

const MAX_SIZE = 50 * 1024 * 1024
const MAX_DURATION = 20
const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/webm']

type VideoManagerProps = {
  userId: string
  video: Video | null
  onChange: (video: Video | null) => void
}

export function VideoManager({ userId, video, onChange }: VideoManagerProps) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'upload' | 'link'>('upload')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)

  if (video) {
    return (
      <div className="rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)] p-3">
        {video.kind === 'upload' && video.poster ? (
          <img src={video.poster} alt="" className="aspect-video w-full rounded-[var(--r-sm)] object-cover" />
        ) : (
          <div
            className={cn(
              'grid aspect-video w-full place-items-center rounded-[var(--r-sm)]',
              video.kind === 'link' && video.provider === 'youtube'
                ? 'bg-[#ff0000]/90'
                : 'bg-[var(--accent)]/15',
            )}
          >
            {video.kind === 'link' && video.provider === 'youtube' ? (
              <YoutubeLogo size={40} weight="fill" className="text-white" />
            ) : (
              <Play size={40} weight="fill" className="text-[var(--accent)]" />
            )}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-[var(--ink-1)]">
            {video.kind === 'upload'
              ? `${video.duration ?? 0}s clip`
              : video.provider === 'other'
                ? 'Linked video'
                : `${video.provider} video`}
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(null)
              toast('Video removed', 'info')
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--glass-2)]"
          >
            <Trash size={14} weight="bold" /> Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-1 rounded-[var(--r-sm)] bg-[var(--glass-2)] p-1">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-[var(--r-sm)] px-3 py-2 text-sm font-semibold transition-colors',
            tab === 'upload' ? 'bg-[var(--glass-3)] text-[var(--ink-1)] shadow-sm' : 'text-[var(--ink-2)]',
          )}
        >
          <UploadSimple size={16} weight="bold" /> Upload a clip
        </button>
        <button
          type="button"
          onClick={() => setTab('link')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-[var(--r-sm)] px-3 py-2 text-sm font-semibold transition-colors',
            tab === 'link' ? 'bg-[var(--glass-3)] text-[var(--ink-1)] shadow-sm' : 'text-[var(--ink-2)]',
          )}
        >
          <Link size={16} weight="bold" /> Paste a link
        </button>
      </div>

      <div className="mt-3">
        {tab === 'upload' ? (
          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-[var(--r-md)] border-2 border-dashed border-[var(--glass-border-2)] bg-[var(--glass)] px-4 py-10 text-[var(--ink-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
            >
              {uploading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              ) : (
                <Play size={24} weight="fill" />
              )}
              <span className="text-sm">{uploading ? 'Uploading…' : 'Choose a short clip'}</span>
              <span className="text-xs">MP4, MOV or WebM · up to 20s · up to 50 MB</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={handleUpload}
            />
            <p className="mt-3 text-xs text-[var(--ink-2)]">
              Tip: iPhone: Settings → Camera → Formats → Most Compatible makes clips play on every
              phone.
            </p>
          </div>
        ) : (
          <div>
            <Input
              value={link}
              onChange={(e) => {
                setLink(e.target.value)
                setLinkError(null)
              }}
              placeholder="Paste a YouTube, TikTok or Instagram link"
              error={linkError ?? undefined}
            />
            <Button
              size="md"
              fullWidth
              className="mt-3"
              disabled={!link.trim()}
              onClick={handleLink}
            >
              Add video link
            </Button>
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-[var(--glass-2)] px-3 py-2 text-sm text-[var(--danger)]">{error}</p>
        )}
      </div>
    </div>
  )

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)

    if (!ACCEPTED.includes(file.type)) {
      setError('Please choose an MP4, MOV or WebM file.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('That clip is over 50 MB. Trim it to 20 seconds in your gallery app, then try again.')
      return
    }

    setUploading(true)
    try {
      const probe = await probeVideo(file)
      if (probe.duration > MAX_DURATION) {
        setError('Trim it to 20 seconds in your gallery app, then try again.')
        return
      }
      const uploaded = await uploadVideo(userId, file, probe.duration)
      onChange(uploaded)
      toast('Video added', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Try again.')
      toast(err instanceof Error ? err.message : 'Upload failed. Try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleLink() {
    const result = parseVideoLink(link)
    if ('error' in result) {
      setLinkError(result.error)
      return
    }
    onChange(result.video)
    setLink('')
    toast('Video link added', 'success')
  }
}