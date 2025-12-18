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
    console.error('Error creating embed code:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to create embed code.')
  }
}

export async function editEmbedCode (formData: FormData): Promise<FormResponse<EmbedCode>> {
  let validatedEmbedCode

  const data = Object.fromEntries(formData)
  if (formData.get('id')) {
    validatedEmbedCode = embedCodeSchema.safeParse(data)
  } else {
    validatedEmbedCode = createEmbedCodeSchema.safeParse(data)
  }
  if (!validatedEmbedCode.success) {
    console.error('Failed to validate embed code.', validatedEmbedCode.error.flatten().fieldErrors)
    return {
      errors: validatedEmbedCode.error.flatten().fieldErrors,
      message: 'Failed to validate embed code.'
    }
  }
  try {
    const updatedEmbedCode = await updateEmbedCode(validatedEmbedCode.data)
    if (updatedEmbedCode) {
      console.debug('Embed code saved successfully:', updatedEmbedCode)
      revalidatePath('/dashboard/embed_codes')
      return {
        ok: true,
        res: updatedEmbedCode
      }
    }
  } catch (err) {
    console.error('Failed to save EmbedCode:', err)
    throw new Error('Failed to save EmbedCode.')
  }
}

async function updateEmbedCode (embedCode: CreateEmbedCode | EmbedCode) {
  if (!(embedCode as EmbedCode).id) {
    try {
      return await createEmbedCode(embedCode)
    } catch (err) {
      console.error('Error creating embed code:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to create embed code.')
    }
  } else {
    const {
      iframe,
      caption,
      title
    } = embedCode
    try {
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
    } catch (err) {
      console.error('Error updating embed code:', err)
      throw new Error('Failed to update embed code.')
    }
  }
}

export async function deleteEmbedCode (id: string): Promise<FormResponse<EmbedCode>> {
  try {
    await sql`
      DELETE FROM embed_codes
      WHERE id = ${id}
    `
    // FIXME: add iframe to where
    revalidatePath('/dashboard/embed_codes')
    return { ok: true }
  } catch (err) {
    console.error('Error deleting embed code:', err)
    throw new Error('Failed to delete embed code.')
  }
}
