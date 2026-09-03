import { useId, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string | null
  hint?: string
  counter?: number
}

export function Textarea({
  label,
  error,
  hint,
  counter,
  id,
  className,
  rows = 3,
  ...rest
}: TextareaProps) {
  const autoId = useId()
  const textareaId = id ?? autoId
  const errorId = error ? `${textareaId}-error` : undefined
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [rest.value])

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-[13px] font-bold uppercase tracking-[.08em] text-[var(--ink-1)]"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full resize-none rounded-[var(--r-sm)] border bg-[var(--glass-2)] px-4 py-3 text-[var(--ink-1)]',
          'placeholder:text-[var(--ink-3)]',
          'border-[var(--glass-border-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
          'focus:border-[var(--gold)]',
          error && 'border-[var(--danger)]',
          'min-h-[96px]',
        )}
        {...rest}
      />
      {(counter != null || hint) && (
        <div className="flex items-baseline justify-between gap-2">
          <p id={`${textareaId}-hint`} className="text-sm text-[var(--ink-3)]">
            {hint}
          </p>
          {counter != null && (
            <span className="ml-auto text-xs text-[var(--ink-3)] tabular-nums">{counter}</span>
          )}
        </div>
      )}
      {error && (
        <p id={errorId} className="text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  )
}
