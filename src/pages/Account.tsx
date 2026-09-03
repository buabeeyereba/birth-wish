import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  DownloadSimple,
  EnvelopeSimple,
  SignOut,
  Lock,
  Trash,
} from '@phosphor-icons/react'
import {
  AmbientBackground,
  Glass,
  Button,
  Input,
  SectionHeader,
  Divider,
  Toggle,
  Sheet,
  Avatar,
  useToast,
} from '../components/ui'
import { useAuth } from '../lib/auth'
import { APP_NAME } from '../lib/brand'
import { supabase } from '../lib/supabase'
import type { Celebration, Wish, AnonymousMessage } from '../lib/types'

function formatMemberSince(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(d)
}

function matchEvery(iso: string): boolean {
  const d = new Date(iso)
  return !Number.isNaN(d.getTime())
}

export function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    supabase
      .from('celebrations')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .then((res) => {
        if (active) setPageCount(res.count)
      })
    return () => {
      active = false
    }
  }, [user])

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

  async function sendResetLink() {
    if (!user?.email) return
    const { error: err } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) {
      setError(err.message)
      return
    }
    toast('Reset link sent. Check your inbox', 'success')
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  async function downloadData() {
    if (!user) return
    setExporting(true)
    try {
      const profileP = supabase.from('profiles').select('*').eq('id', user.id)
      const celebsP = supabase
        .from('celebrations')
        .select('*')
        .eq('owner_id', user.id) as unknown as Promise<{ data: Celebration[] | null; error: unknown }>

      const [{ data: profile }, { data: celebrations }] = await Promise.all([profileP, celebsP])

      const ids = (celebrations ?? []).map((c) => c.id)
      const sections: Record<string, unknown> = {
        profile: (profile ?? [])[0] ?? null,
        celebrations: celebrations ?? [],
      }

      if (ids.length > 0) {
        const wishP = supabase
          .from('wishes')
          .select('*, guests(name, relation)')
          .in('celebration_id', ids) as unknown as Promise<{ data: Wish[] | null; error: unknown }>
        const anonP = supabase
          .from('anonymous_messages')
          .select('*')
          .in('celebration_id', ids) as unknown as Promise<{
          data: AnonymousMessage[] | null
          error: unknown
        }>
        const [wishRes, anonRes] = await Promise.all([wishP, anonP])
        sections.wishes = wishRes.data ?? []
        sections.anonymous_messages = anonRes.data ?? []
      } else {
        sections.wishes = []
        sections.anonymous_messages = []
      }

      const blob = new Blob([JSON.stringify(sections, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'birth-wish-data.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast('Your data is being downloaded', 'success')
    } catch {
      setError('Could not export your data')
    } finally {
      setExporting(false)
    }
  }

  async function deleteAccount() {
    if (!user) return
    setDeleteError(null)
    setDeleting(true)
    try {
      const listRes = await supabase.storage.from('media').list(user.id, {
        limit: 100,
      })
      const files = (listRes.data ?? [])
        .filter((f) => f.name)
        .map((f) => `${user.id}/${f.name}`)
        .concat((listRes.data ?? []).filter((f) => !f.name).map((f) => `${user.id}/${f.id}`))
      if (files.length > 0) {
        await supabase.storage.from('media').remove(files)
      }
      const { error: rpcErr } = await supabase.rpc('delete_my_account')
      if (rpcErr) {
        setDeleteError(rpcErr.message)
        setDeleting(false)
        return
      }
      setDeleteOpen(false)
      await signOut()
      navigate('/', { replace: true })
      toast('Your account was deleted', 'success')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  return (
    <AmbientBackground>
      <div className="mx-auto w-full max-w-[720px] px-5 pb-16">
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
          <section aria-labelledby="acct-profile-title">
            <SectionHeader
              eyebrow="Profile"
              title={
                <span id="acct-profile-title">
                  Your <em className="text-[var(--gold)]">account</em>
                </span>
              }
              caption="Manage the email you sign in with and your password."
            />
            <Glass className="mt-4 rounded-[var(--r-lg)] p-5">
              <div className="flex items-start gap-4">
                <Avatar name={user?.email ?? 'Member'} size={56} className="ring-2 ring-[var(--gold)]" />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--ink-1)]">
                    <EnvelopeSimple size={17} weight="duotone" className="text-[var(--gold)]" />
                    <span className="truncate">{user?.email ?? 'No email on file'}</span>
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-3)]">
                    {user?.created_at && matchEvery(user.created_at)
                      ? `Member since ${formatMemberSince(user.created_at)}`
                      : 'Signed in'}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--ink-3)]">
                    {pageCount == null
                      ? 'Your pages loading'
                      : `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`}
                  </p>
                </div>
              </div>
            </Glass>
          </section>

          {/* Security */}
          <section aria-labelledby="acct-security-title">
            <SectionHeader
              eyebrow="Security"
              title={
                <span id="acct-security-title">
                  Your <em className="text-[var(--gold)]">password</em>
                </span>
              }
              caption="Set a new password. We’ll sign you out afterwards so you can confirm it works."
            />
            <Glass className="mt-4 rounded-[var(--r-lg)] p-5">
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
              <Divider className="my-5" />
              <p className="text-sm text-[var(--ink-3)]">
                Forgot your password?{' '}
                <button
                  type="button"
                  onClick={sendResetLink}
                  className="font-semibold text-[var(--gold)] hover:underline"
                >
                  Email me a reset link instead
                </button>
              </p>
            </Glass>
          </section>

          {/* Notifications */}
          <section aria-labelledby="acct-notifications-title">
            <SectionHeader
              eyebrow="Notifications"
              title={
                <span id="acct-notifications-title">
                  Stay in the <em className="text-[var(--gold)]">loop</em>
                </span>
              }
            />
            <Glass className="mt-4 rounded-[var(--r-lg)] p-5">
              <Toggle
                checked={false}
                onChange={() => {}}
                disabled
                label="Email me when a new wish arrives"
                description="Coming soon"
              />
            </Glass>
          </section>

          {/* Data and privacy */}
          <section aria-labelledby="acct-data-title">
            <SectionHeader
              eyebrow="Data and privacy"
              title={
                <span id="acct-data-title">
                  Your <em className="text-[var(--gold)]">data</em>
                </span>
              }
              caption="Download a copy of everything you created."
            />
            <Glass className="mt-4 rounded-[var(--r-lg)] p-5">
              <p className="text-sm text-[var(--ink-3)]">
                Anonymous messages are stored without any sender information. Your export cannot
                reveal who wrote them either.
              </p>
              <Button
                variant="secondary"
                size="md"
                className="mt-4"
                leftIcon={<DownloadSimple weight="duotone" />}
                loading={exporting}
                onClick={downloadData}
              >
                Download my data
              </Button>
            </Glass>
          </section>

          {/* Danger zone */}
          <section aria-labelledby="acct-danger-title">
            <SectionHeader
              eyebrow="Danger zone"
              title={
                <span id="acct-danger-title">
                  Delete your <em className="text-[var(--gold)]">account</em>
                </span>
              }
              caption="This removes your pages, photos, wishes and anonymous messages."
            />
            <Glass className="mt-4 rounded-[var(--r-lg)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--ink-3)]">
                  Permanently delete your account and all of your data.
                </p>
                <Button
                  variant="danger"
                  size="md"
                  leftIcon={<Trash weight="duotone" />}
                  onClick={() => {
                    setDeleteText('')
                    setDeleteError(null)
                    setDeleteOpen(true)
                  }}
                >
                  Delete my account
                </Button>
              </div>
            </Glass>
          </section>

          <div className="flex justify-center">
            <Button variant="ghost" size="md" leftIcon={<SignOut weight="duotone" />} onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </main>
      </div>

      <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account">
        <div className="flex flex-col gap-4">
          <Glass level={1} className="rounded-[var(--r-md)] p-4">
            <p className="text-sm leading-relaxed text-[var(--ink-1)]">
              This will permanently delete your pages, photos, wishes and anonymous messages. This
              cannot be undone.
            </p>
          </Glass>
          <p className="text-sm text-[var(--ink-3)]">
            Type <span className="font-semibold text-[var(--danger)]">DELETE</span> to confirm.
          </p>
          <Input
            label="Type DELETE to confirm"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            autoComplete="off"
          />
          {deleteError && <p className="text-sm text-[var(--danger)]">{deleteError}</p>}
          <Button
            variant="danger"
            size="lg"
            fullWidth
            loading={deleting}
            disabled={deleteText !== 'DELETE'}
            onClick={deleteAccount}
          >
            Delete my account
          </Button>
        </div>
      </Sheet>
    </AmbientBackground>
  )
}
