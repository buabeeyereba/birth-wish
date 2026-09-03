export function formatBirthday(birthday?: string | null): string | null {
  if (!birthday) return null
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(birthday)
  if (!match) return null
  const month = Number(match[1])
  const day = Number(match[2])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const name = new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2000, month - 1, 1))
  return `${day} ${name}`
}

const FALLBACK_TIMEZONES = [
  'UTC',
  'Africa/Lagos',
  'Asia/Bangkok',
  'Asia/Manila',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'Australia/Sydney',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Jakarta',
  'Asia/Shanghai',
  'Africa/Nairobi',
  'Africa/Cairo',
  'Africa/Accra',
]

export function listTimezones(): string[] {
  try {
    const supported = Intl.supportedValuesOf('timeZone')
    if (supported && supported.length > 0) return supported
  } catch {
    // fall through to fallback list
  }
  return FALLBACK_TIMEZONES
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

type DateParts = { year: number; month: number; day: number }

export function nowInTimezone(timezone: string): DateParts {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
    const s = fmt.format(new Date())
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
    if (m) {
      return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) }
    }
  } catch {
    // fall through
  }
  const d = new Date()
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

export type DateBanner =
  | { kind: 'today'; days: 0 }
  | { kind: 'upcoming'; days: number }
  | { kind: 'passed'; days: number }

export function dateBanner(birthday?: string | null, timezone?: string): DateBanner | null {
  if (!birthday) return null
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(birthday)
  if (!match) return null
  const birthMonth = Number(match[1])
  const birthDay = Number(match[2])
  if (birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) return null

  const now = nowInTimezone(timezone || 'UTC')
  const today = Date.UTC(now.year, now.month - 1, now.day)
  const thisYearBirthday = Date.UTC(now.year, birthMonth - 1, birthDay)
  const diff = Math.round((thisYearBirthday - today) / 86400000)

  if (diff === 0) return { kind: 'today', days: 0 }
  if (diff > 0) return { kind: 'upcoming', days: diff }

  const was = Math.round((today - thisYearBirthday) / 86400000)
  return { kind: 'passed', days: was }
}
