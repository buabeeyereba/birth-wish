import { useState } from 'react'
import { Lightbox } from './Lightbox'
import type { Photo } from '../../lib/types'

type GalleryProps = {
  photos: Photo[]
}

export function Gallery({ photos }: GalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  return (
    <div>
      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
        {photos.map((photo, index) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => setLightbox(index)}
            className="w-40 shrink-0 snap-start text-left"
          >
            <img
              src={photo.thumb}
              alt={photo.caption || `Photo ${index + 1}`}
              className="aspect-[3/4] w-full rounded-[var(--r-md)] object-cover"
              loading="lazy"
            />
            {photo.caption && (
              <p className="mt-1 truncate px-0.5 text-xs text-[var(--ink-2)]">{photo.caption}</p>
            )}
          </button>
        ))}
      </div>
      {lightbox !== null && (
        <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
