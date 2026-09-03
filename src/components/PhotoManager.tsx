import { useRef, useState, type ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, ImageSquare, Trash, X } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { deletePhoto, uploadPhoto } from '../lib/media'
import type { Photo } from '../lib/types'
import { useToast } from './ui/Toast'

type PhotoManagerProps = {
  userId: string
  photos: Photo[]
  onChange: (photos: Photo[]) => void
  maxPhotos: number
}

export function PhotoManager({
  userId,
  photos,
  onChange,
  maxPhotos,
}: PhotoManagerProps) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    const available = maxPhotos - photos.length
    if (available <= 0) {
      setError(`You can add up to ${maxPhotos} photos`)
      toast(`You can add up to ${maxPhotos} photos`, 'error')
      return
    }

    setError(null)
    setUploading(true)
    const toAdd = files.slice(0, available)
    try {
      const added: Photo[] = []
      for (const file of toAdd) {
        try {
          const photo = await uploadPhoto(userId, file)
          added.push(photo)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Upload failed')
          toast(err instanceof Error ? err.message : 'Upload failed', 'error')
          break
        }
      }
      onChange([...photos, ...added])
    } finally {
      setUploading(false)
    }
  }

  function updateCaption(index: number, caption: string) {
    const next = photos.map((p, i) => (i === index ? { ...p, caption: caption.slice(0, 80) } : p))
    onChange(next)
  }

  function remove(index: number) {
    const photo = photos[index]
    const next = photos.filter((_, i) => i !== index)
    onChange(next)
    if (photo) deletePhoto(photo)
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= photos.length) return
    const next = [...photos]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const atMax = photos.length >= maxPhotos

  return (
    <div>
      {photos.length > 0 && (
        <p className="mb-2 text-xs text-[var(--ink-2)]">
          {photos.length} of {maxPhotos} photos used
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.url}
            className="relative overflow-hidden rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass)]"
          >
            <div className="aspect-square w-full overflow-hidden bg-[var(--glass-3)]">
              <img
                src={photo.thumb}
                alt={photo.caption || `Photo ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            {index === 0 && (
              <span className="absolute left-2 top-2 rounded-md bg-[var(--accent)] px-2 py-0.5 text-xs font-semibold text-[var(--on-accent)]">
                Cover
              </span>
            )}
            <div className="flex items-center gap-1 p-2">
              <span
                className={cn('inline-grid h-7 w-7 place-items-center rounded-lg border border-[var(--glass-border)]', index === 0 ? 'opacity-30' : '')}
              >
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="text-[var(--ink-1)] disabled:opacity-30"
                  aria-label="Move left"
                >
                  <ArrowLeft size={16} weight="bold" />
                </button>
              </span>
              <span
                className={cn('inline-grid h-7 w-7 place-items-center rounded-lg border border-[var(--glass-border)]', index === photos.length - 1 ? 'opacity-30' : '')}
              >
                <button
                  type="button"
                  disabled={index === photos.length - 1}
                  onClick={() => move(index, 1)}
                  className="text-[var(--ink-1)] disabled:opacity-30"
                  aria-label="Move right"
                >
                  <ArrowRight size={16} weight="bold" />
                </button>
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="ml-auto inline-grid h-7 w-7 place-items-center rounded-lg text-[var(--danger)] hover:bg-[var(--glass-2)]"
                aria-label="Remove photo"
              >
                <Trash size={16} weight="bold" />
              </button>
            </div>
            <input
              value={photo.caption ?? ''}
              onChange={(e) => updateCaption(index, e.target.value)}
              placeholder="Caption (max 80)"
              maxLength={80}
              className="w-full border-t border-[var(--glass-border)] bg-transparent px-2 py-1.5 text-xs text-[var(--ink-1)] outline-none focus:bg-[var(--glass-2)]"
            />
          </div>
        ))}

        {!atMax && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-[var(--r-md)] border-2 border-dashed border-[var(--glass-border-2)] bg-[var(--glass)] text-[var(--ink-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
          >
            {uploading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            ) : (
              <ImageSquare size={24} weight="bold" />
            )}
            <span className="px-3 text-center text-xs">
              {uploading ? 'Uploading…' : `Add a photo (${photos.length + 1}/${maxPhotos})`}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--danger)]">
          <X size={13} weight="bold" /> {error}
        </p>
      )}
      {atMax && (
        <p className="mt-2 text-xs text-[var(--ink-2)]">
          You can add up to {maxPhotos} photos
        </p>
      )}
    </div>
  )
}