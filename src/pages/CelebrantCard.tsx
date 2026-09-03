import { PublicPage } from '../components/public/PublicPage'
import { ShareCard } from '../components/public/ShareCard'

export function CelebrantCard({ slug }: { slug: string }) {
  return (
    <PublicPage slug={slug}>
      {(celebration) => <ShareCard celebration={celebration} />}
    </PublicPage>
  )
}
