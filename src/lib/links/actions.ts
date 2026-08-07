'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { fetchLinksByIds } from '@/lib/links/data'
import {
  type CreateLink,
  createLinkSchema,
  type Link,
  linkSchema,
  LinkTypes
} from '@/lib/links/schemas/db'
import {
  extractIndexedGroups,
  formatDbResponseForClient,
  normalizeFormData
} from '@/lib/util'

export async function editLink(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createLinkSchema,
    itemType: 'links',
    invalidate: invalidateLinkTags,
    save: (link) => (id ? updateLink(link, id) : createLink(link))
  })
}

/**
 * Links are embedded directly into these parents' cached fetches via
 * build_link_json, so saving/deleting one must invalidate those caches too,
 * not just the links list.
 */
function invalidateLinkTags() {
  updateTag('links')
  updateTag('releases')
  updateTag('events')
  updateTag('projects')
  updateTag('published-editions')
}

export async function deleteLink(link: Link) {
  return runDeleteAction<Link>({
    itemType: 'links',
    invalidate: invalidateLinkTags,
    del: async () => {
      await sql`
        DELETE FROM links
        WHERE id = ${link.id}
          OR url = ${link.url}
      `
    }
  })
}

/**
 * Creates a new link from raw (unnormalized) field data, e.g. an
 * indexed group pulled out of another domain's form submission by a
 * multi-item picker. Mirrors `editLink`'s own normalize -> validate ->
 * save pipeline, since it runs outside `runFormAction`.
 */
export async function createLinkFromFields(
  fields: Record<string, unknown>
): Promise<Link> {
  const parsed = createLinkSchema.safeParse(normalizeFormData(fields))
  if (!parsed.success) {
    throw new Error(
      `Invalid link data: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(', ')}`
    )
  }
  return createLink(parsed.data)
}

/**
 * Resolves a reorderable multi-link picker's submitted entries (mix of
 * existing selections and pending inline creations, in the user's
 * chosen order — see `extractIndexedGroups`) into an ordered list of
 * link ids.
 */
export async function resolveOrderedLinkIds(
  data: Record<string, unknown>,
  prefix = 'links'
): Promise<{ linkIds: string[] }> {
  const entries = extractIndexedGroups(data, prefix)
  const linkIds = await Promise.all(
    entries.map((entry) =>
      entry.kind === 'existing'
        ? entry.id
        : createLinkFromFields(entry.fields).then((link) => link.id)
    )
  )
  return { linkIds }
}

async function createLink(link: CreateLink) {
  try {
    const {
      attribution,
      isHiddenOnAboutPage,
      publishDate,
      quotation,
      title,
      type,
      url
    } = toDbRow(link)
    const rows = await sql`
      INSERT INTO links (
        attribution,
        is_hidden_on_about_page,
        publish_date,
        quotation,
        title,
        type,
        url,
        created_at
      ) VALUES (
        ${attribution},
        ${isHiddenOnAboutPage},
        ${publishDate},
        ${quotation},
        ${title},
        ${type},
        ${url},
        current_timestamp
      )
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to create link.')
    return formatDbResponseForClient(row, linkSchema)
  } catch (cause) {
    throw new Error('Failed to create link.', { cause })
  }
}

async function updateLink(link: CreateLink, id: string) {
  const [existingLink] = await fetchLinksByIds([id])
  try {
    const {
      attribution,
      isHiddenOnAboutPage,
      publishDate,
      quotation,
      title,
      type,
      url
    } = toDbRow(link, existingLink)
    const rows = await sql`
      UPDATE links
      SET
        attribution = ${attribution},
        is_hidden_on_about_page = ${isHiddenOnAboutPage},
        publish_date = ${publishDate},
        quotation = ${quotation},
        title = ${title},
        type = ${type},
        updated_at = current_timestamp,
        url = ${url}
      WHERE id = ${id}
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to update link.')
    return formatDbResponseForClient(row, linkSchema)
  } catch (cause) {
    throw new Error('Failed to update link.', { cause })
  }
}

/** Press-only fields don't apply to other link types. */
function toDbRow(link: CreateLink, existing?: Link) {
  const linkToSave = {
    ...existing,
    ...link
  }
  const isPress = linkToSave.type === LinkTypes.press

  return {
    attribution: isPress ? (linkToSave.attribution ?? null) : null,
    isHiddenOnAboutPage: isPress
      ? (linkToSave.isHiddenOnAboutPage ?? null)
      : null,
    publishDate: isPress ? (linkToSave.publishDate ?? null) : null,
    quotation: isPress ? (linkToSave.quotation ?? null) : null,
    title: linkToSave.title ?? null,
    type: linkToSave.type ?? null,
    url: linkToSave.url
  }
}
