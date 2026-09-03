import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, EnvelopeSimple, SignOut, User, Lock } from '@phosphor-icons/react'
import {
  AmbientBackground,
  Glass,
  Button,
  Input,
  SectionHeader,
  Divider,
  useToast,
} from '../components/ui'
import { useAuth } from '../lib/auth'
import { APP_NAME } from '../lib/brand'
import { supabase } from '../lib/supabase'

function formatMemberSince(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(d)
}

export function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
    toast('Password updated. You’ll need to sign in again', 'success')
    setPassword('')
    setConfirm('')
    await signOut()
    navigate('/login', { replace: true })
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <AmbientBackground>
      <div className="mx-auto w-full max-w-[760px] px-5 pb-16">
        <header className="flex items-center gap-3 py-5">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-sm)] bg-[var(--glass)] text-[var(--ink-1)] transition-colors hover:bg-[var(--glass-2)]"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} weight="duotone" />
          </button>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-[var(--ink-1)]">
              {APP_NAME}
            </span>
            <p className="text-sm text-[var(--ink-3)]">Account</p>
          </div>
        </header>

        <main className="mt-2 flex flex-col gap-8">
          {/* Profile */}
          <section aria-label="Profile">
            <SectionHeader
              eyebrow="Profile"
              title={
                <>
                  Your <em className="text-[var(--gold)]">account</em>
                </>
              }
              caption="Manage the email you sign in with and your password."
            />
            <Divider className="my-4" />
            <Glass className="rounded-[var(--r-lg)] p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[var(--r-md)] bg-[var(--glass-2)] text-[var(--gold)]">
                  <User size={26} weight="duotone" />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--ink-1)]">
                    <EnvelopeSimple size={17} weight="duotone" className="text-[var(--gold)]" />
                    <span className="truncate">{user?.email ?? 'No email on file'}</span>
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-3)]">
                    {user?.created_at
                      ? `Member since ${formatMemberSince(user.created_at)}`
                      : 'Signed in'}
                  </p>
                </div>
              </div>
              <Divider className="my-5" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-[var(--ink-3)]">
                  Signing out keeps your pages live. Your links keep working.
                </div>
                <Button
                  variant="ghost"
                  size="md"
                  leftIcon={<SignOut weight="duotone" />}
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </div>
            </Glass>
          </section>

          {/* Password */}
          <section aria-label="Change password">
            <SectionHeader
              eyebrow="Password"
              title={
                <>
                  Change your <em className="text-[var(--gold)]">password</em>
                </>
              }
              caption="We’ll sign you out afterwards so you can confirm it works."
            />
            <Divider className="my-4" />
            <Glass className="rounded-[var(--r-lg)] p-5">
              <form onSubmit={changePassword} className="flex flex-col gap-4">
                <Input
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  leftIcon={<Lock weight="duotone" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  leftIcon={<Lock weight="duotone" />}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
                <Button type="submit" size="lg" loading={submitting} className="self-start">
                  Update password
                </Button>
              </form>
            </Glass>
          </section>
        </main>
      </div>
    </AmbientBackground>
  )
}