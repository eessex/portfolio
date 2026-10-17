'use server'

import { updateTag } from 'next/cache'

import { requireAuth } from '@/lib/auth/guard'
import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import { syncReleasePublishedEditions } from '@/lib/published-editions/actions'
import {
  extractPublishedEditionEntries,
  PUBLISHED_EDITIONS_FIELD,
  publishedEditionEntryError
} from '@/lib/published-editions/util'
import { fetchReleaseById } from '@/lib/releases/data'
import {
  createReleaseSchema,
  releaseSchema
} from '@/lib/releases/schemas'
import type { CreateRelease, Release } from '@/lib/releases/types'
import { date, uuid } from '@/lib/schemas/primitives'
import { generateUniqueSlug } from '@/lib/slug/data'
import { slugCacheTag } from '@/lib/slug/util'
import type { FormResponse } from '@/lib/types'
import {
  formatDbResponseForClient,
  type IndexedGroupEntry,
  normalizeFormData
} from '@/lib/util'

async function prepareReleaseData(
  data: Record<string, unknown>,
  id: string | undefined,
  editions: IndexedGroupEntry[] | undefined
) {
  const [
    { coverImageId, imageIds },
    { linkIds },
    { embedCodeIds },
    slug
  ] = await Promise.all([
    resolveOrderedImageIds(data),
    resolveOrderedLinkIds(data),
    resolveOrderedEmbedCodeIds(data),
    generateUniqueSlug(String(data.title || ''), 'releases', id)
  ])

  return {
    ...data,
    coverImageId,
    embedCodeIds,
    imageIds,
    linkIds,
    path: 'releases',
    ...('artist' in data && {
      artist: await resolveArtist(data.artist, data.projectId)
    }),
    ...(editions && {
      releaseDate: await earliestEditionDate(editions, id)
    }),
    slug
  }
}

export async function editRelease(
  formData: FormData,
  id?: string
): Promise<FormResponse<Release>> {
  const denied = await requireAuth()
  if (denied) return denied

  // checked before anything is written; editions never reach the schema
  const editions = extractPublishedEditionEntries(
    Object.fromEntries(formData)
  )
  const editionsError = editions && publishedEditionsError(editions)
  if (editionsError) {
    return {
      ok: false,
      message: 'Failed to validate release.',
      errors: { [PUBLISHED_EDITIONS_FIELD]: [editionsError] }
    }
  }

  return runFormAction({
    formData,
    schema: createReleaseSchema,
    itemType: 'releases',
    prepare: async (data) =>
      await prepareReleaseData(data, id, editions),
    invalidate: (saved?: Release) =>
      invalidateReleaseTags(saved?.id ?? id),
    // not atomic (Neon HTTP can't interleave logic in a transaction);
    // validating editions up front narrows a partial save to DB errors
    save: async (release) => {
      const saved = id
        ? await updateRelease(release, id)
        : await createRelease(release)
      if (!editions) return saved
      try {
        await syncReleasePublishedEditions(saved.id, editions)
      } catch (err) {
        if (id) {
          // the release row itself was saved
          invalidateReleaseTags(id)
        } else {
          // else resubmitting creates a duplicate release
          await sql`DELETE FROM releases WHERE id = ${saved.id}`
        }
        throw err
      }
      return saved
    }
  })
}

/**
 * A blank artist is saved as the project's current name: a snapshot,
 * so renaming the project later doesn't re-credit past releases.
 */
async function resolveArtist(
  artist: unknown,
  projectId: unknown
): Promise<string | undefined> {
  const trimmed = typeof artist === 'string' ? artist.trim() : ''
  if (trimmed) return trimmed
  const id = uuid.safeParse(projectId)
  if (!id.success) return undefined
  const rows = await sql`
    SELECT title FROM projects WHERE id = ${id.data}
  `
  return rows[0]?.title?.trim() || undefined
}

function publishedEditionsError(editions: IndexedGroupEntry[]) {
  if (editions.length === 0) {
    return 'Add at least one published edition.'
  }
  return editions
    .map(publishedEditionEntryError)
    .find((error) => error !== undefined)
}

/**
 * A release's date is its earliest edition's. Untouched editions are
 * read from the DB, and only this release's (a new release has none).
 */
async function earliestEditionDate(
  editions: IndexedGroupEntry[],
  id?: string
): Promise<Date | undefined> {
  const dates: unknown[] = []
  const existingIds: string[] = []
  for (const entry of editions) {
    if (entry.kind === 'existing') existingIds.push(entry.id)
    else dates.push(normalizeFormData(entry.fields).publishDate)
  }
  if (id && existingIds.length) {
    const rows = await sql`
      SELECT publish_date FROM published_editions
      WHERE release_id = ${id} AND id = ANY(${existingIds})
    `
    dates.push(...rows.map((row) => row.publish_date))
  }
  const times = dates.flatMap((value) => {
    const parsed = date.safeParse(value)
    return parsed.success ? [parsed.data.getTime()] : []
  })
  return times.length ? new Date(Math.min(...times)) : undefined
}

