import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Cake, Sparkle } from '@phosphor-icons/react'
import { AmbientBackground, Glass, Button, Input } from '../components/ui'
import { APP_NAME } from '../lib/brand'
import { supabase } from '../lib/supabase'

const REF_KEY = 'birthwish:ref'

function humanSignUpError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'That email is already registered. Sign in instead'
  }
  if (lower.includes('password')) {
    return 'Password must be at least 8 characters'
  }
  if (lower.includes('invalid email') || lower.includes('email')) {
    return 'Please enter a valid email address'
  }
  return message
}

export function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const next = searchParams.get('next') || '/dashboard'

  const ref = useMemo(() => {
    const urlRef = searchParams.get('ref')
    if (urlRef) {
      localStorage.setItem(REF_KEY, urlRef)
      return urlRef
    }
    return localStorage.getItem(REF_KEY)
  }, [searchParams])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          referred_by_slug: ref ?? null,
        },
      },
    })
    setSubmitting(false)

    if (error) {
      setError(humanSignUpError(error.message))
      return
    }

    if (data.session) {
      navigate(next, { replace: true })
      return
    }

    if (data.user) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (!signInErr) {
        navigate(next, { replace: true })
        return
      }
    }

    setError('Account created. Please sign in.')
    navigate('/login', { replace: true })
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
            Create your <em className="text-[var(--gold)]">page</em>
          </h1>
          <p className="mt-1.5 text-[var(--ink-2)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--gold)] hover:text-[var(--gold-2)]">
              Sign in
            </Link>
          </p>

          {ref && (
            <p className="mt-4 flex items-center gap-2 rounded-[var(--r-sm)] bg-[var(--glass)] px-4 py-2.5 text-sm text-[var(--ink-2)]">
              <Sparkle size={16} weight="duotone" className="shrink-0 text-[var(--gold)]" />
              Inspired by a friend&apos;s page? Your turn 🎉
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              Create my page
            </Button>
          </form>
        </Glass>
      </div>
    </AmbientBackground>
  )
}
