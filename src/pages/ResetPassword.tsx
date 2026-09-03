import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cake } from '@phosphor-icons/react'
import { AmbientBackground, Glass, Button, Input } from '../components/ui'
import { supabase } from '../lib/supabase'
import { APP_NAME } from '../lib/brand'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

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

    setInfo('Your password has been updated.')
    await supabase.auth.signOut()
    window.setTimeout(() => navigate('/login', { replace: true }), 1500)
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
            Set a <em className="text-[var(--gold)]">new</em> password
          </h1>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            {info && <p className="text-sm text-[var(--success)]">{info}</p>}
            <Button type="submit" size="lg" fullWidth loading={submitting}>
              Update password
            </Button>
          </form>
        </Glass>
      </div>
    </AmbientBackground>
  )
}
