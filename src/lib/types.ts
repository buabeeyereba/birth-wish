export type Profile = {
  id: string
  email: string | null
  referred_by_slug: string | null
  created_at: string
}

export type PageType = 'self' | 'someone_else'
export type Theme = 'sunset' | 'midnight' | 'garden'
export type Plan = 'free' | 'pro'
export type WishTone = 'prayer' | 'heartfelt' | 'funny'

export type Photo = {
  url: string
  thumb: string
  caption?: string | null
}

export type Video =
  | { kind: 'upload'; url: string; poster: string | null; duration: number | null }
  | { kind: 'link'; provider: string; url: string; embedUrl: string }

export type Gift = {
  enabled: boolean
  title: string | null
  note: string | null
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  link: string | null
}

export type Celebration = {
  id: string
  owner_id: string
  slug: string
  page_type: PageType
  name: string
  creator_name: string | null
  birthday: string | null
  timezone: string
  headline: string | null
  intro: string | null
  wish_prompt: string | null
  photos: Photo[]
  video: Video | null
  gift: Gift | null
  theme: Theme
  plan: Plan
  is_published: boolean
  accepting_wishes: boolean
  accept_anonymous: boolean
  show_wall: boolean
  view_count: number
  share_count: number
  created_at: string
}

export type Guest = {
  id: string
  celebration_id: string
  name: string
  relation: string | null
  created_at: string
}

export type Wish = {
  id: string
  celebration_id: string
  guest_id: string
  message: string
  tone: WishTone | null
  is_public: boolean
  is_hidden: boolean
  is_favorite: boolean
  created_at: string
}

export type AnonymousMessage = {
  id: string
  celebration_id: string
  message: string
  is_opened: boolean
  created_on: string
}
