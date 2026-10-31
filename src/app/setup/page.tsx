import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'

import { SetupForm } from '@/app/setup/setup-form/setup-form'
import { hasUsers } from '@/lib/users/data'

const title = 'Set up your site'
export const metadata: Metadata = { title }

/**
 * Only reachable before the first admin exists: once one does, this
 * 404s immediately rather than streaming the header and a loading
 * state first. No Suspense boundary, so there's no shell to flash —
 * connection() just opts the whole page out of static rendering,
 * since the row it checks can be created by a submit at any moment.
 */
export default async function SetupPage() {
  await connection()
  if (await hasUsers()) notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <SetupForm />
    </article>
  )
}
