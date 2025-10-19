'use server'

import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

import { createLinkSchema } from '@/lib/links/schemas'
import type {
  CreateLink,
  Link
} from '@/lib/links/types'
import type { FormResponse } from '@/lib/types'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createLink (link: CreateLink): Promise<Link | null> {
  try {
    const maybeId = await sql`SELECT id, created_at from links WHERE url = ${link.url}`
    if (maybeId.length > 0) {
      console.debug('Link already exists:', maybeId[0].id)
      return {
        ...link,
        id: maybeId[0].id,
        createdAt: maybeId[0].created_at
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
      console.debug('Creating new link:', link)
      const result = await sql<Link[]>`
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
    `
      if (result.length > 0) {
        console.debug('Link created successfully:', result[0])
        return result[0]
      }
    }
  } catch (err) {
    console.error('Error creating link:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to create link.')
  }
  return null
}

export async function editLink (formData: FormData): Promise<FormResponse<Link>> {
  const data: Record<FormData['entries']['name'], unknown> = Object.fromEntries(formData)
  Object.entries(data).forEach(([n, v]) => {
    // checkboxes are always 'on' when checked, so we convert them to true
    if (v === 'on') {
      data[n] = true
    } else if (n.includes('Date')) {
      console.info('Parsing date for:', n, v)
      data[n] = v || undefined
    } else if (n === 'type') {
      console.debug('Processing type field:', n, v)
      data[n] = v || undefined
    } else {
      console.debug('Form data entry:', n, v)
      data[n] = v
    }
  })
  const validatedCreateLink = createLinkSchema.safeParse(Object.fromEntries(formData))
  if (!validatedCreateLink.success) {
    console.error('Failed to validate link.', validatedCreateLink.error.flatten().fieldErrors)
    throw new Error('Failed to validate link.')
    // return {
    //   errors: validatedFields.error.flatten().fieldErrors,
    //   message: 'Failed to validate link.',
    // }
  } else {
    try {
      const updatedLinks = await updateLink(validatedCreateLink.data)
      if (updatedLinks) {
        console.debug('Link saved successfully:', updatedLinks)
        revalidatePath('/dashboard/links')
        return {
          ok: true, res: updatedLinks[0]
        }
      }
    } catch (err) {
      console.error('Failed to save Link:', err)
      throw new Error('Failed to save Link.')
    }
  }
}

async function updateLink (link: CreateLink | Link) {
  let savedLink: Link | null = null
  try {
    await sql.begin(async (tx) => {
      const {
        attribution,
        isHiddenOnAboutPage,
        type,
        publishDate,
        quotation,
        title,
        url
      } = link
      if (!(link as Link).id) {
        try {
          const res = await createLink(link)
          if (res?.id) {
            savedLink = res
          }
        } catch (err) {
          console.error('Error creating link:', err)
          throw new Error(err instanceof Error ? err.message : 'Failed to create link.')
        }
      } else {
        try {
          await tx`
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
          `.then(() => {
              savedLink = link as Link
            })
        } catch (err) {
          console.error('Error updating link:', err)
          throw new Error('Failed to update link.')
        }
      }
    })
    return savedLink
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
