import type { Theme } from '../lib/types'

export type ThemeColors = {
  name: Theme
  pageGradient: string
  cardBg: string
  cardText: string
  cardMuted: string
  accent: string
  accentText: string
  heading: string
  bodyBg: string
}

export const themes: Record<Theme, ThemeColors> = {
  sunset: {
    name: 'sunset',
    pageGradient: 'linear-gradient(180deg, #fdba74 0%, #f97316 55%, #fb7185 100%)',
    cardBg: '#fffaf5',
    cardText: '#3f3428',
    cardMuted: '#8a7a68',
    accent: '#f97316',
    accentText: '#ffffff',
    heading: '#4a1d0d',
    bodyBg: '#fdf8f3',
  },
  midnight: {
    name: 'midnight',
    pageGradient: 'linear-gradient(180deg, #1e1b4b 0%, #4c1d95 60%, #6d28d9 100%)',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    cardText: '#f3f0ff',
    cardMuted: '#b9b0e0',
    accent: '#a78bfa',
    accentText: '#1e1b4b',
    heading: '#ffffff',
    bodyBg: '#151129',
  },
  garden: {
    name: 'garden',
    pageGradient: 'linear-gradient(180deg, #d9f6e4 0%, #99d6b8 55%, #f9c8d8 100%)',
    cardBg: '#ffffff',
    cardText: '#2f3b32',
    cardMuted: '#748572',
    accent: '#4f9d69',
    accentText: '#ffffff',
    heading: '#21402a',
    bodyBg: '#f2faf4',
  },
}

export const DEFAULT_THEME: Theme = 'sunset'
