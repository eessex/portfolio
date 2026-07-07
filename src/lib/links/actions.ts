'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { fetchLinksByIds } from '@/lib/links/data'
import {
  type CreateLink,
  createLinkSchema,
  type Link,
  linkSchema,
  LinkTypes
} from '@/lib/links/schemas/db'
import type { FormResponse } from '@/lib/types'
import {
  formatDbResponseForClient,
  formatErrorResponse,
  formatValidationResponse,
  normalizeFormData
} from '@/lib/util'

export async function editLink(
  formData: FormData,
  id?: string
): Promise<FormResponse<Link>> {
  const data = normalizeFormData(Object.fromEntries(formData))

  const validatedLink = createLinkSchema.safeParse(data)

  if (!validatedLink.success) {
    return formatValidationResponse(
      validatedLink.error,
      'Failed to validate link.'
    )
  }

  try {
    let savedLink: Link | undefined
    if (id) {
      savedLink = await updateLink(validatedLink.data, id)
    } else {
      savedLink = await createLink(validatedLink.data)
    }
    if (savedLink) {
      invalidateLinkTags()
      return {
        ok: true,
        res: savedLink
      }
    }
  } catch (err) {
    return formatErrorResponse('Failed to edit link', err)
  }
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
  updateTag('publishedEditions')
}

export async function deleteLink(
  link: Link
): Promise<FormResponse<Link>> {
  try {
    await sql`
      DELETE FROM links
      WHERE id = ${link.id}
        OR url = ${link.url}
    `
    invalidateLinkTags()
    return { ok: true }
  } catch (err) {
    return formatErrorResponse('Failed to delete link', err)
  }
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
