import type { Transition, Variants } from 'framer-motion'

export const spring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
  mass: 0.8,
}

export const softSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 26,
  mass: 0.9,
}

export const enterEase = [0.2, 0.8, 0.2, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: enterEase } },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28, ease: enterEase } },
}

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const press = { scale: 0.98 }

export const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: enterEase } },
}

export const sheet: Variants = {
  hidden: { y: 80, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: spring },
}
