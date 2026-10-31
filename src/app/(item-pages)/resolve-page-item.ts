import { notFound, redirect } from 'next/navigation'

import { isAuthed } from '@/lib/auth/guard'
import type { PagePath } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
import { editUrl, pageItemUrl } from '@/ui/routes'

type PageItem<T> = {
  item: T
  /**
   * True only when a draft was shown, which needed a signed-in
   * session. A published item never reads the session, so it's false
   * there even for an admin.
   */
  isAuthed: boolean
}

/**
 * The published item, else a draft for a signed-in admin. Checks a
 * draft exists before reading the session, so the page stays static
 * for anonymous visitors whenever it can.
 */
export async function fetchPublishedFirst<T>(
  fetch: (isIncludingUnpublished: boolean) => Promise<T | undefined>
): Promise<PageItem<T> | undefined> {
  const published = await fetch(false)
  if (published) return { item: published, isAuthed: false }

  const draft = await fetch(true)
  if (!draft || !(await isAuthed())) return undefined

  return { item: draft, isAuthed: true }
}

/**
 * Resolves a `/{pagePath}/{slug}` page's item for its viewer, shared
 * by the page and its metadata so both apply the same rules: an old
 * slug redirects to the current one, and a missing slug (or a draft
 * for a logged-out visitor) redirects to the index.
 */
export async function resolvePageItem<T>(
  pagePath: PagePath,
  slug: string,
  fetchById: (
    id: string,
    isIncludingUnpublished: boolean
  ) => Promise<T | undefined>
): Promise<PageItem<T>> {
  const resolved = await resolveSlug(pagePath, slug)
  if (!resolved) redirect(`/${pagePath}`)
  if (resolved.isRedirect) redirect(`/${pagePath}/${resolved.slug}`)

  const pageItem = await fetchPublishedFirst(
    (isIncludingUnpublished) =>
      fetchById(resolved.id, isIncludingUnpublished)
  )
  if (!pageItem) redirect(`/${pagePath}`)

  return pageItem
}

/**
 * Resolves a `/{pagePath}/{slug}/edit` page's item id: an old slug
 * redirects to the current slug's edit page, a missing one 404s. The
 * route is admin-only (`auth.config.ts`), so callers fetch with
 * unpublished rows included.
 */
export async function resolveEditItemId(
  pagePath: PagePath,
  slug: string
): Promise<string> {
  const resolved = await resolveSlug(pagePath, slug)
  if (!resolved) notFound()
  if (resolved.isRedirect) {
    redirect(editUrl(pageItemUrl(pagePath, resolved.slug)))
  }

  return resolved.id
}
