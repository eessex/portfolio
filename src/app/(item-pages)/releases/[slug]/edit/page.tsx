import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { isAuthed } from '@/lib/auth/guard'
import { fetchReleaseById } from '@/lib/releases/data'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
import type { PageItemProps } from '@/lib/types'
import { Loading } from '@/ui/loading'
import { EditReleaseForm } from '@/ui/releases/edit-release-form'

const title = 'Edit Release'
export const metadata: Metadata = { title }

export default function EditReleasePage({ params }: PageItemProps) {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditRelease params={params} />
      </Suspense>
    </article>
  )
}

async function EditRelease({ params }: PageItemProps) {
  const { slug } = await params
  const resolved = await resolveSlug(PagePaths.releases, slug)
  const authed = await isAuthed()
  // uncached: saving a stale form drops child ids added since
  const release =
    resolved && (await fetchReleaseById(resolved.id, authed))

  if (!release) return notFound()

  return <EditReleaseForm release={release} />
}
