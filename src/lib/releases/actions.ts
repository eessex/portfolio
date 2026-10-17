'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import { fetchReleaseById } from '@/lib/releases/data'
import {
  createReleaseSchema,
  releaseSchema
} from '@/lib/releases/schemas'
import type { CreateRelease, Release } from '@/lib/releases/types'
import { generateUniqueSlug } from '@/lib/slug/data'
import { slugCacheTag } from '@/lib/slug/util'
import { formatDbResponseForClient } from '@/lib/util'

async function prepareReleaseData(
  data: Record<string, unknown>,
  id?: string
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
    slug
  }
}

export async function editRelease(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createReleaseSchema,
    itemType: 'releases',
    prepare: async (data) => await prepareReleaseData(data, id),
    invalidate: (saved?: Release) =>
      invalidateReleaseTags(saved?.id ?? id),
    save: (release) =>
      id ? updateRelease(release, id) : createRelease(release)
  })
}

/**
 * Deleting a release cascades to its published editions, and saving
 * can create images/links/embed codes inline, so those tags go too.
 */
function invalidateReleaseTags(id?: string) {
  updateTag('releases')
  updateTag('releases:authed')
  updateTag('releases:public')
  updateTag(slugCacheTag('releases'))
  if (id) updateTag(`release:${id}`)
  updateTag('published-editions')
  updateTag('images')
  updateTag('links')
  updateTag('embed-codes')
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
