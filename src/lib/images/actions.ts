'use server'

import { revalidatePath } from 'next/cache'

import { sql } from '@/lib/db'
import { deleteFromS3, uploadFile } from '@/lib/images/s3'
import {
  createImageSchema,
  editImageSchema,
  imageSchema
} from '@/lib/images/schemas'
import type { CreateImage, Image } from '@/lib/images/types'
import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'

const s3Prefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/images/`

function makeS3SafeKey(filename: string) {
  return (
    encodeURIComponent(filename)
      // S3 allows slashes for "folders", so restore them if needed
      .replace(/%2F/g, '/')
  )
}

export async function checkIfImageExists(
  filename: string,
  id?: string
): Promise<Image | false> {
  try {
    const formattedFilename = s3Prefix + makeS3SafeKey(filename)
    const rows = await sql`
      SELECT * FROM images WHERE url = ${formattedFilename}
    `
    const existingImage = rows[0]

    if (existingImage && (existingImage as Image).id !== id) {
      return existingImage as Image
    } else {
      return false
    }
  } catch (err) {
    throw new Error('Failed to check if image exists.', { cause: err })
  }
}

export async function editImage(
  formData: FormData
): Promise<FormResponse<Image>> {
  let validatedImage
  const clientFile = formData.get('file') as File | undefined
  const data: Record<FormData['entries']['name'], unknown> =
    Object.fromEntries(formData)

  if (clientFile?.name && clientFile.size > 0) {
    try {
      const uploadedUrl = await uploadFile(clientFile)
      if (((data.url as string) || '').length > 0) {
        await deleteFromS3(data.url as string)
      }
      data.url = uploadedUrl
      delete data.file
    } catch (err) {
      console.debug('Failed to upload file:', err)
      throw new Error('Failed to upload file.')
    }
  }

  Object.entries(data).forEach(([n, v]) => {
    if (v === 'on') {
      // checkboxes are always 'on' when checked, so we convert them to true
      data[n] = true
    } else if (n.includes('Date')) {
      data[n] = v || undefined
    } else if (n === 'aspect') {
      data[n] = parseFloat(v as string)
    }
  })
  if (formData.get('id')) {
    validatedImage = editImageSchema.safeParse(data)
  } else {
    validatedImage = createImageSchema.safeParse(data)
  }

  if (!validatedImage.success) {
    return {
      ok: false,
      errors: validatedImage.error.flatten().fieldErrors,
      message: 'Failed to validate image.'
    }
  } else {
    try {
      const updatedImage = await updateImage(validatedImage.data)
      if (updatedImage) {
        revalidatePath('/dashboard/images')
        return {
          ok: true,
          res: updatedImage
        }
      } else {
        return {
          ok: false,
          message: 'Failed to edit image.'
        }
      }
    } catch (err) {
      const errMsg = 'Failed to edit image'
      const message =
        err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
      return {
        ok: false,
        message
      }
    }
  }
}

export async function deleteImage(
  image: Image
): Promise<FormResponse<Image>> {
  const errMsg = 'Failed to delete image'

  try {
    const [res] = await sql`
      DELETE FROM images as i
      WHERE id = ${image.id}
        AND url = ${image.url}
      RETURNING i.url
    `
    if (!res?.url) {
      return {
        ok: false,
        message: `${errMsg}: Image not found.`
      }
    }
    await deleteFromS3(res.url)
    revalidatePath('/dashboard/images')
    return { ok: true }
  } catch (err) {
    const message =
      err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
    return {
      ok: false,
      message
    }
  }
}

async function createImage(image: CreateImage) {
  try {
    const { aspect, caption, isHiddenOnAboutPage, isPress, title, url } =
      image
    return await sql`
      INSERT INTO images (
        aspect,
        created_at,
        caption,
        is_hidden_on_about_page,
        is_press,
        title,
        url
      ) VALUES (
        ${aspect},
        current_timestamp,
        ${caption || null},
        ${isHiddenOnAboutPage ?? null},
        ${isPress ?? null},
        ${title || null},
        ${url}
      )
      RETURNING *
    `.then((rows) => formatDbResponseForClient(rows[0], imageSchema))
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Failed to create image.'
    )
  }
}

async function updateImage(image: CreateImage | Image) {
  try {
    if (!(image as Image).id) {
      return await createImage(image)
    } else {
      const { aspect, caption, isHiddenOnAboutPage, isPress, title, url } =
        image
      return await sql`
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
          ${isHiddenOnAboutPage ?? null},
          ${isPress ?? null},
          ${title || null},
          current_timestamp,
          ${url}
        )
        WHERE id = ${(image as Image).id}
        RETURNING *
      `.then((rows) => formatDbResponseForClient(rows[0], imageSchema))
    }
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Failed to update image.'
    )
  }
}
