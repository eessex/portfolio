'use server'

import { assertAuthed } from '@/lib/auth/guard'
import { sql } from '@/lib/db'
import { saveItemFromFields } from '@/lib/form-action'
import {
  type CreatePublishedEdition,
  createPublishedEditionSchema,
  type PublishedEdition,
  publishedEditionSchema
} from '@/lib/published-editions/schemas/db'
import { resolvePublisherId } from '@/lib/publishers/actions'
import {
  formatDbResponseForClient,
  type IndexedGroupEntry
} from '@/lib/util'

/**
 * Creates or updates one of a release's editions from its inline
 * picker fields, resolving its publisher (`publisherId` or an inline
 * `publisher.name`) first. Updates are scoped to `releaseId`, so an id
 * from another release can't be edited through this one.
 */
export async function savePublishedEditionFromFields(
  releaseId: string,
  fields: Record<string, unknown>,
  id?: string
): Promise<PublishedEdition> {
  return saveItemFromFields({
    id,
    fields,
    schema: createPublishedEditionSchema,
    itemType: 'publishedEditions',
    prepare: async (raw) => ({
      ...raw,
      publisherId: await resolvePublisherId(raw),
      releaseId
    }),
    create: createPublishedEdition,
    update: updatePublishedEdition
  })
}

/**
 * Reconciles a release's editions with its submitted picker entries:
 * new ones are created, edited ones updated, and any of the release's
 * editions no longer listed are deleted. Run after the release itself
 * is saved, since a new release's id isn't known until then.
 */
export async function syncReleasePublishedEditions(
  releaseId: string,
  entries: IndexedGroupEntry[]
) {
  await assertAuthed()
  const keptIds: string[] = []
  const createdIds: string[] = []
  try {
    // sequential: inline publishers created by two editions would race
    for (const entry of entries) {
      if (entry.kind === 'existing') {
        keptIds.push(entry.id)
        continue
      }
      const saved = await savePublishedEditionFromFields(
        releaseId,
        entry.fields,
        entry.kind === 'edited' ? entry.id : undefined
      )
      keptIds.push(saved.id)
      if (entry.kind === 'new') createdIds.push(saved.id)
    }
    await sql`
      DELETE FROM published_editions
      WHERE release_id = ${releaseId}
        AND NOT (id = ANY(${keptIds}::uuid[]))
    `
  } catch (err) {
    // else resubmitting the form would create them again
    if (createdIds.length) {
      await sql`
        DELETE FROM published_editions
        WHERE release_id = ${releaseId}
          AND id = ANY(${createdIds}::uuid[])
      `
    }
    throw err
  }
}

async function createPublishedEdition(
  edition: CreatePublishedEdition
) {
  try {
    const {
      catalogNumber,
      editionSize,
      format,
      publishDate,
      publisherId,
      releaseId
    } = toDbRow(edition)
    const rows = await sql`
      INSERT INTO published_editions (
        catalog_number,
        edition_size,
        format,
        publish_date,
        publisher_id,
        release_id,
        created_at
      )
      VALUES (
        ${catalogNumber},
        ${editionSize},
        ${format},
        ${publishDate},
        ${publisherId},
        ${releaseId},
        current_timestamp
      )
      RETURNING *
    `
    const row = rows[0]
    if (!row) {
      throw new Error('Failed to create published edition.')
    }
    return formatDbResponseForClient(row, publishedEditionSchema)
  } catch (cause) {
    throw new Error('Failed to create published edition.', {
      cause
    })
  }
}

async function updatePublishedEdition(
  edition: CreatePublishedEdition,
  id: string
) {
  try {
    const {
      catalogNumber,
      editionSize,
      format,
      publishDate,
      publisherId,
      releaseId
    } = toDbRow(edition)
    // the inline editor submits every editable field, so no merge
    const rows = await sql`
      UPDATE published_editions
      SET
        catalog_number = ${catalogNumber},
        edition_size = ${editionSize},
        format = ${format},
        publish_date = ${publishDate},
        publisher_id = ${publisherId},
        updated_at = current_timestamp
      WHERE id = ${id} AND release_id = ${releaseId}
      RETURNING *
    `
    const row = rows[0]
    if (!row) {
      throw new Error('Failed to update published edition.')
    }
    return formatDbResponseForClient(row, publishedEditionSchema)
  } catch (cause) {
    throw new Error('Failed to update published edition.', {
      cause
    })
  }
}

/** Only editable columns: hidden ones (buy link, images) are kept. */
function toDbRow(edition: CreatePublishedEdition) {
  return {
    catalogNumber: edition.catalogNumber ?? null,
    editionSize: edition.editionSize ?? null,
    format: edition.format,
    publishDate: edition.publishDate,
    publisherId: edition.publisherId,
    releaseId: edition.releaseId
  }
}
