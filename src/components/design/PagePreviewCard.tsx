import { motion } from 'framer-motion'
import { Cake, Heart, ShareNetwork, Sparkle, Trophy } from '@phosphor-icons/react'
import { Button } from '../ui/Button'
import { Glass } from '../ui/Glass'
import { spring } from '../../lib/motion'

const swatches: Record<string, string> = {
  sunset: '#f3d48f',
  midnight: '#7fe0d0',
  garden: '#2f6b4f',
}

export function PagePreviewCard() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={spring}
      className="relative overflow-hidden rounded-[var(--r-lg)]"
    >
      <Glass className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-2)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--ink-2)]">
              <Sparkle size={12} weight="fill" />
              Live celebration
            </div>
            <h3 className="font-display text-3xl font-bold leading-tight text-[var(--ink-1)]">
              Ana&rsquo;s birthday
            </h3>
            <p className="mt-1 text-sm text-[var(--ink-2)]">One link, all the birthday love</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            className="grid h-11 w-11 place-items-center rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass-2)] text-[var(--ink-1)]"
            aria-label="Share"
          >
            <ShareNetwork size={20} weight="bold" />
          </motion.button>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3 rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass)] p-3">
          <div className="truncate rounded-lg border border-[var(--glass-border)] bg-[var(--glass-2)] px-3 py-2 text-sm text-[var(--ink-2)]">
            birth-wish.app/ana
          </div>
          <Button size="sm" variant="primary" onClick={() => undefined}>
            Copy link
          </Button>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { icon: Cake, label: 'Wishes', value: '128' },
            { icon: Heart, label: 'Anonymous', value: '9' },
            { icon: Trophy, label: 'Views', value: '1.4k' },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass-2)] px-3 py-3"
            >
              <Icon size={16} weight="bold" className="text-[var(--accent)]" />
              <dt className="mt-1.5 text-[11px] text-[var(--ink-2)]">{label}</dt>
              <dd className="font-display text-lg font-bold text-[var(--ink-1)]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 rounded-[var(--r-sm)] border border-[var(--glass-border)] bg-[var(--glass)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--ink-1)]">Theme</span>
            <span className="text-xs text-[var(--ink-2)]">Choose match for the mood</span>
          </div>
          <div className="mt-3 flex gap-2">
            {(['sunset', 'midnight', 'garden'] as const).map((t) => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={spring}
                className="h-9 w-9 rounded-full border-2 border-white shadow"
                style={{ background: swatches[t] }}
                aria-label={t}
              />
            ))}
          </div>
        </div>

        <button
          className="mt-5 w-full rounded-[var(--r-md)] bg-[var(--accent)] px-5 py-3.5 text-base font-semibold text-[var(--on-accent)] transition-opacity hover:opacity-90"
          onClick={() => undefined}
        >
          Open page
        </button>
      </Glass>
    </motion.article>
  )
}