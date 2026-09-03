import { useState } from 'react'
import { Play, ArrowSquareOut } from '@phosphor-icons/react'
import type { Video } from '../lib/types'

type VideoCardProps = {
  video: Video
  name: string
}

export function VideoCard({ video, name }: VideoCardProps) {
  if (video.kind === 'upload') {
    return <UploadVideo video={video} />
  }
  if (video.provider === 'youtube' && video.embedUrl) {
    return <YoutubeVideo video={video} name={name} />
  }
  return <LinkVideo video={video} name={name} />
}

type UploadVideoProps = {
  video: Extract<Video, { kind: 'upload' }>
}

function UploadVideo({ video }: UploadVideoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="relative overflow-hidden rounded-[var(--r-md)] bg-black/80">
        {video.poster && (
          <img src={video.poster} alt="" className="aspect-video w-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
          <Play size={36} weight="fill" className="text-white/90" />
          <p className="text-sm text-white">
            Can't play on this device
          </p>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white"
          >
            Open video <ArrowSquareOut size={14} weight="bold" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <video
      controls
      playsInline
      preload="none"
      poster={video.poster ?? undefined}
      src={video.url}
      onError={() => setFailed(true)}
      className="aspect-video w-full rounded-[var(--r-md)] bg-black"
    />
  )
}

function YoutubeVideo({ video, name }: { video: Extract<Video, { kind: 'link' }>; name: string }) {
  const [play, setPlay] = useState(false)
  const match = /\/embed\/([^?/]+)/.exec(video.embedUrl)
  const ytId = match?.[1] ?? null

  if (play) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-[var(--r-md)] bg-black">
        <iframe
          src={`${video.embedUrl}?autoplay=1`}
          title={`${name}'s video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-[var(--r-md)] bg-black"
      aria-label="Play video"
    >
      {ytId ? (
        <img
          src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
          alt=""
          className="h-full w-full object-cover opacity-90 group-hover:opacity-100"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--accent)]/15">
          <Play size={40} weight="fill" className="text-[var(--accent)]" />
        </div>
      )}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--glass-3)] shadow-[var(--shadow-float)] transition-transform group-hover:scale-110">
          <Play size={28} weight="fill" className="ml-1 text-[var(--ink-1)]" />
        </span>
      </span>
    </button>
  )
}

function LinkVideo({ video, name }: { video: Extract<Video, { kind: 'link' }>; name: string }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-[var(--r-md)] bg-[var(--accent)] px-5 py-4 text-base font-semibold text-[var(--on-accent)] transition-opacity hover:opacity-90"
    >
      <Play size={18} weight="fill" /> Watch {name}&apos;s video ▶
    </a>
  )
}
