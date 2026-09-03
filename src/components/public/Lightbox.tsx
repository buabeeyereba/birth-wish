import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react'
import type { Photo } from '../../lib/types'

type LightboxProps = {
  photos: Photo[]
  index: number
  onClose: () => void
}

export function Lightbox({ photos, index, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(index)
  const [touchX, setTouchX] = useState<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % photos.length)
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photos.length, onClose])

  const photo = photos[current]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return
        const dx = e.changedTouches[0].clientX - touchX
        if (dx > 50) setCurrent((c) => (c - 1 + photos.length) % photos.length)
        else if (dx < -50) setCurrent((c) => (c + 1) % photos.length)
        setTouchX(null)
      }}
    >
      <div className="flex items-center justify-between p-4 text-white">
        <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <X size={22} weight="bold" />
        </button>
        <span className="text-sm text-white/80">
          {current + 1} / {photos.length}
        </span>
        <span className="w-10" />
      </div>

      <div className="relative flex flex-1 items-center overflow-hidden">
        <button
          type="button"
          onClick={() => setCurrent((c) => (c - 1 + photos.length) % photos.length)}
          aria-label="Previous"
          className="absolute left-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
        >
          <ArrowLeft size={22} weight="bold" />
        </button>
        <img src={photo.url} alt={photo.caption || `Photo ${current + 1}`} className="mx-auto max-h-full max-w-full object-contain" />
        <button
          type="button"
          onClick={() => setCurrent((c) => (c + 1) % photos.length)}
          aria-label="Next"
          className="absolute right-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
        >
          <ArrowRight size={22} weight="bold" />
        </button>
      </div>

      {photo.caption && <p className="px-6 pb-6 text-center text-sm text-white/90">{photo.caption}</p>}
    </div>
  )
}
