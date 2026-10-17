'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  resolveItemId,
  resolveOrderedIds,
  runDeleteAction,
  runFormAction,
  saveItemFromFields
} from '@/lib/form-action'
import { fetchImagesByIds } from '@/lib/images/data'
import { deleteFromS3, uploadFile } from '@/lib/images/s3'
import {
  type CreateImage,
  createImageSchema,
  type Image,
  imageSchema
} from '@/lib/images/schemas/db'
import { formatDbResponseForClient } from '@/lib/util'

/**
 * Images are embedded directly into these parents' cached fetches via
 * build_image_json, so saving/deleting one must invalidate those caches too,
 * not just the images list.
 */
function invalidateImageTags() {
  updateTag('images')
  updateTag('releases')
  updateTag('events')
  updateTag('projects')
  updateTag('settings')
  updateTag('published-editions')
}

export async function editImage(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createImageSchema,
    itemType: 'images',
    prepare: uploadNewFile,
    invalidate: invalidateImageTags,
    save: (image) =>
      id ? updateImage(image, id) : createImage(image)
  })
}

/**
 * Uploads a newly selected file to S3 before validation, replacing
 * the form's `file` entry with the uploaded `url` (and removing the
 * previous S3 object when one is being replaced).
 */
async function uploadNewFile(data: Record<string, unknown>) {
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

  return data
}

/**
 * Creates or updates from raw (unnormalized) field data, ie an
 * indexed group pulled out of another domain's form submission. A
 * replaced file (if any) is uploaded by `uploadNewFile`, which also
 * removes the previous S3 object; a metadata-only edit keeps the
 * existing `url`.
 */
export async function saveImageFromFields(
  fields: Record<string, unknown>,
  id?: string
): Promise<Image> {
  return saveItemFromFields({
    id,
    fields,
    schema: createImageSchema,
    itemType: 'images',
    prepare: uploadNewFile,
    create: createImage,
    update: updateImage
  })
}

/**
 * Resolves a reorderable multi-image picker's submitted entries (mix of
 * existing selections, inline edits of attached images, and pending
 * inline creations, in the user's chosen order — see
 * `extractIndexedGroups`) into a cover id + the rest, for domains that
 * treat the first image in the list as the cover. Position, not kind,
 * determines the cover: a newly-created image placed first becomes the
 * cover just as an existing selection would.
 */
export async function resolveOrderedImageIds(
  data: Record<string, unknown>,
  name = 'images'
): Promise<{ coverImageId: string | undefined; imageIds: string[] }> {
  const resolvedIds = await resolveOrderedIds(
    data,
    name,
    saveImageFromFields
  )
  const [coverImageId, ...imageIds] = resolvedIds
  return { coverImageId, imageIds }
}

/**
 * Resolves a single-image picker's submission into an image id, see
 * `resolveItemId`. Defaults to `coverImageId`.
 */
export async function resolveCoverImageId(
  data: Record<string, unknown>,
  idField = 'coverImageId'
): Promise<string | undefined> {
  return resolveItemId(data, idField, saveImageFromFields)
}

export async function deleteImage(image: Image) {
  return runDeleteAction<Image>({
    itemType: 'images',
    invalidate: invalidateImageTags,
    del: async () => {
      const [res] = await sql`
        DELETE FROM images as i
        WHERE id = ${image.id}
          AND url = ${image.url}
        RETURNING i.url
      `
      if (!res?.url) {
        return {
          ok: false,
          message: 'Failed to delete image: Image not found.'
        }
      }
      await deleteFromS3(res.url)
    }
  })
}

async function createImage(image: CreateImage) {
  try {
    const {
      alt,
      aspect,
      caption,
      isHiddenOnAboutPage,
      type,
      title,
      url
    } = toDbRow(image)
    const rows = await sql`
      INSERT INTO images (
        alt,
        aspect,
        caption,
        is_hidden_on_about_page,
        type,
        title,
        url,
        created_at
      ) VALUES (
        ${alt},
        ${aspect},
        ${caption},
        ${isHiddenOnAboutPage},
        ${type},
        ${title},
        ${url},
        current_timestamp
      )
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
      type,
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
        type = ${type},
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
    type: imageToSave.type ?? null,
    title: imageToSave.title ?? null,
    url: imageToSave.url
  }
}
