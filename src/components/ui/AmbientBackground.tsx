import { useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'

type AmbientBackgroundProps = {
  theme?: 'sunset' | 'midnight' | 'garden' | 'anonymous'
  embers?: boolean
  className?: string
  children?: React.ReactNode
}

export function AmbientBackground({
  theme,
  embers = false,
  className,
  children,
}: AmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!embers) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if ((navigator.hardwareConcurrency ?? 8) <= 4) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const count = 28

    const colors = ['#ff7a59', '#e8c170', '#f3d48f', '#ff6b6b']

    type Particle = {
      x: number
      y: number
      r: number
      vy: number
      vx: number
      a: number
      da: number
      c: string
    }

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.8,
      vy: 0.0002 + Math.random() * 0.0006,
      vx: -0.0001 + Math.random() * 0.0002,
      a: 0.05 + Math.random() * 0.35,
      da: 0.001 + Math.random() * 0.002,
      c: colors[Math.floor(Math.random() * colors.length)],
    }))

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      if (!running) return
      raf = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      for (const p of particles) {
        p.y -= p.vy
        p.x += p.vx
        p.a += p.da
        if (p.a >= 0.55 || p.a <= 0.04) p.da = -p.da
        if (p.y < -0.02) {
          p.y = 1.02
          p.x = Math.random()
        }
        if (p.x < -0.02) p.x = 1.02
        ctx.globalAlpha = Math.max(0, Math.min(0.55, p.a))
        ctx.fillStyle = p.c
        ctx.beginPath()
        ctx.arc(p.x * canvas.clientWidth, p.y * canvas.clientHeight, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    draw()

    const onVisibility = () => {
      running = document.visibilityState === 'visible'
      if (!running) cancelAnimationFrame(raf)
      else {
        cancelAnimationFrame(raf)
        draw()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [embers])

  return (
    <div
      className={cn(
        'ambient-base isolate relative min-h-svh overflow-hidden',
        theme && `[data-theme='${theme}']`,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="ambient-blob absolute -top-[20%] left-[8%] h-[45vw] w-[45vw] max-h-[720px] max-w-[720px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,122,89,0.22),transparent_62%)]" />
        <div
          className="ambient-blob absolute top-[30%] right-[5%] h-[40vw] w-[40vw] max-h-[640px] max-w-[640px] rounded-full"
          style={{
            animationDelay: '-12s',
            background:
              'radial-gradient(circle at center, rgba(232,193,112,0.14), transparent 62%)',
          }}
        />
      </div>
      {embers && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 -z-[5] h-full w-full"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
