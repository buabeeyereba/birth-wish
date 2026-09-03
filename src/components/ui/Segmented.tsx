import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

type Option = { value: string; label: string }

type SegmentedProps = {
  value: string
  onChange: (value: string) => void
  options: Option[]
  label?: string
}

export function Segmented({ value, onChange, options, label }: SegmentedProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass)] p-1"
    >
      {options.map((o) => {
        const selected = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative min-h-[40px] rounded-full px-4 text-sm font-semibold transition-colors',
              selected ? 'text-[var(--bg-0)]' : 'text-[var(--ink-2)] hover:text-[var(--ink-1)]',
            )}
          >
            {selected && (
              <motion.span
                layoutId="segmented-pill"
                className="absolute inset-0 rounded-full bg-[var(--gold)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
