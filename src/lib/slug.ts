export const RESERVED_SLUGS = [
  'dashboard',
  'login',
  'signup',
  'reset-password',
  'create',
  'app',
  'admin',
  'api',
  'about',
  'pricing',
  'terms',
  'privacy',
  'kit',
]

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug)
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,40}$/.test(slug)
}