/**
 * Deleting a release cascades to its published editions, and saving
 * can create or edit images/links/embed codes/publishers inline, so
 * those tags go too, plus the other caches that embed those items.
 */
function invalidateReleaseTags(id?: string) {
  updateTag('releases')
  updateTag('releases:authed')
  updateTag('releases:public')
  updateTag(slugCacheTag('releases'))
  if (id) updateTag(`release:${id}`)
  updateTag('published-editions')
  updateTag('publishers')
  updateTag('images')
  updateTag('links')
  updateTag('embed-codes')
  updateTag('projects')
  updateTag('events')
  // event details carry only these, not `events`
  updateTag('events:authed')
  updateTag('events:public')
  updateTag('settings')
}

export async function deleteRelease(release: Release) {
  return runDeleteAction<Release>({
    itemType: 'releases',
    invalidate: () => invalidateReleaseTags(release.id),
    del: async () => {
      await sql`
        DELETE FROM releases
        WHERE id = ${release.id}
      `
    }
  })
}

async function createRelease(release: CreateRelease) {
  try {
    const {
      artist,
      coverImageId,
      description,
      embedCodeIds,
      imageIds,
      isPublished,
      linkIds,
      projectId,
      releaseDate,
      shortDescription,
      slug,
      tagIds,
      title,
      type
    } = toDbRow(release)
    const rows = await sql`
      INSERT INTO releases (
        artist,
        cover_image_id,
        description,
        embed_code_ids,
        image_ids,
        is_published,
        link_ids,
        project_id,
        release_date,
        short_description,
        slug,
        tag_ids,
        title,
        type,
        created_at
      ) VALUES (
        ${artist},
        ${coverImageId},
        ${description},
        ${embedCodeIds},
        ${imageIds},
        ${isPublished},
        ${linkIds},
        ${projectId},
        ${releaseDate},
        ${shortDescription},
        ${slug},
        ${tagIds},
        ${title},
        ${type},
        current_timestamp
      )
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to create release.')
    return formatDbResponseForClient(
      { ...row, path: 'releases' },
      releaseSchema
    )
  } catch (cause) {
    throw new Error('Failed to create release.', { cause })
  }
}

async function updateRelease(release: CreateRelease, id: string) {
  const existingRelease = await fetchReleaseById(id, true)
  try {
    const {
      artist,
      coverImageId,
      description,
      embedCodeIds,
      imageIds,
      isPublished,
      linkIds,
      projectId,
      releaseDate,
      shortDescription,
      slug,
      tagIds,
      title,
      type
    } = toDbRow(release, existingRelease)
    const rows = await sql`
      UPDATE releases
      SET
        artist = ${artist},
        cover_image_id = ${coverImageId},
        description = ${description},
        embed_code_ids = ${embedCodeIds},
        image_ids = ${imageIds},
        is_published = ${isPublished},
        link_ids = ${linkIds},
        project_id = ${projectId},
        release_date = ${releaseDate},
        short_description = ${shortDescription},
        slug = ${slug},
        tag_ids = ${tagIds},
        title = ${title},
        type = ${type},
        updated_at = current_timestamp
      WHERE id = ${id}
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to update release.')
    return formatDbResponseForClient(
      { ...row, path: 'releases' },
      releaseSchema
    )
  } catch (cause) {
    throw new Error('Failed to update release.', { cause })
  }
}

function toDbRow(
  release: CreateRelease,
  existing?: Partial<Release>
) {
  const releaseToSave = {
    ...existing,
    ...release
  }

  return {
    artist: releaseToSave.artist ?? null,
    coverImageId: releaseToSave.coverImageId ?? null,
    description: releaseToSave.description ?? null,
    embedCodeIds: releaseToSave.embedCodeIds ?? null,
    imageIds: releaseToSave.imageIds ?? null,
    isPublished: releaseToSave.isPublished ?? null,
    linkIds: releaseToSave.linkIds ?? null,
    projectId: releaseToSave.projectId ?? null,
    releaseDate: releaseToSave.releaseDate,
    shortDescription: releaseToSave.shortDescription ?? null,
    slug: releaseToSave.slug,
    tagIds: releaseToSave.tagIds ?? null,
    title: releaseToSave.title,
    type: releaseToSave.type
  }
}
