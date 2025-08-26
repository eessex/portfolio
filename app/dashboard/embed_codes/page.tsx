import { deleteEmbedCode, editEmbedCode } from '@/lib/actions/embed-codes'
import { fetchEmbedCodes } from '@/lib/data/embed-codes'
import { Dashboard } from '@/ui/dashboard/dashboard'
import { Loading } from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Embed Codes'
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
          <Dashboard
            itemType='embedCode'
            items={embedCodes}
            editItem={editEmbedCode}
            deleteItem={deleteEmbedCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
