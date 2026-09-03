import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { AmbientBackground } from '../components/ui/AmbientBackground'

export function NotFound() {
  return (
    <AmbientBackground theme="anonymous" embers={false}>
      <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <span className="text-6xl" role="img" aria-hidden="true">
          🎈
        </span>
        <h1 className="font-display mt-4 text-4xl font-bold text-[var(--ink-1)]">
          Page not found
        </h1>
        <p className="mt-3 max-w-sm text-sm text-[var(--ink-2)]">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to="/">
          <Button className="mt-8">Go home</Button>
        </Link>
      </div>
    </AmbientBackground>
  )
}