import { useId } from 'react'
import { cn } from '../../lib/cn'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) {
  const id = useId()

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-semibold text-[var(--ink-1)]">
          {label}
        </label>
        {description && <p className="text-sm text-[var(--ink-3)]">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-[30px] w-[52px] shrink-0 rounded-full border transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked
            ? 'border-[var(--gold)] bg-[var(--gold)]'
            : 'border-[var(--glass-border-2)] bg-[var(--glass-2)]',
        )}
      >
        <span
          className={cn(
            'absolute top-[3px] h-[22px] w-[22px] rounded-full transition-transform',
            checked ? 'translate-x-[25px] bg-[var(--bg-0)]' : 'translate-x-[3px] bg-[var(--ink-2)]',
          )}
        />
      </button>
    </div>
  )
}
