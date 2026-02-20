'use server'

import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

import {
  createLinkSchema,
  editLinkSchema,
  linkSchema
} from '@/lib/links/schemas'
import type {
  CreateLink,
  Link
} from '@/lib/links/types'
import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function editLink (formData: FormData): Promise<FormResponse<Link>> {
  const data: Record<FormData['entries']['name'], unknown> = Object.fromEntries(formData)
  Object.entries(data).forEach(([n, v]) => {
    if (n.includes('Date')) {
      data[n] = v || undefined
    }
  })

  const validatedLink = formData.get('id')
    ? editLinkSchema.safeParse(data)
    : createLinkSchema.safeParse(data)

  if (!validatedLink.success) {
    return {
      ok: false,
      errors: validatedLink.error.flatten().fieldErrors,
      message: 'Failed to validate link.'
    }
  }

  try {
    const updatedLink = await updateLink(validatedLink.data)
    revalidatePath('/dashboard/links')
    return {
      ok: true,
      res: updatedLink
    }
  } catch (err) {
    const errMsg = 'Failed to edit link'
    const message = err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
    return {
      ok: false,
      message
    }
  }
}

export async function deleteLink (link: Link): Promise<FormResponse<Link>> {
  try {
    await sql`
      DELETE FROM links
      WHERE id = ${link.id}
        OR url = ${link.url}
    `
    revalidatePath('/dashboard/links')
    return { ok: true }
  } catch (err) {
    const errMsg = 'Failed to delete link'
    const message = err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
    return {
      ok: false,
      message
    }
  }
}

async function createLink (link: CreateLink) {
  try {
    const {
      attribution,
      isHiddenOnAboutPage,
      type,
      publishDate,
      quotation,
      title,
      url
    } = link
    return await sql<Link[]>`
        INSERT INTO links (
          attribution,
          created_at,
          is_hidden_on_about_page,
          type,
          publish_date,
          quotation,
          title,
          url
        ) VALUES (
          ${attribution || null},
          current_timestamp,
          ${isHiddenOnAboutPage || null},
          ${type || null},
          ${publishDate || null},
          ${quotation || null},
          ${title || null},
          ${url}
        )
        RETURNING *
      `.then(rows => formatDbResponseForClient(rows[0], linkSchema))
  } catch (err) {
    console.error('Error creating link:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to create link.')
  }
}

async function updateLink (link: CreateLink | Link) {
  try {
    if (!(link as Link).id) {
      return await createLink(link)
    } else {
      const {
        attribution,
        isHiddenOnAboutPage,
        type,
        publishDate,
        quotation,
        title,
        url
      } = link
      return await sql<Link[]>`
        UPDATE links
        SET (
          attribution,
          is_hidden_on_about_page,
          type,
          publish_date,
          quotation,
          title, 
          updated_at,
          url
        ) = (
          ${attribution || null},
          ${isHiddenOnAboutPage || null},
          ${type || null},
          ${publishDate || null},
          ${quotation || null},
          ${title || null},
          current_timestamp,
          ${url}
        )
        WHERE id = ${(link as Link).id}
        RETURNING *
      `.then(rows => formatDbResponseForClient(rows[0], linkSchema))
    }
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Failed to update link.')
  }
}
