import { Link } from 'react-router-dom'
import { APP_NAME } from '../../lib/brand'
import { Glass } from '../ui/Glass'
import type { Celebration } from '../../lib/types'

type FooterCTAProps = {
  celebration: Pick<Celebration, 'slug'>
}

export function FooterCTA({ celebration }: FooterCTAProps) {
  return (
    <Glass className="mt-8 rounded-[var(--r-lg)] px-6 py-8 text-center">
      <p className="font-display text-lg text-[var(--ink-1)]">
        Got a birthday coming up? Create your own {APP_NAME} page.
      </p>
      <Link
        to={`/signup?ref=${celebration.slug}`}
        className="mt-4 inline-block rounded-full bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--on-accent)] transition-opacity hover:opacity-90"
      >
        Create mine
      </Link>
    </Glass>
  )
}
