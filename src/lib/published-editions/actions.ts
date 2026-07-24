'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { fetchPublishedEditionById } from '@/lib/published-editions/data'
import {
  type CreatePublishedEdition,
  createPublishedEditionSchema,
  type PublishedEdition,
  publishedEditionSchema
} from '@/lib/published-editions/schemas/db'
import { formatDbResponseForClient } from '@/lib/util'

export async function editPublishedEdition(
  formData: FormData,
  id?: string
) {
  return runFormAction({
    formData,
    schema: createPublishedEditionSchema,
    itemType: 'publishedEditions',
    invalidate: (saved?: PublishedEdition) => {
      if (saved) invalidatePublishedEditionTags(saved.releaseId)
    },
    save: (edition) =>
      id
        ? updatePublishedEdition(edition, id)
        : createPublishedEdition(edition)
  })
}

export async function deletePublishedEdition(
  edition: PublishedEdition
) {
  return runDeleteAction<PublishedEdition>({
    itemType: 'publishedEditions',
    invalidate: () =>
      invalidatePublishedEditionTags(edition.releaseId),
    del: async () => {
      await sql`
        DELETE FROM published_editions
        WHERE id = ${edition.id}
      `
    }
  })
}

/**
 * An edition's data is embedded directly into its parent release's
 * cached fetch (`build_published_edition_json`), so saving/deleting one
 * must also invalidate that release's own cache, not just the
 * published-editions list.
 */
function invalidatePublishedEditionTags(releaseId: string) {
  updateTag('published-editions')
  updateTag('releases')
  updateTag(`release:${releaseId}`)
}

async function createPublishedEdition(
  edition: CreatePublishedEdition
) {
  try {
    const {
      buyLinkId,
      catalogNumber,
      coverImageId,
      editionSize,
      format,
      publishDate,
      publisherId,
      releaseId
    } = toDbRow(edition)
    const rows = await sql`
      INSERT INTO published_editions (
        buy_link_id,
        catalog_number,
        cover_image_id,
        edition_size,
        format,
        publish_date,
        publisher_id,
        release_id,
        created_at
      )
      VALUES (
        ${buyLinkId},
        ${catalogNumber},
        ${coverImageId},
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
  const existingEdition = await fetchPublishedEditionById(id)
  try {
    const {
      buyLinkId,
      catalogNumber,
      coverImageId,
      editionSize,
      format,
      publishDate,
      publisherId,
      releaseId
    } = toDbRow(edition, existingEdition ?? undefined)
    const rows = await sql`
      UPDATE published_editions
      SET
        buy_link_id = ${buyLinkId},
        catalog_number = ${catalogNumber},
        cover_image_id = ${coverImageId},
        edition_size = ${editionSize},
        format = ${format},
        publish_date = ${publishDate},
        publisher_id = ${publisherId},
        release_id = ${releaseId},
        updated_at = current_timestamp
      WHERE id = ${id}
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

function toDbRow(
  publishedEdition: CreatePublishedEdition,
  existing?: PublishedEdition
) {
  const editionToSave = {
    ...existing,
    ...publishedEdition
  }

  return {
    buyLinkId: editionToSave.buyLinkId ?? null,
    catalogNumber: editionToSave.catalogNumber ?? null,
    coverImageId: editionToSave.coverImageId ?? null,
    editionSize: editionToSave.editionSize ?? null,
    format: editionToSave.format,
    publishDate: editionToSave.publishDate,
    publisherId: editionToSave.publisherId,
    releaseId: editionToSave.releaseId
  }
}
