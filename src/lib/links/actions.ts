'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  resolveOrderedIds,
  runDeleteAction,
  runFormAction,
  saveItemFromFields
} from '@/lib/form-action'
import { emptyListFieldName } from '@/lib/item-fields'
import { fetchLinksByIds } from '@/lib/links/data'
import {
  type CreateLink,
  createLinkSchema,
  createPressLinkSchema,
  createSocialLinkSchema,
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
  // the footer social links are read through site settings
  updateTag('settings')
}

export async function deleteLink(link: Link) {
  return runDeleteAction<Link>({
    itemType: 'links',
    invalidate: invalidateLinkTags,
    del: async () => {
      await sql`
        DELETE FROM links
        WHERE id = ${link.id}
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
 * `saveLinkFromFields` for a Press picker entry: saved as press, with
 * the press citation fields required.
 */
export async function savePressLinkFromFields(
  fields: Record<string, unknown>,
  id?: string
): Promise<Link> {
  return saveItemFromFields({
    id,
    fields: { ...fields, type: LinkTypes.press },
    schema: createPressLinkSchema,
    itemType: 'links',
    create: createLink,
    update: updateLink
  })
}

/**
 * Resolves the Press and Links pickers' submitted entries (each a mix
 * of existing selections, inline edits of attached links, and pending
 * inline creations, in the user's chosen order — see
 * `extractIndexedGroups`) into one ordered list of link ids: press
 * links first, as they render. Press entries submit no `type`, so
 * every one saved from that picker is saved as press (see
 * `savePressLinkFromFields`).
 */
export async function resolveOrderedLinkIds(
  data: Record<string, unknown>,
  name = 'links',
  pressName = 'pressLinks'
): Promise<{ linkIds: string[] }> {
  const [pressLinkIds, otherLinkIds] = await Promise.all([
    resolveOrderedIds(data, pressName, savePressLinkFromFields),
    resolveOrderedIds(data, name, saveLinkFromFields)
  ])
  // the same link picked in both keeps its first position
  const linkIds = [...new Set([...pressLinkIds, ...otherLinkIds])]
  return { linkIds }
}

/**
 * `saveLinkFromFields` for a Social links picker entry:
 * saved as social, with a name required.
 */
export async function saveSocialLinkFromFields(
  fields: Record<string, unknown>,
  id?: string
): Promise<Link> {
  return saveItemFromFields({
    id,
    fields: { ...fields, type: LinkTypes.social },
    schema: createSocialLinkSchema,
    itemType: 'links',
    create: createLink,
    update: updateLink
  })
}

/**
 * Resolves the site settings' Social links picker into ordered,
 * deduped link ids; new and edited ones are saved as social. `undefined`
 * when the picker wasn't submitted, so the stored list is left alone.
 */
export async function resolveSocialLinkIds(
  data: Record<string, unknown>,
  name = 'socialLinks'
): Promise<string[] | undefined> {
  if (!(emptyListFieldName(name) in data)) return undefined

  return [
    ...new Set(
      await resolveOrderedIds(data, name, saveSocialLinkFromFields)
    )
  ]
}

async function createLink(link: CreateLink) {
  try {
    const { attribution, publishDate, quotation, title, type, url } =
      toDbRow(link)
    const rows = await sql`
      INSERT INTO links (
        attribution,
        publish_date,
        quotation,
        title,
        type,
        url,
        created_at
      ) VALUES (
        ${attribution},
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
    const { attribution, publishDate, quotation, title, type, url } =
      toDbRow(link, existingLink)
    const rows = await sql`
      UPDATE links
      SET
        attribution = ${attribution},
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
    publishDate: isPress ? (linkToSave.publishDate ?? null) : null,
    quotation: isPress ? (linkToSave.quotation ?? null) : null,
    title: linkToSave.title ?? null,
    type: linkToSave.type ?? null,
    url: linkToSave.url
  }
}
