import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Warning } from '@phosphor-icons/react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | null
  hint?: string
  leftIcon?: ReactNode
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  id,
  className,
  ...rest
}: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint ? `${inputId}-hint` : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-bold uppercase tracking-[.08em] text-[var(--ink-1)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)] [&>svg]:h-[20px] [&>svg]:w-[20px]"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hintId}
          className={cn(
            'w-full rounded-[var(--r-sm)] border bg-[var(--glass-2)] px-4 py-3 text-[var(--ink-1)]',
            'placeholder:text-[var(--ink-3)]',
            'border-[var(--glass-border-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
            'transition-colors hover:border-[var(--glass-border-2)]',
            leftIcon && 'pl-11',
            error ? 'border-[var(--danger)]' : 'focus-within:border-[var(--gold)]',
            'min-h-[48px]',
          )}
          {...rest}
        />
      </div>
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-sm text-[var(--danger)]">
          <Warning weight="duotone" size={16} aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-[var(--ink-3)]">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
