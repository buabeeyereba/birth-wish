import type { WishTone } from './types'

export type StoredGuest = {
  id: string
  name: string
  relation: string | null
}

export type StoredWish = {
  message: string
  tone: WishTone | null
  is_public: boolean
  created_at: string
}

function guestKey(slug: string): string {
  return `birthwish:guest:${slug}`
}

function wishKey(slug: string): string {
  return `birthwish:wish:${slug}`
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage may be unavailable; fail silently
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function getGuest(slug: string): StoredGuest | null {
  return read<StoredGuest>(guestKey(slug))
}

export function saveGuest(slug: string, guest: StoredGuest): void {
  write(guestKey(slug), guest)
}

export function clearGuest(slug: string): void {
  remove(guestKey(slug))
}

export function getWish(slug: string): StoredWish | null {
  return read<StoredWish>(wishKey(slug))
}

export function saveWish(slug: string, wish: StoredWish): void {
  write(wishKey(slug), wish)
}
