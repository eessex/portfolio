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
import {
  aspectSchema,
  type CreateImage,
  createImageSchema,
  type Image,
  imageSchema,
  storedFileFieldNames
} from '@/lib/images/schemas/db'
import {
  deleteImageFile,
  uploadFile,
  type UploadOptions
} from '@/lib/images/upload'
import { imageAspect } from '@/lib/images/util'
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
}

export async function editImage(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createImageSchema,
    itemType: 'images',
    prepare: (data) => uploadNewFile(data, id),
    invalidate: invalidateImageTags,
    save: (image) =>
      id ? updateImage(image, id) : createImage(image)
  })
}

const REPLACE_FILE_MESSAGE =
  'To change the picture, remove this image and add a new one.'

/**
 * Uploads a newly selected file before validation, replacing the
 * form's `file` entry with the stored file's id, url, format and size.
 * Those fields only ever come from an upload, never from the form. An
 * existing image's file never changes, so a file submitted with an
 * `id` is refused.
 */
async function uploadNewFile(
  data: Record<string, unknown>,
  id?: string,
  options?: UploadOptions
) {
  delete data.id
  for (const field of storedFileFieldNames) delete data[field]

  const clientFile = data.file as File | undefined
  delete data.file
  if (!clientFile?.name || clientFile.size === 0) return data

  if (id) throw new Error(REPLACE_FILE_MESSAGE)

  let uploaded: Awaited<ReturnType<typeof uploadFile>>
  try {
    uploaded = await uploadFile(clientFile, options)
  } catch (cause) {
    throw new Error('Failed to upload file.', { cause })
  }
  return { ...data, ...uploaded }
}

/**
 * Creates or updates from raw (unnormalized) field data, ie an
 * indexed group pulled out of another domain's form submission. A
 * new image's file is uploaded by `uploadNewFile`; an existing image
 * only changes its details.
 */
export async function saveImageFromFields(
  fields: Record<string, unknown>,
  id?: string,
  options?: UploadOptions
): Promise<Image> {
  return saveItemFromFields({
    id,
    fields,
    schema: createImageSchema,
    itemType: 'images',
    prepare: (data) => uploadNewFile(data, id, options),
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
  idField = 'coverImageId',
  options?: UploadOptions
): Promise<string | undefined> {
  return resolveItemId(data, idField, (fields, id) =>
    saveImageFromFields(fields, id, options)
  )
}

export async function deleteImage(image: Image) {
  return runDeleteAction<Image>({
    itemType: 'images',
    invalidate: invalidateImageTags,
    del: async () => {
      const [res] = await sql`
        DELETE FROM images as i
        WHERE id = ${image.id}
        RETURNING i.id, i.url, i.format, i.variant_version
      `
      if (!res?.url) {
        return {
          ok: false,
          message: 'Failed to delete image: Image not found.'
        }
      }
      await deleteImageFile({
        id: res.id,
        url: res.url,
        format: res.format,
        variantVersion: res.variant_version
      })
    }
  })
}

async function createImage(image: CreateImage) {
  try {
    const { alt, caption, type, title } = toDbRow(image)
    // kept in step with width/height until the column is dropped;
    // parsed so the row reads back through imageSchema
    const aspect = aspectSchema.parse(
      imageAspect({ width: image.width, height: image.height })
    )
    const rows = await sql`
      INSERT INTO images (
        id,
        alt,
        aspect,
        caption,
        type,
        title,
        url,
        format,
        width,
        height,
        original_filename,
        content_hash,
        blur_data_url,
        variant_version,
        created_at
      ) VALUES (
        COALESCE(${image.id ?? null}::uuid, uuid_generate_v4()),
        ${alt},
        ${aspect},
        ${caption},
        ${type},
        ${title},
        ${image.url},
        ${image.format ?? null},
        ${image.width ?? null},
        ${image.height ?? null},
        ${image.originalFilename ?? null},
        ${image.contentHash ?? null},
        ${image.blurDataUrl ?? null},
        ${image.variantVersion ?? null},
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
    // the file, and so url, format and size, never change after upload
    const { alt, caption, type, title } = toDbRow(
      image,
      existingImage
    )
    const rows = await sql`
      UPDATE images
      SET
        alt = ${alt},
        caption = ${caption},
        type = ${type},
        title = ${title},
        updated_at = current_timestamp
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
    caption: imageToSave.caption ?? null,
    type: imageToSave.type ?? null,
    title: imageToSave.title ?? null
  }
}
