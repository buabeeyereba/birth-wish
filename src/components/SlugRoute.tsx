import { useParams } from 'react-router-dom'
import { NotFound } from '../pages/NotFound'
import { CelebrantHome } from '../pages/CelebrantHome'
import { RESERVED_SLUGS } from '../lib/slug'

export function SlugRoute() {
  const { slug } = useParams<{ slug: string }>()
  if (slug && RESERVED_SLUGS.includes(slug)) {
    return <NotFound />
  }
  return <CelebrantHome slug={slug ?? ''} />
}
