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
  normalizeFormData
} from '@/lib/util'

export async function editLink(
  formData: FormData,
  id?: string
): Promise<FormResponse<Link>> {
  const data = normalizeFormData(Object.fromEntries(formData))

  const validatedLink = createLinkSchema.safeParse(data)

  if (!validatedLink.success) {
    return {
      ok: false,
      errors: validatedLink.error.flatten().fieldErrors,
      message: 'Failed to validate link.'
    }
  }

  try {
    let savedLink: Link | undefined
    if (id) {
      savedLink = await updateLink(validatedLink.data, id)
    } else {
      savedLink = await createLink(validatedLink.data)
    }
    if (savedLink) {
      updateTag('links')
      return {
        ok: true,
        res: savedLink
      }
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to edit link.'
    return {
      ok: false,
      message
    }
  }
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
    updateTag('links')
    return { ok: true }
  } catch (err) {
    const errMsg = 'Failed to delete link'
    const message =
      err instanceof Error
        ? `${errMsg}: ${err.message}.`
        : `${errMsg}.`
    return {
      ok: false,
      message
    }
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
        created_at,
        is_hidden_on_about_page,
        publish_date,
        quotation,
        title,
        type,
        url
      ) VALUES (
        ${attribution},
        current_timestamp,
        ${isHiddenOnAboutPage},
        ${publishDate},
        ${quotation},
        ${title},
        ${type},
        ${url}
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
