import { fetchEmbedCodes } from '@/lib/data'
import { EmbedCodeDashboard } from '@/ui/embed-codes/embed-code-dashboard'
import Loading from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Embed Codes'
export const metadata: Metadata = { title }

export default async function DashboardPage () {
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
