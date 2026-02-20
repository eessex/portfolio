import type { Metadata } from 'next'
import { Suspense } from 'react'

import { NewLinkForm } from '@/app/dashboard/links/new/new-link-form'

const title = 'New Link'
export const metadata: Metadata = { title }

export default function NewLinkPage () {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense>
        <NewLinkForm />
      </Suspense>
    </article>
  )
}
