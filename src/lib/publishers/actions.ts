'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { fetchPublisherById } from '@/lib/publishers/data'
import {
  type CreatePublisher,
  createPublisherSchema,
  type Publisher,
  publisherSchema
} from '@/lib/publishers/schemas/db'
import { formatDbResponseForClient } from '@/lib/util'

export async function editPublisher(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createPublisherSchema,
    itemType: 'publishers',
    invalidate: invalidatePublisherTags,
    save: (publisher) =>
      id ? updatePublisher(publisher, id) : createPublisher(publisher)
  })
}

/**
 * Publishers are embedded directly into published editions' cached
 * fetches via build_publisher_json, so saving/deleting one must
 * invalidate that cache too, not just the publishers list.
 */
function invalidatePublisherTags() {
  updateTag('publishers')
  updateTag('published-editions')
}

export async function deletePublisher(publisher: Publisher) {
  return runDeleteAction<Publisher>({
    itemType: 'publishers',
    invalidate: invalidatePublisherTags,
    del: async () => {
      await sql`
        DELETE FROM publishers
        WHERE id = ${publisher.id}
      `
    }
  })
}

async function createPublisher(publisher: CreatePublisher) {
  try {
    const { name, type, url } = toDbRow(publisher)
    const rows = await sql`
      INSERT INTO publishers (
        name,
        type,
        url,
        created_at
      ) VALUES (
        ${name},
        ${type},
        ${url},
        current_timestamp
      )
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to create publisher.')
    return formatDbResponseForClient(row, publisherSchema)
  } catch (cause) {
    throw new Error('Failed to create publisher.', { cause })
  }
}

async function updatePublisher(
  publisher: CreatePublisher,
  id: string
) {
  const existingPublisher = await fetchPublisherById(id)
  try {
    const { name, type, url } = toDbRow(
      publisher,
      existingPublisher ?? undefined
    )
    const rows = await sql`
      UPDATE publishers
      SET
        name = ${name},
        type = ${type},
        updated_at = current_timestamp,
        url = ${url}
      WHERE id = ${id}
      RETURNING *
    `

    const row = rows[0]
    if (!row) throw new Error('Failed to update publisher.')
    return formatDbResponseForClient(row, publisherSchema)
  } catch (cause) {
    throw new Error('Failed to update publisher.', { cause })
  }
}

function toDbRow(publisher: CreatePublisher, existing?: Publisher) {
  const publisherToSave = {
    ...existing,
    ...publisher
  }

  return {
    name: publisherToSave.name,
    type: publisherToSave.type,
    url: publisherToSave.url ?? null
  }
}
