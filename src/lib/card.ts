import { themes } from '../theme/themes'
import { toneEmoji } from '../components/public/WishCard'
import { APP_NAME } from './brand'
import type { Celebration, Guest, WishTone } from './types'

const W = 1080
const H = 1350

type CardData = {
  name: string
  message: string
  tone: WishTone | null
  fromName: string | null
  fromRelation: string | null
  photoUrl: string | null
  gradient: string
}

function parseGradient(gradient: string): { color: string; stop: number }[] {
  const stops: { color: string; stop: number }[] = []
  const re = /([#][0-9a-fA-F]{3,8})\s*(\d+(?:\.\d+)?)%?/g
  let match: RegExpExecArray | null
  while ((match = re.exec(gradient)) !== null) {
    const raw = match[1]
    const stop = match[2] !== undefined ? Number(match[2]) / 100 : stops.length / 5
    stops.push({ color: raw, stop })
  }
  if (stops.length === 0) {
    stops.push({ color: '#f97316', stop: 0 })
  }
  return stops
}

function drawBackground(ctx: CanvasRenderingContext2D, data: CardData) {
  const stops = parseGradient(data.gradient)
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  stops.forEach(({ color, stop }) => grad.addColorStop(stop, color))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const soft = ctx.createRadialGradient(W / 2, H * 0.25, 0, W / 2, H * 0.25, W * 0.7)
  soft.addColorStop(0, 'rgba(255,255,255,0.18)')
  soft.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = soft
  ctx.fillRect(0, 0, W, H)
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('700 110px "Instrument Serif"'),
      document.fonts.load('500 56px "Manrope"'),
      document.fonts.load('600 44px "Manrope"'),
    ])
  } catch {
    // fonts are best-effort; fall back silently to the system stack
  }
}

async function renderCardImage(data: CardData): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  await ensureFonts()

  drawBackground(ctx, data)

  const avatarSize = 220
  const avatarX = (W - avatarSize) / 2
  const avatarY = 150
  ctx.save()
  ctx.beginPath()
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
  ctx.clip()

  let photo = null
  if (data.photoUrl) {
    photo = await loadImage(data.photoUrl)
  }
  if (photo) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize)
    ctx.drawImage(photo, avatarX, avatarY, avatarSize, avatarSize)
    ctx.lineWidth = 8
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.stroke()
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize)
    const initial = data.name.trim().slice(0, 1).toUpperCase() || '🎂'
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '400 110px "Instrument Serif", serif'
    ctx.fillText(initial, avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 8)
  }
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  const label = `It's ${data.name}'s birthday!`
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = '400 50px "Instrument Serif", serif'
  ctx.fillText(label, W / 2, avatarY + avatarSize + 64)

  const emoji = toneEmoji(data.tone) || '🎂'
  ctx.font = '96px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", system-ui, sans-serif'
  ctx.fillText(emoji, W / 2, avatarY + avatarSize + 200)

  const panelY = avatarY + avatarSize + 260
  const panelH = 470
  const panelW = 860
  const panelX = (W - panelW) / 2
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.18)'
  ctx.shadowBlur = 50
  ctx.shadowOffsetY = 18
  roundRectPath(ctx, panelX, panelY, panelW, panelH, 48)
  ctx.fillStyle = 'rgba(255,255,255,0.97)'
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = '#3f3428'
  const maxTextWidth = panelW - 140
  const wordsMax = 200
  const messagePreview = data.message.length > wordsMax ? `${data.message.slice(0, wordsMax).trimEnd()}…` : data.message
  ctx.font = '500 56px "Manrope", sans-serif'
  const lines = wrapText(ctx, messagePreview, maxTextWidth)
  const shownLines = lines.slice(0, 4)
  const lineHeight = 78
  const startY = panelY + panelH / 2 - (shownLines.length * lineHeight) / 2 + 40
  shownLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * lineHeight)
  })
  if (lines.length > shownLines.length) {
    ctx.fillText('…', W / 2, startY + shownLines.length * lineHeight + 6)
  }

  const attribution = data.fromName
    ? data.fromRelation
      ? `From ${data.fromName} · ${data.fromRelation}`
      : `From ${data.fromName}`
    : ''
  if (attribution) {
    ctx.fillStyle = '#8a7a68'
    ctx.font = '500 46px "Manrope", sans-serif'
    ctx.fillText(attribution, W / 2, panelY + panelH - 46)
  }

  const footerY = H - 120
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = '600 44px "Manrope", sans-serif'
  ctx.fillText(`${APP_NAME} ✨`, W / 2, footerY)

  return canvas.toDataURL('image/png')
}

export type CardInput = {
  celebration: Pick<Celebration, 'name' | 'theme' | 'photos'>
  guest: Pick<Guest, 'name' | 'relation'> | null
  message: string
  tone: WishTone | null
}

export async function makeCardImage(input: CardInput): Promise<string> {
  const colors = themes[input.celebration.theme]
  const photoUrl = input.celebration.photos[0]?.url ?? null
  return renderCardImage({
    name: input.celebration.name.trim() || 'you',
    message: input.message.trim() || 'Happy birthday! 🎂',
    tone: input.tone,
    fromName: input.guest?.name ?? null,
    fromRelation: input.guest?.relation ?? null,
    photoUrl,
    gradient: colors.pageGradient,
  })
}
