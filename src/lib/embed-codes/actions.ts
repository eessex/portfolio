'use server'

import { revalidatePath } from 'next/cache'

import { sql } from '@/lib/db'
import {
  createEmbedCodeSchema,
  editEmbedCodeSchema,
  embedCodeSchema
} from '@/lib/embed-codes/schemas'
import type {
  CreateEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/types'
import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'

export async function editEmbedCode(
  formData: FormData
): Promise<FormResponse<EmbedCode>> {
  let validatedEmbedCode
  const data: Record<FormData['entries']['name'], unknown> =
    Object.fromEntries(formData)

  if (formData.get('id')) {
    validatedEmbedCode = editEmbedCodeSchema.safeParse(data)
  } else {
    validatedEmbedCode = createEmbedCodeSchema.safeParse(data)
  }
  if (!validatedEmbedCode.success) {
    return {
      ok: false,
      errors: validatedEmbedCode.error.flatten().fieldErrors,
      message: 'Failed to validate embed code.'
    }
  }
  try {
    const updatedEmbedCode = await updateEmbedCode(
      validatedEmbedCode.data
    )
    if (updatedEmbedCode) {
      revalidatePath('/dashboard/embed_codes')
      return {
        ok: true,
        res: updatedEmbedCode
      }
    }
  } catch (err) {
    const errMsg = 'Failed to edit embed code'
    const message =
      err instanceof Error
        ? `${errMsg}: ${err.message}`
        : `${errMsg}.`
    return {
      ok: false,
      message
    }
  }
}

export async function deleteEmbedCode(
  embedCode: EmbedCode
): Promise<FormResponse<EmbedCode>> {
  try {
    await sql`
      DELETE FROM embed_codes
      WHERE
        id = ${embedCode.id}
        OR iframe = ${embedCode.iframe}
    `
    revalidatePath('/dashboard/embed_codes')
    return { ok: true }
  } catch (err) {
    const errMsg = 'Failed to delete embed code'
    const message =
      err instanceof Error
        ? `${errMsg}: ${err.message}`
        : `${errMsg}.`
    return {
      ok: false,
      message
    }
  }
}

async function createEmbedCode(embedCode: CreateEmbedCode) {
  try {
    const { src, iframe, type, caption, title, host } = embedCode
    return await sql`
      INSERT INTO embed_codes (
        src,
        iframe,
        type,
        caption,
        title,
        host,
        created_at
      ) VALUES (
        ${src},
        ${iframe},
        ${type},
        ${caption || null},
        ${title || null},
        ${host},
        current_timestamp
      )
      RETURNING *
    `.then((rows) =>
      formatDbResponseForClient(rows[0], embedCodeSchema)
    )
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? err.message
        : 'Failed to create embed code.'
    )
  }
}

async function updateEmbedCode(
  embedCode: CreateEmbedCode | EmbedCode
) {
  try {
    if (!(embedCode as EmbedCode).id) {
      return await createEmbedCode(embedCode)
    } else {
      const { src, iframe, type, caption, title, host } = embedCode
      return await sql`
        UPDATE embed_codes
        SET (
          src,
          iframe,
          type,
          caption,
          title,
          host,
          updated_at
        ) = (
          ${src},
          ${iframe},
          ${type},
          ${caption || null},
          ${title || null},
          ${host || null},
          current_timestamp
        )
        WHERE id = ${(embedCode as EmbedCode).id}
        RETURNING *
      `.then((rows) =>
        formatDbResponseForClient(rows[0], embedCodeSchema)
      )
    }
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? err.message
        : 'Failed to update embed code.'
    )
  }
}
