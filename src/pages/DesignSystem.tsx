import { ArrowUpRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { PagePreviewCard } from '../components/design/PagePreviewCard'
import { Button } from '../components/ui/Button'
import { Glass } from '../components/ui/Glass'
import { AmbientBackground } from '../components/ui/AmbientBackground'
import { APP_NAME } from '../lib/brand'

export function DesignSystem() {
  return (
    <AmbientBackground theme="sunset">
      <div className="mx-auto w-full max-w-[760px] px-5 py-8">
        <header className="flex items-center justify-between gap-4">
          <span className="font-display text-lg font-semibold text-[var(--gold-2)]">{APP_NAME}</span>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-[var(--ink-2)] hover:bg-[var(--glass-2)]">
              Back
            </Button>
          </Link>
        </header>

        <main className="mt-10">
          <Glass className="p-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              Design vibe
            </span>
            <h1 className="font-display mt-2 text-3xl font-bold leading-tight text-[var(--ink-1)]">
              Warm, tactile &ldquo;friend-crafted&rdquo; utility
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">
              A birthday product should feel handmade, not templated. Asymmetric
              card grids, layered 1px borders with low-opacity fills, spring-physics
              micro-interactions, and recognisable stroke icons. Never stock
              Lucide or flat blue gradients.
            </p>
          </Glass>

          <h2 className="font-display mt-10 text-2xl font-bold text-[var(--ink-1)]">
            Demo. The celebration card
          </h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-start">
            <PagePreviewCard />
            <Glass className="p-6 lg:top-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                <ArrowUpRight size={14} weight="bold" /> System notes
              </span>
              <ul className="mt-4 space-y-4 text-sm">
                {[
                  ['Icons', 'Phosphor, Bold weight. Tactile, curved geometry.'],
                  ['Type', 'Instrument Serif heads + Manrope body (Thai fallback).'],
                  ['Surfaces', '1px borders at low opacity over translucent glass.'],
                  ['Motion', 'Framer Motion springs: stiffness 320, damping 24.'],
                  ['Colour', 'Three hand-tuned celebration tones, never #3B82F6.'],
                ].map(([k, v]) => (
                  <li key={k}>
                    <span className="font-semibold text-[var(--ink-1)]">{k}</span>
                    <span className="block text-[var(--ink-2)]">{v}</span>
                  </li>
                ))}
              </ul>
            </Glass>
          </div>
        </main>
      </div>
    </AmbientBackground>
  )
}