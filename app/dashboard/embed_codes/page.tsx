import { fetchEmbedCodes } from '@/lib/data/embed-codes'
import { EmbedCodeDashboard } from '@/ui/embed-codes/embed-code-dashboard'
import { Loading } from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Embed codes'
export const metadata: Metadata = { title }

export default async function EmbedCodesPage () {
  const embedCodes = await fetchEmbedCodes()

  return (
    <div>
      <h1 className='p-4'>
        {title}
      </h1>

      <div className='p-4'>
        <Suspense fallback={<Loading />}>
          <EmbedCodeDashboard embedCodes={embedCodes} />
        </Suspense>
      </div>
    </div>
  )
}
