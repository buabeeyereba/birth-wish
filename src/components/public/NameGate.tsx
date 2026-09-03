import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Glass } from '../ui/Glass'
import { supabase } from '../../lib/supabase'
import { saveGuest, type StoredGuest } from '../../lib/guest'
import type { Guest } from '../../lib/types'

type NameGateProps = {
  celebration: { id: string; name: string; photos: { url: string }[] }
  slug: string
  onComplete: (guest: Guest) => void
}

export function NameGate({ celebration, slug, onComplete }: NameGateProps) {
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Please tell us your name')
      return
    }
    setSubmitting(true)
    const { data, error: err } = await supabase
      .from('guests')
      .insert({ celebration_id: celebration.id, name: trimmedName, relation: relation.trim() || null })
      .select()
      .single()
    setSubmitting(false)

    if (err) {
      setError(err.message)
      return
    }
    const stored: StoredGuest = {
      id: data.id,
      name: data.name,
      relation: data.relation,
    }
    saveGuest(slug, stored)
    onComplete(data as Guest)
  }

  const avatar = celebration.photos[0]?.url

  return (
    <div className="flex min-h-svh flex-col items-center justify-center py-12">
      <div className="w-full max-w-sm text-center">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="mx-auto h-24 w-24 rounded-full border-4 border-[var(--glass-border-2)] object-cover shadow-[var(--shadow-float)]"
          />
        ) : (
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-[var(--glass-border-2)] bg-[var(--glass-2)] font-display text-3xl text-[var(--ink-1)] shadow-[var(--shadow-float)]">
            {celebration.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <h1 className="mt-4 font-display text-2xl text-[var(--ink-1)]">
          Before you leave a wish for {celebration.name}, who&apos;s this <em className="text-[var(--gold)]">from</em>?
        </h1>

        <form onSubmit={handleSubmit} autoComplete="off" className="mt-6 flex flex-col gap-4 text-left">
          <Glass level={2} className="rounded-[var(--r-md)] p-4">
            <div className="flex flex-col gap-3">
              <Input
                label="Your name"
                name="guest_name"
                autoComplete="name"
                autoCapitalize="words"
                inputMode="text"
                enterKeyHint="next"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ada"
              />
              <Input
                label={`How do you know ${celebration.name}? (optional)`}
                name="guest_relation"
                autoComplete="off"
                autoCapitalize="words"
                inputMode="text"
                enterKeyHint="next"
                value={relation}
                maxLength={60}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. college friend"
              />
              {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
              <Button type="submit" size="lg" fullWidth loading={submitting}>
                Continue
              </Button>
            </div>
          </Glass>
        </form>
      </div>
    </div>
  )
}
