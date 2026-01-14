'use server'

import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

import {
  createEmbedCodeSchema,
  embedCodeSchema
} from '@/lib/embed-codes/schemas'
import type {
  CreateEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/types'
import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function editEmbedCode (formData: FormData): Promise<FormResponse<EmbedCode>> {
  let validatedEmbedCode
  const data: Record<FormData['entries']['name'], unknown> = Object.fromEntries(formData)

  if (formData.get('id')) {
    validatedEmbedCode = embedCodeSchema.safeParse(data)
  } else {
    validatedEmbedCode = createEmbedCodeSchema.safeParse(data)
  }
  if (!validatedEmbedCode.success) {
    return {
      errors: validatedEmbedCode.error.flatten().fieldErrors,
      message: 'Failed to validate embed code.'
    }
  }
  try {
    const updatedEmbedCode = await updateEmbedCode(validatedEmbedCode.data)
    if (updatedEmbedCode) {
      revalidatePath('/dashboard/embed_codes')
      return {
        ok: true,
        res: updatedEmbedCode
      }
    }
  } catch (err) {
    const errMsg = 'Failed to edit embed code'
    const message = err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
    return { message }
  }
}

export async function deleteEmbedCode (embedCode: EmbedCode): Promise<FormResponse<EmbedCode>> {
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
    const message = err instanceof Error ? `${errMsg}: ${err.message}` : `${errMsg}.`
    return { message }
  }
}

async function createEmbedCode (embedCode: CreateEmbedCode) {
  try {
    const {
      iframe,
      caption,
      title
    } = embedCode
    return await sql<EmbedCode[]>`
      INSERT INTO embed_codes (
        iframe,
        caption,
        title,
        created_at
      ) VALUES (
        ${iframe},
        ${caption || null},
        ${title || null},
        current_timestamp
      )
      RETURNING *
    `.then(rows => formatDbResponseForClient(rows[0], embedCodeSchema))
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Failed to create embed code.')
  }
}

async function updateEmbedCode (embedCode: CreateEmbedCode | EmbedCode) {
  try {
    if (!(embedCode as EmbedCode).id) {
      return await createEmbedCode(embedCode)
    } else {
      const {
        iframe,
        caption,
        title
      } = embedCode
      return await sql<EmbedCode[]>`
        UPDATE embed_codes
        SET (
          iframe,
          caption,
          title,
          updated_at
        ) = (
          ${iframe},
          ${caption || null},
          ${title || null},
          current_timestamp
        )
        WHERE id = ${(embedCode as EmbedCode).id}
        RETURNING *
      `.then(rows => formatDbResponseForClient(rows[0], embedCodeSchema))
    }
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Failed to update embed code.')
  }
}
