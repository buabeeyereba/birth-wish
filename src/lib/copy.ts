import type { Celebration } from './types'

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

export function headlineFallback(pageType: Celebration['page_type'], name: string): string {
  return pageType === 'self' ? "It's my birthday! 🎂" : `It's ${name}'s birthday! Help us celebrate 🎂`
}

export function introFallback(
  pageType: Celebration['page_type'],
  name: string,
  creatorName: string | null,
): string {
  if (pageType === 'self') {
    return "Drop a wish or a prayer. It means the world to me. You'll get a card to share too."
  }
  return `${creatorName || 'Your friend'} made this page for ${name}. Drop a wish or a prayer. We'll make sure ${name} sees every one.`
}

export function wishCta(name: string): string {
  return `Leave ${name} a wish`
}

export function wishFormTitle(name: string): string {
  return firstName(name)
}

export function heroTitle(celebration: Pick<Celebration, 'page_type' | 'name'>): string {
  return `It's ${celebration.name}'s birthday! 🎂`
}

export function madeWithLove(creatorName: string | null): string | null {
  return creatorName ? `Made with love by ${creatorName}` : null
}
