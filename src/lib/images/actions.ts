'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { fetchImagesByIds } from '@/lib/images/data'
import { deleteFromS3, uploadFile } from '@/lib/images/s3'
import {
  type CreateImage,
  createImageSchema,
  type Image,
  imageSchema
} from '@/lib/images/schemas/db'
import type { FormResponse } from '@/lib/types'
import {
  formatDbResponseForClient,
  formatErrorResponse,
  formatValidationResponse,
  normalizeFormData
} from '@/lib/util'

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
  } catch (cause) {
    throw new Error('Failed to check if image exists.', { cause })
  }
}

export async function editImage(
  formData: FormData,
  id?: string
): Promise<FormResponse<Image>> {
  const data: Record<string, unknown> = Object.fromEntries(formData)
  const clientFile = data.file as File | undefined

  if (clientFile?.name && clientFile.size > 0) {
    try {
      const uploadedUrl = await uploadFile(clientFile)
      if (((data.url as string) || '').length > 0) {
        await deleteFromS3(data.url as string)
      }
      data.url = uploadedUrl
      delete data.file
    } catch (cause) {
      throw new Error('Failed to upload file.', { cause })
    }
  }

  const validatedImage = createImageSchema.safeParse(
    normalizeFormData(data)
  )

  if (!validatedImage.success) {
    return formatValidationResponse(
      validatedImage.error,
      'Failed to validate image.'
    )
  }

  try {
    let savedImage: Image | undefined
    if (id) {
      savedImage = await updateImage(validatedImage.data, id)
    } else {
      savedImage = await createImage(validatedImage.data)
    }
    if (savedImage) {
      updateTag('images')
      return {
        ok: true,
        res: savedImage
      }
    }
  } catch (err) {
    return formatErrorResponse('Failed to edit image', err)
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
    updateTag('images')
    return { ok: true }
  } catch (err) {
    return formatErrorResponse(errMsg, err)
  }
}

async function createImage(image: CreateImage) {
  try {
    const {
      alt,
      aspect,
      caption,
      isHiddenOnAboutPage,
      isPress,
      title,
      url
    } = toDbRow(image)
    const rows = await sql`
      INSERT INTO images
        alt = ${alt},
        aspect = ${aspect},
        caption = ${caption},
        is_hidden_on_about_page = ${isHiddenOnAboutPage},
        is_press = ${isPress},
        title = ${title},
        url = ${url},
        created_at = current_timestamp
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to create image.')
    return formatDbResponseForClient(row, imageSchema)
  } catch (cause) {
    throw new Error('Failed to create image.', { cause })
  }
}

async function updateImage(image: CreateImage, id: string) {
  const [existingImage] = await fetchImagesByIds([id])
  try {
    const {
      alt,
      aspect,
      caption,
      isHiddenOnAboutPage,
      isPress,
      title,
      url
    } = toDbRow(image, existingImage)
    const rows = await sql`
      UPDATE images
      SET
        alt = ${alt},
        aspect = ${aspect},
        caption = ${caption},
        is_hidden_on_about_page = ${isHiddenOnAboutPage},
        is_press = ${isPress},
        title = ${title},
        updated_at = current_timestamp,
        url = ${url}
      WHERE id = ${id}
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to update image.')
    return formatDbResponseForClient(row, imageSchema)
  } catch (cause) {
    throw new Error('Failed to update image.', { cause })
  }
}

function toDbRow(image: CreateImage, existing?: Image) {
  const imageToSave = {
    ...existing,
    ...image
  }

  return {
    alt: imageToSave.alt ?? null,
    aspect: imageToSave.aspect,
    caption: imageToSave.caption ?? null,
    isHiddenOnAboutPage: imageToSave.isHiddenOnAboutPage ?? null,
    isPress: imageToSave.isPress ?? null,
    title: imageToSave.title ?? null,
    url: imageToSave.url
  }
}
