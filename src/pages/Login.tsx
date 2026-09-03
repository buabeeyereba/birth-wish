import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Cake } from '@phosphor-icons/react'
import { AmbientBackground, Glass, Button, Input } from '../components/ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { APP_NAME } from '../lib/brand'

function humanSignInError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) {
    return 'Email or password is incorrect'
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts. Please try again shortly.'
  }
  return message
}

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const next = searchParams.get('next') || '/dashboard'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter your email and password')
      return
    }

    setSubmitting(true)
    const { error: err } = await signIn(email.trim(), password)
    setSubmitting(false)

    if (err) {
      setError(humanSignInError(err))
      return
    }

    navigate(next, { replace: true })
  }

  async function handleForgot() {
    setResetError(null)
    setResetSent(false)
    if (!email.trim()) {
      setResetError('Enter your email first, then request a reset.')
      return
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) {
      setResetError(err.message)
    } else {
      setResetSent(true)
    }
  }

  return (
    <AmbientBackground className="flex flex-col items-center justify-center px-5 py-12 md:pr-[58%]">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex flex-col items-center gap-2">
          <a href="/" className="flex items-center gap-2 text-[var(--ink-1)]">
            <Cake size={26} weight="duotone" className="text-[var(--gold)]" />
            <span className="text-xl font-extrabold tracking-tight">{APP_NAME}</span>
          </a>
        </div>

        <Glass level={1} className="rounded-[var(--r-lg)] p-7">
          <h1 className="font-display text-[30px] leading-[1.15] text-[var(--ink-1)]">
            Welcome <em className="text-[var(--gold)]">back</em>
          </h1>
          <p className="mt-1.5 text-[var(--ink-2)]">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-[var(--gold)] hover:text-[var(--gold-2)]">
              Create a page
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-sm text-[var(--ink-2)] underline underline-offset-2 hover:text-[var(--gold)]"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            {resetError && <p className="text-sm text-[var(--danger)]">{resetError}</p>}
            {resetSent && (
              <p className="text-sm text-[var(--success)]">
                Reset link sent to {email.trim()}. Check your inbox.
              </p>
            )}

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              Sign in
            </Button>
          </form>
        </Glass>
      </div>
    </AmbientBackground>
  )
}
