'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  resolveItemId,
  runDeleteAction,
  runFormAction,
  saveItemFromFields
} from '@/lib/form-action'
import { itemIdFieldName } from '@/lib/item-fields'
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
 * Publishers are embedded into releases' cached fetches (via their
 * published editions' build_publisher_json), so saving/deleting one must
 * invalidate that cache too, not just the publishers list.
 */
function invalidatePublisherTags() {
  updateTag('publishers')
  updateTag('releases')
}

/**
 * Creates or updates from raw (unnormalized) field data,
 * ie an entry pulled out of another domain's form submission.
 */
export async function savePublisherFromFields(
  fields: Record<string, unknown>,
  id?: string
): Promise<Publisher> {
  return saveItemFromFields({
    id,
    fields,
    schema: createPublisherSchema,
    itemType: 'publishers',
    create: findOrCreatePublisher,
    update: updatePublisher
  })
}

/**
 * An inline "Create “{name}”" can race the search results, so an
 * existing publisher with that name (any case) is reused.
 */
async function findOrCreatePublisher(publisher: CreatePublisher) {
  const rows = await sql`
    SELECT * FROM publishers
    WHERE lower(name) = lower(${publisher.name})
    LIMIT 1
  `
  if (rows[0])
    return formatDbResponseForClient(rows[0], publisherSchema)
  return createPublisher(publisher)
}

/**
 * Resolves a single-item publisher picker's submission into a
 * publisher id — see `resolveItemId`.
 */
export async function resolvePublisherId(
  data: Record<string, unknown>,
  idField = itemIdFieldName('publishers')
): Promise<string | undefined> {
  return resolveItemId(data, idField, savePublisherFromFields)
}

const BUILT_IN_MESSAGE =
  'The Self-released publisher is built in and can’t be changed.'

export async function deletePublisher(publisher: Publisher) {
  return runDeleteAction<Publisher>({
    itemType: 'publishers',
    invalidate: invalidatePublisherTags,
    del: async () => {
      // stored flag, not the client-sent one
      const rows = await sql`
        SELECT is_built_in FROM publishers
        WHERE id = ${publisher.id}
      `
      if (rows[0]?.is_built_in) {
        return { ok: false, message: BUILT_IN_MESSAGE }
      }
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
  if (existingPublisher?.isBuiltIn) throw new Error(BUILT_IN_MESSAGE)
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
    type: publisherToSave.type ?? null,
    url: publisherToSave.url ?? null
  }
}
