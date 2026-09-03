import { useEffect, useMemo, useState } from 'react'
import { Check, X, VideoCamera, Image, ShareNetwork, Gift } from '@phosphor-icons/react'
import { Glass, IconButton } from '../ui'
import type { Celebration } from '../../lib/types'

type SetupChecklistProps = {
  celebration: Celebration
  wishCount: number
  onHide: () => void
}

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--glass-3)"
        strokeWidth="6"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

export function SetupChecklist({ celebration, wishCount, onHide }: SetupChecklistProps) {
  const key = `birthwish:checklist:${celebration.id}`
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(key) === '1'
    } catch {
      return false
    }
  })

  const steps = useMemo(() => {
    const photoCount = celebration.photos?.length ?? 0
    return [
      {
        key: 'photos',
        label: 'Add at least 3 photos',
        done: photoCount >= 3,
        icon: <Image weight="duotone" />,
      },
      {
        key: 'video',
        label: 'Add a video',
        done: celebration.video != null,
        icon: <VideoCamera weight="duotone" />,
      },
      {
        key: 'share',
        label: 'Share your link',
        done: (celebration.share_count ?? 0) > 0 || (celebration.view_count ?? 0) > 0,
        icon: <ShareNetwork weight="duotone" />,
      },
      {
        key: 'wish',
        label: 'Get your first wish',
        done: wishCount >= 1,
        icon: <Gift weight="duotone" />,
      },
    ]
  }, [celebration, wishCount])

  useEffect(() => {
    if (steps.every((s) => s.done)) {
      try {
        localStorage.setItem(key, '1')
      } catch {
        // ignore
      }
      setHidden(true)
    }
  }, [steps, key])

  if (hidden) return null

  const doneCount = steps.filter((s) => s.done).length
  const pct = Math.round((doneCount / steps.length) * 100)

  return (
    <Glass level={1} className="rounded-[var(--r-lg)] p-5">
      <div className="flex items-start gap-5">
        <div className="shrink-0">
          <ProgressRing value={pct} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-[20px] text-[var(--ink-1)]">
              {doneCount} of {steps.length} set up
            </p>
            <IconButton label="Hide checklist" size="md" onClick={() => {
              setHidden(true)
              try {
                localStorage.setItem(key, '1')
              } catch {
                // ignore
              }
              onHide()
            }}>
              <X weight="duotone" />
            </IconButton>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {steps.map((s) => (
              <li key={s.key} className="flex items-center gap-2 text-sm">
                <span
                  className={
                    s.done
                      ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--bg-0)]'
                      : 'inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--glass-border-2)] text-[var(--ink-3)]'
                  }
                >
                  {s.done && <Check weight="bold" size={14} />}
                </span>
                <span className={s.done ? 'text-[var(--ink-1)]' : 'text-[var(--ink-2)]'}>
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Glass>
  )
}
