'use server'

import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

import {
  createLinkSchema,
  linkSchema
} from '@/lib/links/schemas'
import type {
  CreateLink,
  Link
} from '@/lib/links/types'
import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createLink (link: CreateLink) {
  try {
    const maybeLink = await sql<Link[]>`
      SELECT * from links
      WHERE url = ${link.url}
    `.then(rows => {
        if (rows.length) {
          return formatDbResponseForClient(rows[0], linkSchema)
        }
      })
    if (maybeLink) {
      console.debug('Link already exists:', maybeLink.id)
      return maybeLink
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
      console.debug('Creating new link:', link)
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
        )
        VALUES (
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
    }
  } catch (err) {
    console.error('Error creating link:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to create link.')
  }
}

export async function editLink (formData: FormData): Promise<FormResponse<Link>> {
  let validatedLink
  const data: Record<FormData['entries']['name'], unknown> = Object.fromEntries(formData)
  Object.entries(data).forEach(([n, v]) => {
    if (n.includes('Date')) {
      console.info('Parsing date for:', n, v)
      data[n] = v || undefined
    }
  })

  if (formData.get('id')) {
    validatedLink = linkSchema.safeParse(data)
  } else {
    validatedLink = createLinkSchema.safeParse(data)
  }
  if (!validatedLink.success) {
    console.error('Failed to validate link.', validatedLink.error.flatten().fieldErrors)
    throw new Error('Failed to validate link.')
    // return {
    //   errors: validatedFields.error.flatten().fieldErrors,
    //   message: 'Failed to validate link.',
    // }
  } else {
    try {
      const updatedLink = await updateLink(validatedLink.data)
      if (updatedLink) {
        console.debug('Link saved successfully:', updatedLink)
        revalidatePath('/dashboard/links')
        return {
          ok: true,
          res: updatedLink
        }
      }
    } catch (err) {
      console.error('Failed to save Link:', err)
      throw new Error('Failed to save Link.')
    }
  }
}

async function updateLink (link: CreateLink | Link) {
  try {
    return await sql.begin(async (tx) => {
      if (!(link as Link).id) {
        try {
          return await createLink(link)
        } catch (err) {
          console.error('Error creating link:', err)
          throw new Error(err instanceof Error ? err.message : 'Failed to create link.')
        }
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
        try {
          return await tx<Link[]>`
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
            )
            = (
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
        } catch (err) {
          console.error('Error updating link:', err)
          throw new Error('Failed to update link.')
        }
      }
    })
  } catch (err) {
    console.error('Error saving links:', err)
  }
}

export async function deleteLink (id: string): Promise<FormResponse<Link>> {
  try {
    await sql`
      DELETE FROM links
      WHERE id = ${id}
    `
    revalidatePath('/dashboard/links')
    return { ok: true }
  } catch (err) {
    console.error('Error deleting link:', err)
    throw new Error('Failed to delete link.')
  }
}
