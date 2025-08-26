import { fetchLinks } from '@/lib/data/links'
import { LinksDashboard } from '@/ui/links/links-dashboard'
import { Loading } from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Links'
export const metadata: Metadata = { title }

export default async function LinksPage () {
  const links = await fetchLinks()

  return (
    <div>
      <h1 className='p-4'>
        {title}
      </h1>

      <div className='p-4'>
        <Suspense fallback={<Loading />}>
          <LinksDashboard links={links} />
        </Suspense>
      </div>
    </div>
  )
}
