import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../../lib/brand'
import { supabase } from '../../lib/supabase'
import { AmbientBackground } from '../ui/AmbientBackground'
import { Glass } from '../ui/Glass'
import type { Celebration } from '../../lib/types'

type PublicPageProps = {
  slug: string
  children: (celebration: Celebration) => ReactNode
}

export function PublicPage({ slug, children }: PublicPageProps) {
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setCelebration(null)
    setMissing(false)
    setError(null)

    async function load() {
      const { data, error: err } = await supabase
        .from('celebrations')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (!active) return
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      if (!data || !data.is_published) {
        setMissing(true)
        setLoading(false)
        return
      }
      setCelebration(data as Celebration)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <AmbientBackground className="grid min-h-svh place-items-center">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <span className="text-sm text-[var(--ink-3)]">Loading…</span>
        </div>
      </AmbientBackground>
    )
  }

  if (missing) {
    return (
      <AmbientBackground className="grid min-h-svh place-items-center px-6 text-center">
        <div className="max-w-sm">
          <Glass className="rounded-[var(--r-lg)] p-8">
            <span className="text-5xl" role="img" aria-hidden="true">
              🎈
            </span>
            <h1 className="mt-4 font-display text-2xl text-[var(--ink-1)]">
              This page doesn&apos;t exist or isn&apos;t <em className="text-[var(--gold)]">live</em> yet
            </h1>
            <Link
              to="/"
              className="mt-6 inline-flex w-full items-center justify-center rounded-[var(--r-md)] bg-[var(--gold)] px-6 py-3.5 text-base font-semibold text-[var(--bg-0)] transition-colors hover:bg-[var(--gold-2)]"
            >
              Back to {APP_NAME}
            </Link>
          </Glass>
        </div>
      </AmbientBackground>
    )
  }

  if (error || !celebration) {
    return (
      <AmbientBackground className="grid min-h-svh place-items-center px-6 text-center">
        <p className="max-w-sm text-sm text-[var(--danger)]">Couldn&apos;t load this page: {error}</p>
      </AmbientBackground>
    )
  }

  return (
    <div data-theme={celebration.theme}>
      <AmbientBackground theme={celebration.theme} embers>
        <div className="mx-auto w-full max-w-[520px] px-5 py-6">
          {children(celebration)}
        </div>
      </AmbientBackground>
    </div>
  )
}
