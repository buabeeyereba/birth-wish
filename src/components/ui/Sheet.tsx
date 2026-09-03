import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'
import { spring } from '../../lib/motion'

type SheetProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  className?: string
}

export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.activeElement as HTMLElement
    const panel = panelRef.current
    if (panel) {
      const first = panel.querySelector<HTMLElement>('button, [href], input, select, textarea')
      first?.focus()
    }
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--bg-0)]/70 backdrop-blur-[4px]"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            className={cn(
              'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[var(--r-lg)] border border-[var(--glass-border)]',
              'bg-[var(--bg-1)] text-[var(--ink-1)] shadow-[var(--shadow-float)] md:max-h-[85vh] md:w-[min(560px,100vw)] md:rounded-[var(--r-lg)]',
              className,
            )}
          >
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-[var(--glass-3)] md:hidden" />
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-5 py-4">
              <h2 className="font-display text-xl text-[var(--ink-1)]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-full text-[var(--ink-2)] hover:bg-[var(--glass-2)] hover:text-[var(--ink-1)]"
              >
                <X size={20} weight="duotone" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
