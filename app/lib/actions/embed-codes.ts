'use server'

import { revalidatePath } from 'next/cache'
import postgres from 'postgres'
import {
  EmbedCodeSchema,
} from '../scemas'
import { EmbedCode, FormResponse } from '../definitions'
import { validatedItemArray } from '@/lib/actions'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createEmbedCode (embedCode: EmbedCode) {
  const { iframe, caption, title } = embedCode
  try {
    const maybeId = await sql`SELECT id from embed_codes WHERE iframe = ${iframe}`
    if (maybeId.length > 0) {
      console.debug('Embed code already exists:', maybeId[0].id)
      return { ...embedCode, id: maybeId[0].id }
    } else {
      console.debug('Creating new embed code:', embedCode)
      const result = await sql<EmbedCode[]>`
      INSERT INTO embed_codes (iframe, caption, title, created_at)
      VALUES (${iframe}, ${caption || null}, ${title || null}, current_timestamp)
      RETURNING *
    `
      if (result.length > 0) {
        console.debug('Embed code created successfully:', result[0])
        return { ...result[0] }
      }
    }
  } catch (err) {
    console.error('Error creating embed code:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to create embed code.')
  }
  return null
}

export async function editEmbedCode (formData: FormData): Promise<FormResponse<EmbedCode>> {
  const data: Record<FormData['entries']['name'], unknown> = {}
  formData.entries().forEach(([n, v]) => { data[n] = v })
  const validatedFields = EmbedCodeSchema.safeParse(data)
  if (!validatedFields.success) {
    console.error('Failed to validate embed code.', validatedFields.error.flatten().fieldErrors)
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate embed code.',
    }
  }
  try {
    const embedCode = validatedFields.data as EmbedCode
    const updatedEmbedCodes = await updateEmbedCode(embedCode)
    if (updatedEmbedCodes) {
      console.debug('Embed code saved successfully:', updatedEmbedCodes)
      revalidatePath('/dashboard/embed_codes')
      return { ok: true, res: updatedEmbedCodes[0] }
    }
  } catch (err) {
    console.error('Failed to save EmbedCode:', err)
    throw new Error('Failed to save EmbedCode.')
  }
}

async function updateEmbedCode (embedCode: EmbedCode) {
  let savedEmbedCode: EmbedCode | null = null
  try {
    await sql.begin(async (tx) => {
      const { id, iframe, caption, title } = embedCode
      if (!id) {
        try {
          const res = await createEmbedCode(embedCode)
          if (res?.id) {
            savedEmbedCode = res
          }
        } catch (err) {
          console.error('Error creating embed code:', err)
          throw new Error(err instanceof Error ? err.message : 'Failed to create embed code.')
        }
      } else {
        try {
          await tx`
            UPDATE embed_codes
            SET (iframe, caption, title)
            = (${iframe}, ${caption || null}, ${title || null})
            WHERE id = ${id}
          `.then(() => {
              savedEmbedCode = embedCode
            })
        } catch (err) {
          console.error('Error updating embed code:', err)
          throw new Error('Failed to update embed code.')
        }
      }
    })
    return savedEmbedCode
  } catch (err) {
    console.error('Error saving embed codes:', err)
  }
}

export async function deleteEmbedCode (id: string): Promise<FormResponse<EmbedCode>> {
  try {
    await sql`
      DELETE FROM embed_codes
      WHERE id = ${id}
    `
    revalidatePath('/dashboard/embed_codes')
    return { ok: true }
  } catch (err) {
    console.error('Error deleting embed code:', err)
    throw new Error('Failed to delete embed code.')
  }
}

async function updateEmbedCodes (embedCodes: Array<EmbedCode>) {
  const savedEmbedCodes: Array<EmbedCode | null> = new Array(embedCodes.length).fill(null)
  try {
    await sql.begin(async (tx) => {
      for (const [i, embedCode] of embedCodes.entries()) {
        const { id, iframe, caption, title } = embedCode
        if (!id) {
          try {
            const res = await createEmbedCode(embedCode)
            if (res?.id) {
              savedEmbedCodes[i] = res
            }
          } catch (err) {
            console.error('Error creating embed code:', err)
            throw new Error(err instanceof Error ? err.message : 'Failed to create embed code.')
          }
        } else {
          try {
            await tx`
              UPDATE embed_codes
              SET (iframe, caption, title) = (${iframe}, ${caption || null}, ${title || null})
              WHERE id = ${id}
            `.then(() => {
                savedEmbedCodes.push(embedCode)
              })
          } catch (err) {
            console.error('Error updating embed code:', err)
            throw new Error('Failed to update embed code.')
          }
        }
      }
    })
  } catch (err) {
    console.error('Error saving embed codes:', err)
  }
  return savedEmbedCodes
}

export async function editEmbedCodes (formData: FormData) {
  try {
    const embedCodes = await validatedItemArray(formData, 'embedCode') as Array<EmbedCode>
    const updatedEmbedCodes = await updateEmbedCodes(embedCodes)

    if (updatedEmbedCodes) {
      return updatedEmbedCodes[0]
    }
  } catch (err) {
    console.error('Failed to save EmbedCodes:', err)
    throw new Error('Failed to save EmbedCodes.')
  }
}
