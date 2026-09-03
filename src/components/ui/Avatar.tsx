import { cn } from '../../lib/cn'

type AvatarProps = {
  name: string
  src?: string | null
  size?: number
  ring?: boolean
  className?: string
}

const palette = ['#e8c170', '#ff7a59', '#7dd3a0', '#8fb8ff', '#7fe0d0', '#f3d48f']

export function Avatar({ name, src, size = 44, ring = false, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  const hash = [...name].reduce((a, c) => a + (c.charCodeAt(0) || 0), 0)
  const bg = palette[hash % palette.length]

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-display',
        ring && "shadow-[0_0_0_3px_var(--gold)]",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="h-full w-full rounded-full object-cover"
          style={{ boxShadow: ring ? '0 0 0 3px var(--gold)' : undefined }}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full text-[var(--bg-0)]"
          style={{ background: bg }}
        >
          {initials}
        </span>
      )}
    </span>
  )
}
