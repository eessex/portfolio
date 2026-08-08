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
import {
  formatDbResponseForClient,
  normalizeFormData
} from '@/lib/util'

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

/**
 * Creates a new publisher from raw (unnormalized) field data, e.g. an
 * inline creation from a single-item publisher picker. Mirrors
 * `editPublisher`'s own normalize -> validate -> save pipeline, since
 * it runs outside `runFormAction`.
 */
export async function createPublisherFromFields(
  fields: Record<string, unknown>
): Promise<Publisher> {
  const parsed = createPublisherSchema.safeParse(
    normalizeFormData(fields)
  )
  if (!parsed.success) {
    throw new Error(
      `Invalid publisher data: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(', ')}`
    )
  }
  return createPublisher(parsed.data)
}

/**
 * Resolves a single-item publisher picker's submission — either an
 * existing selection (`publisherId`) or a pending inline creation (the
 * unbracketed `name`/`type`/`url` fields `EditPublisher` renders when
 * used as a picker's `renderEditItemForm`, since the picker isn't
 * `isMulti`) — into a publisher id. Mutates `data`, removing the
 * inline-creation fields so they don't reach the parent form's own
 * schema validation. Returns `undefined` when neither was submitted.
 */
export async function resolvePublisherId(
  data: Record<string, unknown>
): Promise<string | undefined> {
  if (typeof data.publisherId === 'string' && data.publisherId) {
    return data.publisherId
  }

  const fields = {
    name: data.name,
    type: data.type,
    url: data.url
  }
  delete data.name
  delete data.type
  delete data.url

  if (typeof fields.name !== 'string' || !fields.name) {
    return undefined
  }

  const publisher = await createPublisherFromFields(fields)
  return publisher.id
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
