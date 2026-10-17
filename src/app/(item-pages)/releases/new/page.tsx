import type { Metadata } from 'next'

import { EditReleaseForm } from '@/ui/releases/edit-release-form'

const title = 'New Release'
export const metadata: Metadata = { title }

export default function NewReleasePage() {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditReleaseForm />
    </article>
  )
}
