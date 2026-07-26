'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { fetchEmbedCodesByIds } from '@/lib/embed-codes/data'
import {
  type CreateEmbedCode,
  createEmbedCodeSchema,
  type EmbedCode,
  embedCodeSchema
} from '@/lib/embed-codes/schemas/db'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { formatDbResponseForClient } from '@/lib/util'

export async function editEmbedCode(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createEmbedCodeSchema,
    itemType: 'embedCodes',
    invalidate: invalidateEmbedCodeTags,
    save: (embedCode) =>
      id ? updateEmbedCode(embedCode, id) : createEmbedCode(embedCode)
  })
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
    itemType: 'embedCodes',
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
    const { caption, contentType, host, src, title, type } =
      toDbRow(embedCode)
    return await sql`
      INSERT INTO embed_codes (
        caption,
        content_type,
        host,
        src,
        title,
        type,
        created_at
      ) VALUES (
        ${caption},
        ${contentType},
        ${host},
        ${src},
        ${title},
        ${type},
        current_timestamp
      )
      RETURNING *
    `.then((rows) =>
      formatDbResponseForClient(rows[0], embedCodeSchema)
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
    const { caption, contentType, host, src, title, type } = toDbRow(
      embedCode,
      existingEmbedCode
    )
    return await sql`
      UPDATE embed_codes
      SET
        caption = ${caption},
        content_type = ${contentType},
        host = ${host},
        src = ${src},
        title = ${title},
        type = ${type},
        updated_at = current_timestamp
      WHERE id = ${id}
      RETURNING *
    `.then((rows) =>
      formatDbResponseForClient(rows[0], embedCodeSchema)
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
    host: embedCodeToSave.host,
    src: embedCodeToSave.src,
    title: embedCodeToSave.title,
    type: embedCodeToSave.type ?? null
  }
}
