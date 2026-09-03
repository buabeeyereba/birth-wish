import { supabase } from './supabase'
import type { Photo, Video } from './types'

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image failed to load'))
    }
    img.src = url
  })
}

async function decodeBitmap(file: Blob): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return null
  }
}

function imageToCanvas(
  source: ImageBitmap | HTMLImageElement,
  maxEdge: number,
): HTMLCanvasElement {
  let { width, height } = source
  const scale = Math.min(1, maxEdge / Math.max(width, height))
  width = Math.max(1, Math.round(width * scale))
  height = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable')
  }
  ctx.drawImage(source, 0, 0, width, height)
  return canvas
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('JPEG encode failed'))),
      'image/jpeg',
      quality,
    )
  })
}

export async function processImage(
  file: File,
): Promise<{ display: Blob; thumb: Blob }> {
  const bitmap = await decodeBitmap(file)

  if (bitmap) {
    const displayCanvas = imageToCanvas(bitmap, 2048)
    const thumbCanvas = imageToCanvas(bitmap, 640)
    bitmap.close()
    const display = await canvasToJpeg(displayCanvas, 0.86)
    const thumb = await canvasToJpeg(thumbCanvas, 0.8)
    return { display, thumb }
  }

  const img = await loadImage(file)
  const displayCanvas = imageToCanvas(img, 2048)
  const thumbCanvas = imageToCanvas(img, 640)
  const display = await canvasToJpeg(displayCanvas, 0.86)
  const thumb = await canvasToJpeg(thumbCanvas, 0.8)
  return { display, thumb }
}

export async function uploadPhoto(
  userId: string,
  file: File,
): Promise<Photo> {
  const id = crypto.randomUUID()
  const { display, thumb } = await processImage(file)

  const displayPath = `${userId}/${id}.jpg`
  const thumbPath = `${userId}/${id}_thumb.jpg`

  const displayRes = await supabase.storage
    .from('media')
    .upload(displayPath, display, { contentType: 'image/jpeg' })
  if (displayRes.error) {
    throw new Error(displayRes.error.message)
  }

  const thumbRes = await supabase.storage
    .from('media')
    .upload(thumbPath, thumb, { contentType: 'image/jpeg' })
  if (thumbRes.error) {
    await supabase.storage.from('media').remove([displayPath])
    throw new Error(thumbRes.error.message)
  }

  const { data: displayPublic } = supabase.storage.from('media').getPublicUrl(displayPath)
  const { data: thumbPublic } = supabase.storage.from('media').getPublicUrl(thumbPath)

  return { url: displayPublic.publicUrl, thumb: thumbPublic.publicUrl, caption: '' }
}

export async function deletePhoto(photo: Photo): Promise<void> {
  const paths: string[] = []
  for (const url of [photo.url, photo.thumb]) {
    const path = storagePathFromUrl(url)
    if (path) paths.push(path)
  }
  if (paths.length === 0) return
  try {
    await supabase.storage.from('media').remove(paths)
  } catch {
    // best-effort; never block the UI on failure
  }
}

function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = '/media/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const path = url.slice(idx + marker.length)
  return path || null
}

export type VideoProbe = { duration: number; width: number; height: number }

export function probeVideo(file: Blob): Promise<VideoProbe> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const cleanup = () => URL.revokeObjectURL(url)

    video.onloadedmetadata = () => {
      cleanup()
      resolve({
        duration: Number.isFinite(video.duration) ? Math.round(video.duration) : 0,
        width: video.videoWidth,
        height: video.videoHeight,
      })
    }
    video.onerror = () => {
      cleanup()
      reject(new Error('Could not read this video'))
    }
    video.src = url
  })
}

export async function capturePoster(file: Blob, duration: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.src = url

    let done = false
    const finish = (blob: Blob | null) => {
      if (done) return
      done = true
      URL.revokeObjectURL(url)
      resolve(blob)
    }

    video.onerror = () => finish(null)

    video.onloadedmetadata = () => {
      const target = Math.min(0.5, Math.max(0.1, duration / 2))
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked)
        try {
          const maxWidth = 1280
          const scale = Math.min(1, maxWidth / (video.videoWidth || 1))
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round((video.videoWidth || 1) * scale))
          canvas.height = Math.max(1, Math.round((video.videoHeight || 1) * scale))
          const ctx = canvas.getContext('2d')
          if (!ctx) return finish(null)
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => finish(blob), 'image/jpeg', 0.85)
        } catch {
          finish(null)
        }
      }
      video.addEventListener('seeked', onSeeked)
      try {
        video.currentTime = target
      } catch {
        finish(null)
      }
    }

    // iOS may need play() then pause() before seeking is permitted
    video.oncanplay = () => {
      const p = video.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => {}).then(() => {
          try {
            video.pause()
          } catch {
            // ignore
          }
        })
      } else {
        try {
          video.pause()
        } catch {
          // ignore
        }
      }
    }
  })
}

function videoExtFromMime(mime: string): string {
  if (mime.includes('quicktime')) return 'mov'
  if (mime.includes('webm')) return 'webm'
  return 'mp4'
}

export async function uploadVideo(
  userId: string,
  file: File,
  duration: number,
): Promise<Extract<Video, { kind: 'upload' }>> {
  const id = crypto.randomUUID()
  const ext = videoExtFromMime(file.type)
  const videoPath = `${userId}/${id}.${ext}`

  const videoRes = await supabase.storage
    .from('media')
    .upload(videoPath, file, { contentType: file.type })
  if (videoRes.error) {
    throw new Error(videoRes.error.message)
  }

  let posterUrl: string | null = null
  try {
    const posterBlob = await capturePoster(file, duration)
    if (posterBlob) {
      const posterPath = `${userId}/${id}_poster.jpg`
      const posterRes = await supabase.storage
        .from('media')
        .upload(posterPath, posterBlob, { contentType: 'image/jpeg' })
      if (!posterRes.error) {
        const { data } = supabase.storage.from('media').getPublicUrl(posterPath)
        posterUrl = data.publicUrl
      }
    }
  } catch {
    posterUrl = null
  }

  if (!posterUrl) {
    try {
      const posterPath = `${userId}/${id}_poster.jpg`
      await supabase.storage.from('media').remove([posterPath])
    } catch {
      // ignore
    }
  }

  const { data } = supabase.storage.from('media').getPublicUrl(videoPath)
  return { kind: 'upload', url: data.publicUrl, poster: posterUrl, duration }
}

type ParsedLinkVideo = Extract<Video, { kind: 'link' }>

export function parseVideoLink(raw: string): { video: ParsedLinkVideo } | { error: string } {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return { error: "That doesn't look like a valid link" }
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { error: "That doesn't look like a valid link" }
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase()

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
    let id: string | null = null
    if (host === 'youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] ?? null
    } else {
      id = url.searchParams.get('v')
      if (!id) {
        const path = url.pathname
        const shorts = /^\/shorts\/([^/]+)/.exec(path)
        if (shorts) id = shorts[1]
      }
    }
    if (!id) {
      return { error: "Couldn't find that YouTube video" }
    }
    return {
      video: {
        kind: 'link',
        provider: 'youtube',
        url: raw.trim(),
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      },
    }
  }

  if (host.includes('tiktok.com')) {
    return { video: { kind: 'link', provider: 'tiktok', url: raw.trim(), embedUrl: '' } }
  }

  if (host.includes('instagram.com')) {
    return { video: { kind: 'link', provider: 'instagram', url: raw.trim(), embedUrl: '' } }
  }

  return { video: { kind: 'link', provider: 'other', url: raw.trim(), embedUrl: '' } }
}
