'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { fetchImagesByIds } from '@/lib/images/data'
import { deleteFromS3, uploadFile } from '@/lib/images/s3'
import {
  type CreateImage,
  createImageSchema,
  type Image,
  imageSchema
} from '@/lib/images/schemas/db'
import {
  extractIndexedGroups,
  formatDbResponseForClient,
  normalizeFormData
} from '@/lib/util'

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
  updateTag('about')
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
 * Creates a new image from raw (unnormalized) field data, e.g. an
 * indexed group pulled out of another domain's form submission by a
 * multi-item picker. Mirrors `editImage`'s own
 * `prepare` -> `normalizeFormData` -> validate -> save pipeline, since
 * it runs outside `runFormAction`.
 */
export async function createImageFromFields(
  fields: Record<string, unknown>
): Promise<Image> {
  const uploaded = await uploadNewFile(fields)
  const parsed = createImageSchema.safeParse(
    normalizeFormData(uploaded)
  )
  if (!parsed.success) {
    throw new Error(
      `Invalid image data: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(', ')}`
    )
  }
  return createImage(parsed.data)
}

/**
 * Resolves a reorderable multi-image picker's submitted entries (mix of
 * existing selections and pending inline creations, in the user's chosen
 * order — see `extractIndexedGroups`) into a cover id + the rest, for
 * domains that treat the first image in the list as the cover. Position,
 * not kind, determines the cover: a newly-created image placed first
 * becomes the cover just as an existing selection would.
 */
export async function resolveOrderedImageIds(
  data: Record<string, unknown>,
  prefix = 'images'
): Promise<{ coverImageId: string | undefined; imageIds: string[] }> {
  const entries = extractIndexedGroups(data, prefix)
  const resolvedIds = await Promise.all(
    entries.map((entry) =>
      entry.kind === 'existing'
        ? entry.id
        : createImageFromFields(entry.fields).then(
            (image) => image.id
          )
    )
  )
  const [coverImageId, ...imageIds] = resolvedIds
  return { coverImageId, imageIds }
}

export async function resolveCoverImageId(
  data: Record<string, unknown>,
  prefix = 'coverImage'
): Promise<string | undefined> {
  if (typeof data.coverImageId === 'string' && data.coverImageId) {
    return data.coverImageId
  }

  const fieldNames = ['file', ...Object.keys(createImageSchema.shape)]
  const fields: Record<string, unknown> = {}
  fieldNames.forEach((field) => {
    fields[field] = data[`${prefix}.${field}`]
    delete data[`${prefix}.${field}`]
  })

  const file = fields.file
  if (!(file instanceof File) || file.size === 0) {
    return undefined
  }

  const image = await createImageFromFields(fields)
  return image.id
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
