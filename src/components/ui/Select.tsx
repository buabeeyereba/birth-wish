import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'

type Option = { value: string; label: string }

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string | null
  options: Array<Option | string>
  leadingIcon?: ReactNode
}

export function Select({
  label,
  error,
  options,
  leadingIcon,
  id,
  className,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-[13px] font-bold uppercase tracking-[.08em] text-[var(--ink-1)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        )}
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-[var(--r-sm)] border bg-[var(--glass-2)] px-4 py-3 pr-10 text-[var(--ink-1)]',
            'border-[var(--glass-border-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
            'focus:border-[var(--gold)]',
            error && 'border-[var(--danger)]',
            'min-h-[48px]',
          )}
          {...rest}
        >
          {options.map((o) =>
            typeof o === 'string' ? (
              <option key={o} value={o} className="text-[var(--bg-0)]">
                {o}
              </option>
            ) : (
              <option key={o.value} value={o.value} className="text-[var(--bg-0)]">
                {o.label}
              </option>
            ),
          )}
        </select>
        <CaretDown
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]"
          size={16}
          weight="duotone"
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
    </div>
  )
}
