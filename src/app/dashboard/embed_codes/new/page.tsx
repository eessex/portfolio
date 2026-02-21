import type { Metadata } from 'next'
import { Suspense } from 'react'

import { NewEmbedCodeForm } from '@/app/dashboard/embed_codes/new/new-embed-code-form'

const title = 'New Embed Code'
export const metadata: Metadata = { title }

export default function NewEmbedCodePage () {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense>
        <NewEmbedCodeForm />
      </Suspense>
    </article>
  )
}
