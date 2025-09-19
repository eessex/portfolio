'use server'

import type { FormResponse } from '@/lib/types'
import { imageSchema } from '@/lib/images/schemas'
import type { Image } from '@/lib/images/types'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function editImage (formData: FormData): Promise<FormResponse<Image>> {
  const data: Record<FormData['entries']['name'], unknown> = Object.fromEntries(formData)
  Object.entries(data).forEach(([n, v]) => {
    // checkboxes are always 'on' when checked, so we convert them to true
    if (v === 'on') {
      data[n] = true
    } else if (n.includes('Date')) {
      console.info('Parsing date for:', n, v)
      data[n] = v || undefined
    } else if (n === 'aspect') {
      console.debug('Converting aspect ratio to float:', n, v)
      data[n] = parseFloat(v as string)
    } else {
      console.debug('Form data entry:', n, v)
      data[n] = v
    }
  })
  const validatedFields = imageSchema.safeParse(data)
  if (!validatedFields.success) {
    console.error('Failed to validate image.', validatedFields.error.flatten().fieldErrors)
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate image.',
    }
  } else {
    try {
      const image = validatedFields.data
      const updatedImage = await updateImage(image)
      if (updatedImage) {
        console.debug('Image saved successfully:', updatedImage)
        revalidatePath('/dashboard/images')
        return { ok: true, res: updatedImage }
      }
    } catch (err) {
      console.error('Failed to save Image:', err)
      throw new Error('Failed to save Image.')
    }
  }
}

async function createImage (image: Image): Promise<Image | null> {
  try {
    const maybeId = await sql`SELECT id from images WHERE url = ${image.url}`
    if (maybeId.length > 0) {
      console.debug('Image already exists:', maybeId[0].id)
      return { ...image, id: maybeId[0].id }
    } else {
      const { aspect, caption, isHiddenOnAboutPage, isPress, title, url } = image
      const result = await sql<Image[]>`
      INSERT INTO images (
        aspect,
        created_at,
        caption,
        is_hidden_on_about_page,
        is_press,
        title,
        url
      )
      VALUES (
        ${aspect},
        ${caption || null},
        ${isHiddenOnAboutPage || null},
        ${isPress || null},
        ${title || null},
        ${url},
        current_timestamp
      )
      RETURNING *
    `
      if (result.length > 0) {
        console.debug('Image created successfully:', result[0])
        return result[0]
      }
    }
  } catch (err) {
    console.error('Error creating image:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to create image.')
  }
  return null
}

async function updateImage (image: Image) {
  let savedImage: Image | null = null
  try {
    await sql.begin(async (tx) => {
      const {
        aspect,
        caption,
        id,
        isHiddenOnAboutPage,
        isPress,
        title,
        url
      } = image
      if (!id) {
        try {
          const res = await createImage(image)
          if (res?.id) {
            savedImage = res
          }
        } catch (err) {
          console.error('Error creating image:', err)
          throw new Error(err instanceof Error ? err.message : 'Failed to create image.')
        }
      } else {
        try {
          await tx`
            UPDATE images
            SET (
              aspect,
              caption,
              is_hidden_on_about_page,
              is_press,
              title, 
              updated_at,
              url
            )
            = (
              ${aspect || null},
              ${caption || null},
              ${isHiddenOnAboutPage || null},
              ${isPress || null},
              ${title || null},
              current_timestamp,
              ${url}
            )
            WHERE id = ${id}
          `.then(() => {
              savedImage = image
            })
        } catch (err) {
          console.error('Error updating image:', err)
          throw new Error('Failed to update image.')
        }
      }
    })
    return savedImage
  } catch (err) {
    console.error('Error saving images:', err)
  }
}

export async function deleteImage (id: string): Promise<FormResponse<Image>> {
  try {
    await sql`
      DELETE FROM images
      WHERE id = ${id}
    `
    revalidatePath('/dashboard/images')
    return { ok: true }
  } catch (err) {
    console.error('Error deleting image:', err)
    throw new Error('Failed to delete image.')
  }
}
