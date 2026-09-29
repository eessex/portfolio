'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  resolveOrderedIds,
  runDeleteAction,
  runFormAction,
  saveItemFromFields
} from '@/lib/form-action'
import { fetchLinksByIds } from '@/lib/links/data'
import {
  type CreateLink,
  createLinkSchema,
  type Link,
  linkSchema,
  LinkTypes
} from '@/lib/links/schemas/db'
import { formatDbResponseForClient } from '@/lib/util'

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
 * Creates or updates from raw (unnormalized) field data, ie an
 * indexed group pulled out of another domain's form submission.
 */
export async function saveLinkFromFields(
  fields: Record<string, unknown>,
  id?: string
): Promise<Link> {
  return saveItemFromFields({
    id,
    fields,
    schema: createLinkSchema,
    itemType: 'links',
    create: createLink,
    update: updateLink
  })
}

/**
 * Resolves a reorderable multi-link picker's submitted entries (mix of
 * existing selections, inline edits of attached links, and pending
 * inline creations, in the user's chosen order — see
 * `extractIndexedGroups`) into an ordered list of link ids.
 */
export async function resolveOrderedLinkIds(
  data: Record<string, unknown>,
  name = 'links'
): Promise<{ linkIds: string[] }> {
  const linkIds = await resolveOrderedIds(
    data,
    name,
    saveLinkFromFields
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
