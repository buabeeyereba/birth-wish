import { useNavigate } from 'react-router-dom'
import {
  Cake,
  Image,
  ShareNetwork,
  EnvelopeSimple,
  ShieldCheck,
  Sparkle,
} from '@phosphor-icons/react'
import { AmbientBackground, Glass, Button } from '../components/ui'
import { useAuth } from '../lib/auth'
import { APP_NAME } from '../lib/brand'

function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <a href="/" className="flex items-center gap-2 text-[var(--ink-1)]">
        <Cake size={22} weight="duotone" className="text-[var(--gold)]" />
        <span className="text-lg font-extrabold tracking-tight">{APP_NAME}</span>
      </a>
      <div className="flex items-center gap-2">
        {user ? (
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>
            My dashboard
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="md" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate('/signup')}>
              Create your page
            </Button>
          </>
        )}
      </div>
    </header>
  )
}

function HeroComposition() {
  return (
    <div aria-hidden="true" className="flex select-none flex-col items-center gap-4 sm:scale-100">
      <Glass
        level={2}
        className="ambient-drift w-[240px] max-w-full rounded-[var(--r-lg)] p-5"
      >
        <p className="font-display text-lg leading-snug text-[var(--ink-1)]">
          Happy birthday! Thank you for always showing up 🎂
        </p>
        <p className="mt-2 text-sm text-[var(--ink-2)]">From A friend</p>
      </Glass>
      <Glass
        level={2}
        className="ambient-slower ml-8 w-[200px] rounded-[var(--r-lg)] p-4"
      >
        <div className="flex items-center gap-2 text-[var(--ink-2)]">
          <EnvelopeSimple size={18} weight="duotone" className="text-[var(--gold)]" />
          <span className="text-sm">Anonymous message · sealed</span>
        </div>
      </Glass>
      <Glass
        level={2}
        className="ambient-slow mr-8 flex w-[200px] items-center gap-2 rounded-[var(--r-lg)] p-4"
      >
        <Sparkle size={18} weight="duotone" className="text-[var(--gold)]" />
        <span className="text-sm text-[var(--ink-2)]">Your share card</span>
        <span className="ml-auto h-4 w-8 rounded-full border border-[var(--gold)] opacity-60" />
      </Glass>
    </div>
  )
}

export function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const scrollToHow = () => {
    document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AmbientBackground embers>
      <Navbar />

      <main>
        <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 pb-16 pt-8 md:grid-cols-[7fr_5fr]">
          <div className="text-center md:text-left">
            <span className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--gold)]">
              For birthdays that deserve more than a text
            </span>
            <h1 className="font-display mt-4 text-[40px] leading-[1.1] text-[var(--ink-1)] md:text-[56px]">
              One link. <em className="text-[var(--gold)]">All</em> the birthday love.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--ink-2)] md:mx-0">
              Build a beautiful page in minutes, share a single link, and let the joy
              roll in with wishes from everyone who loves them.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-start md:justify-start">
              {user ? (
                <Button size="lg" onClick={() => navigate('/dashboard')}>
                  Go to my dashboard
                </Button>
              ) : (
                <Button size="lg" onClick={() => navigate('/signup')}>
                  Create your page
                </Button>
              )}
              <Button size="lg" variant="ghost" onClick={scrollToHow}>
                See how it works
              </Button>
            </div>
          </div>

          <div className="hidden md:block">
            <HeroComposition />
          </div>
        </section>

        <div className="md:hidden">
          <div className="px-6 pb-10">
            <div className="scale-[0.7] origin-top">
              <HeroComposition />
            </div>
          </div>
        </div>

        <section
          id="how-it-works"
          className="mx-auto w-full max-w-5xl px-6 pb-16"
          aria-labelledby="how-heading"
        >
          <h2
            id="how-heading"
            className="font-display text-center text-[26px] text-[var(--ink-1)]"
          >
            How it <em className="text-[var(--gold)]">works</em>
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-12">
            <Glass className="rounded-[var(--r-lg)] p-6 md:col-span-5">
              <span className="font-display text-[56px] leading-none text-[var(--gold)]">01</span>
              <Image size={28} weight="duotone" className="mt-4 text-[var(--gold)]" />
              <p className="mt-3 text-base text-[var(--ink-1)]">
                <strong>Build your page.</strong>
              </p>
              <p className="mt-1 text-sm text-[var(--ink-2)]">
                Photos and your words. A page in minutes.
              </p>
            </Glass>
            <Glass className="rounded-[var(--r-lg)] p-6 md:col-span-4">
              <span className="font-display text-[56px] leading-none text-[var(--gold)]">02</span>
              <ShareNetwork size={28} weight="duotone" className="mt-4 text-[var(--gold)]" />
              <p className="mt-3 text-base text-[var(--ink-1)]">
                <strong>Share your link.</strong>
              </p>
              <p className="mt-1 text-sm text-[var(--ink-2)]">
                One link on WhatsApp is all it takes.
              </p>
            </Glass>
            <Glass className="rounded-[var(--r-lg)] p-6 md:col-span-3">
              <span className="font-display text-[56px] leading-none text-[var(--gold)]">03</span>
              <EnvelopeSimple size={28} weight="duotone" className="mt-4 text-[var(--gold)]" />
              <p className="mt-3 text-base text-[var(--ink-1)]">
                <strong>Read the love.</strong>
              </p>
              <p className="mt-1 text-sm text-[var(--ink-2)]">
                Wishes and prayers, all in one place.
              </p>
            </Glass>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 pb-10">
          <Glass level={1} className="flex items-center gap-3 rounded-[var(--r-lg)] px-5 py-4">
            <ShieldCheck size={22} weight="duotone" className="shrink-0 text-[var(--gold)]" />
            <p className="text-sm text-[var(--ink-2)]">
              <strong className="text-[var(--ink-1)]">Anonymous means anonymous</strong>
              {' we store only the words, never who wrote them.'}
            </p>
          </Glass>
        </section>

        <footer className="border-t border-[var(--glass-border)] px-6 pb-10 pt-8">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[var(--ink-2)]">
              <Cake size={18} weight="duotone" className="text-[var(--gold)]" />
              <span className="font-semibold">{APP_NAME}</span>
              <span className="ml-2 text-sm text-[var(--ink-3)]">© {new Date().getFullYear()}</span>
            </span>
            {!user && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-[var(--ink-2)] hover:text-[var(--ink-1)]"
              >
                Sign in
              </button>
            )}
          </div>
        </footer>
      </main>
    </AmbientBackground>
  )
}
