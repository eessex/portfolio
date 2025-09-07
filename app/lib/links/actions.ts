'use server'

import { validatedItemArray } from '@/lib/actions'
import type { FormResponse } from '@/lib/definitions'
import { linkSchema } from '@/lib/links/schemas'
import type { Link } from '@/lib/links/types'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createLink (link: Link) {
  try {
    const maybeId = await sql`SELECT id from links WHERE url = ${link.url}`
    if (maybeId.length > 0) {
      console.debug('Link already exists:', maybeId[0].id)
      return { ...link, id: maybeId[0].id }
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
    } else {
      console.debug('Form data entry:', n, v)
      data[n] = v
    }
  })
  const validatedFields = linkSchema.safeParse(Object.fromEntries(formData))
  if (!validatedFields.success) {
    console.error('Failed to validate link.', validatedFields.error.flatten().fieldErrors)
    throw new Error('Failed to validate link.')
    // return {
    //   errors: validatedFields.error.flatten().fieldErrors,
    //   message: 'Failed to validate link.',
    // }
  } else {
    try {
      const updatedLinks = await updateLink(validatedFields.data)
      if (updatedLinks) {
        console.debug('Link saved successfully:', updatedLinks)
        revalidatePath('/dashboard/links')
        return { ok: true, res: updatedLinks[0] }
      }
    } catch (err) {
      console.error('Failed to save Link:', err)
      throw new Error('Failed to save Link.')
    }
  }
}

async function updateLink (link: Link) {
  let savedLink: Link | null = null
  try {
    await sql.begin(async (tx) => {
      const {
        attribution,
        id,
        isHiddenOnAboutPage,
        type,
        publishDate,
        quotation,
        title,
        url
      } = link
      if (!id) {
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
            WHERE id = ${id}
          `.then(() => {
              savedLink = link
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

async function updateLinks (links: Array<Link>) {
  const savedLinks: Array<Link | null> = new Array(links.length).fill(null)
  try {
    await sql.begin(async (tx) => {
      for (const [i, link] of links.entries()) {
        const { id, url, title } = link
        if (!id) {
          try {
            const res = await createLink(link)
            if (res?.id) {
              savedLinks[i] = res
            }
          } catch (err) {
            console.error('Error creating link:', err)
            throw new Error(err instanceof Error ? err.message : 'Failed to create link.')
          }
        } else {
          try {
            await tx`
              UPDATE links
              SET (url, title) = (${url}, ${title || null})
              WHERE id = ${id}
            `.then(() => {
                savedLinks.push(link)
              })
          } catch (err) {
            console.error('Error updating link:', err)
            throw new Error('Failed to update link.')
          }
        }
      }
    })
  } catch (err) {
    console.error('Error saving links:', err)
  }
  return savedLinks
}

export async function editLinks (formData: FormData) {
  try {
    const links = await validatedItemArray(formData, 'link') as Array<Link>
    const updatedLinks = await updateLinks(links)

    if (updatedLinks) {
      return updatedLinks[0]
    }
  } catch (err) {
    console.error('Failed to save Links:', err)
    throw new Error('Failed to save Links.')
  }
}
