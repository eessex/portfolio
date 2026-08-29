'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { fetchEmbedCodeMetadata } from '@/lib/embed-codes/cover-image'
import { withCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import { fetchEmbedCodesByIds } from '@/lib/embed-codes/data'
import { resolveOEmbed } from '@/lib/embed-codes/oembed'
import {
  type CreateEmbedCode,
  createEmbedCodeSchema,
  type EmbedCode,
  type EmbedCodeHost,
  embedCodeSchema
} from '@/lib/embed-codes/schemas/db'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { EmbeddedItemTypes } from '@/lib/schemas'
import {
  extractIndexedGroups,
  formatDbResponseForClient,
  isBlankEntry,
  normalizeFormData
} from '@/lib/util'

export async function editEmbedCode(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createEmbedCodeSchema,
    itemType: EmbeddedItemTypes.embedCodes,
    prepare: (data) => attachEmbedCodeMetadata(data, id),
    invalidate: invalidateEmbedCodeTags,
    save: (embedCode) =>
      id ? updateEmbedCode(embedCode, id) : createEmbedCode(embedCode)
  })
}

/**
 * Title is always system-derived, never user-editable, so this always
 * (re)fetches it from the current `host`/`src` — on create AND edit — so
 * it can't go stale if `src` changes later. The cover image is different:
 * it's only fetched (and uploaded to S3) on create, since re-uploading a
 * new one on every edit would be wasteful. On edit, a failed title
 * resolution leaves `data.title` untouched rather than clearing it —
 * `toDbRow`'s merge with the existing row then keeps the prior title.
 */
async function attachEmbedCodeMetadata(
  data: Record<string, unknown>,
  id?: string
) {
  const host = data.host as EmbedCodeHost | undefined
  const src = data.src as string | undefined
  if (!host || !src) return data

  if (id) {
    try {
      const resolved = await resolveOEmbed(host, src)
      if (resolved?.title) data.title = resolved.title
    } catch (cause) {
      console.error('Failed to refresh embed code title:', cause)
    }
    return data
  }

  const { coverImageId, title } = await fetchEmbedCodeMetadata(
    host,
    src
  )
  if (coverImageId) data.coverImageId = coverImageId
  if (title) data.title = title

  return data
}

/**
 * Creates a new embed code from raw (unnormalized) field data, e.g. an
 * indexed group pulled out of another domain's form submission by a
 * multi-item picker. Mirrors `editEmbedCode`'s own
 * `attachEmbedCodeMetadata` -> normalize -> validate -> save pipeline,
 * since it runs outside `runFormAction`.
 */
export async function createEmbedCodeFromFields(
  fields: Record<string, unknown>
): Promise<EmbedCode> {
  const withMetadata = await attachEmbedCodeMetadata(fields)
  const parsed = createEmbedCodeSchema.safeParse(
    normalizeFormData(withMetadata)
  )
  if (!parsed.success) {
    throw new Error(
      `Invalid embed code data: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(', ')}`
    )
  }
  return createEmbedCode(parsed.data)
}

/**
 * Resolves a reorderable multi-embed-code picker's submitted entries
 * (mix of existing selections and pending inline creations, in the
 * user's chosen order — see `extractIndexedGroups`) into an ordered
 * list of embed code ids, plus a featured id split off the front.
 *
 * Unlike a cover image, a featured embed code is never inferred from
 * position alone: the picker only submits a `${prefix}Featured` flag
 * while a slot is explicitly pinned as featured, so a project with no
 * featured embed code chosen gets `featuredEmbedCodeId: undefined`
 * even though it has embed codes.
 */
export async function resolveOrderedEmbedCodeIds(
  data: Record<string, unknown>,
  prefix = 'embedCodes'
): Promise<{
  embedCodeIds: string[]
  featuredEmbedCodeId: string | undefined
}> {
  const isFeatured = Boolean(data[`${prefix}Featured`])
  delete data[`${prefix}Featured`]

  const entries = extractIndexedGroups(data, prefix).filter(
    (entry) =>
      entry.kind === 'existing' || !isBlankEntry(entry.fields)
  )
  const resolvedIds = await Promise.all(
    entries.map((entry) =>
      entry.kind === 'existing'
        ? entry.id
        : createEmbedCodeFromFields(entry.fields).then(
            (embedCode) => embedCode.id
          )
    )
  )

  if (!isFeatured) {
    return {
      embedCodeIds: resolvedIds,
      featuredEmbedCodeId: undefined
    }
  }

  const [featuredEmbedCodeId, ...embedCodeIds] = resolvedIds
  return { embedCodeIds, featuredEmbedCodeId }
}

/**
 * Embed codes are embedded directly into these parents' cached fetches via
 * build_embed_code_json, so saving/deleting one must invalidate those caches
 * too, not just the embed-codes list.
 */
function invalidateEmbedCodeTags() {
  updateTag('embed-codes')
  updateTag('releases')
  updateTag('events')
  updateTag('projects')
}

export async function deleteEmbedCode(embedCode: EmbedCode) {
  return runDeleteAction<EmbedCode>({
    itemType: EmbeddedItemTypes.embedCodes,
    invalidate: invalidateEmbedCodeTags,
    del: async () => {
      await sql`
        DELETE FROM embed_codes
        WHERE
          id = ${embedCode.id}
          OR src = ${embedCode.src}
      `
    }
  })
}

async function createEmbedCode(embedCode: CreateEmbedCode) {
  try {
    const {
      caption,
      contentType,
      coverImageId,
      host,
      src,
      title,
      type
    } = toDbRow(embedCode)
    return await sql`
      INSERT INTO embed_codes (
        caption,
        content_type,
        cover_image_id,
        host,
        src,
        title,
        type,
        created_at
      ) VALUES (
        ${caption},
        ${contentType},
        ${coverImageId},
        ${host},
        ${src},
        ${title},
        ${type},
        current_timestamp
      )
      RETURNING *
    `.then((rows) =>
      withCoverImageUrls(
        formatDbResponseForClient(rows[0], embedCodeSchema)
      )
    )
  } catch (cause) {
    throw new Error('Failed to create embed code.', { cause })
  }
}

async function updateEmbedCode(
  embedCode: CreateEmbedCode,
  id: string
) {
  const [existingEmbedCode] = await fetchEmbedCodesByIds([id])
  try {
    const {
      caption,
      contentType,
      coverImageId,
      host,
      src,
      title,
      type
    } = toDbRow(embedCode, existingEmbedCode)
    return await sql`
      UPDATE embed_codes
      SET
        caption = ${caption},
        content_type = ${contentType},
        cover_image_id = ${coverImageId},
        host = ${host},
        src = ${src},
        title = ${title},
        type = ${type},
        updated_at = current_timestamp
      WHERE id = ${id}
      RETURNING *
    `.then((rows) =>
      withCoverImageUrls(
        formatDbResponseForClient(rows[0], embedCodeSchema)
      )
    )
  } catch (cause) {
    throw new Error('Failed to update embed code.', { cause })
  }
}

function toDbRow(embedCode: CreateEmbedCode, existing?: EmbedCode) {
  const embedCodeToSave = {
    ...existing,
    ...embedCode
  }

  return {
    caption: embedCodeToSave.caption,
    contentType: embedCodeToSave.contentType,
    coverImageId: embedCodeToSave.coverImageId ?? null,
    host: embedCodeToSave.host,
    src: embedCodeToSave.src,
    title: embedCodeToSave.title,
    type: embedCodeToSave.type ?? null
  }
}
