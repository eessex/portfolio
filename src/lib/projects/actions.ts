'use server'

import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { runDeleteAction, runFormAction } from '@/lib/form-action'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import { fetchProjectById } from '@/lib/projects/data'
import {
  createProjectSchema,
  projectSchema
} from '@/lib/projects/schemas'
import type { CreateProject, Project } from '@/lib/projects/types'
import { generateUniqueSlug } from '@/lib/slug/data'
import { formatDbResponseForClient } from '@/lib/util'

export async function editProject(formData: FormData, id?: string) {
  return runFormAction({
    formData,
    schema: createProjectSchema,
    itemType: 'projects',
    prepare: async (data) => {
      const { coverImageId, imageIds } =
        await resolveOrderedImageIds(data)
      const { linkIds } = await resolveOrderedLinkIds(data)
      const { embedCodeIds, featuredEmbedCodeId } =
        await resolveOrderedEmbedCodeIds(data)

      return {
        ...data,
        coverImageId,
        embedCodeIds,
        featuredEmbedCodeId,
        imageIds,
        linkIds,
        path: 'projects',
        slug: await generateUniqueSlug(
          String(data.title || ''),
          'projects',
          id
        )
      }
    },
    invalidate: (saved?: Project) =>
      invalidateProjectTags(saved?.id ?? id),
    save: (project) =>
      id ? updateProject(project, id) : createProject(project)
  })
}

/**
 * Projects are embedded directly into their releases'/events' cached
 * fetches via build_project_json, so saving/deleting one must
 * invalidate those caches too, not just the projects list. Saving can
 * also create new images/links/embed codes inline (via the
 * `images`/`links`/`embedCodes` pickers' create-new flows), bypassing
 * `editImage`'s/`editLink`'s/`editEmbedCode`'s own cache invalidation,
 * so those tags are invalidated here too rather than only on direct
 * image/link/embed code edits.
 */
function invalidateProjectTags(id?: string) {
  updateTag('projects')
  updateTag('projects:authed')
  updateTag('projects:public')
  if (id) updateTag(`project:${id}`)
  updateTag('releases')
  updateTag('events')
  updateTag('images')
  updateTag('links')
  updateTag('embed-codes')
}

export async function deleteProject(project: Project) {
  return runDeleteAction<Project>({
    itemType: 'projects',
    invalidate: () => invalidateProjectTags(project.id),
    del: async () => {
      await sql`
        DELETE FROM projects
        WHERE id = ${project.id}
      `
    }
  })
}

async function createProject(project: CreateProject) {
  try {
    const {
      coverImageId,
      description,
      embedCodeIds,
      endDate,
      featuredEmbedCodeId,
      imageIds,
      isPublished,
      linkIds,
      shortDescription,
      slug,
      startDate,
      tagIds,
      title,
      type
    } = toDbRow(project)
    const rows = await sql`
      INSERT INTO projects (
        cover_image_id,
        description,
        embed_code_ids,
        end_date,
        featured_embed_code_id,
        image_ids,
        is_published,
        link_ids,
        short_description,
        slug,
        start_date,
        tag_ids,
        title,
        type,
        created_at
      ) VALUES (
        ${coverImageId},
        ${description},
        ${embedCodeIds},
        ${endDate},
        ${featuredEmbedCodeId},
        ${imageIds},
        ${isPublished},
        ${linkIds},
        ${shortDescription},
        ${slug},
        ${startDate},
        ${tagIds},
        ${title},
        ${type},
        current_timestamp
      )
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to create project.')
    await syncChildProjectIds(row.id, childIdsOf(project))
    return formatDbResponseForClient(
      { ...row, path: 'projects' },
      projectSchema
    )
  } catch (cause) {
    throw new Error('Failed to create project.', { cause })
  }
}

async function updateProject(project: CreateProject, id: string) {
  const existingProject = await fetchProjectById(id, true)
  try {
    const {
      coverImageId,
      description,
      embedCodeIds,
      endDate,
      featuredEmbedCodeId,
      imageIds,
      isPublished,
      linkIds,
      shortDescription,
      slug,
      startDate,
      tagIds,
      title,
      type
    } = toDbRow(project, existingProject)
    const rows = await sql`
      UPDATE projects
      SET
        cover_image_id = ${coverImageId},
        description = ${description},
        embed_code_ids = ${embedCodeIds},
        end_date = ${endDate},
        featured_embed_code_id = ${featuredEmbedCodeId},
        image_ids = ${imageIds},
        is_published = ${isPublished},
        link_ids = ${linkIds},
        short_description = ${shortDescription},
        slug = ${slug},
        start_date = ${startDate},
        tag_ids = ${tagIds},
        title = ${title},
        type = ${type},
        updated_at = current_timestamp
      WHERE id = ${id}
      RETURNING *
    `
    const row = rows[0]
    if (!row) throw new Error('Failed to update project.')
    await syncChildProjectIds(
      id,
      childIdsOf(project),
      existingProject && childIdsOf(existingProject)
    )
    return formatDbResponseForClient(
      { ...row, path: 'projects' },
      projectSchema
    )
  } catch (cause) {
    throw new Error('Failed to update project.', { cause })
  }
}

/**
 * The full set of image/link/embed-code ids a project owns, including
 * the cover image / featured embed code (which are stored in their own
 * columns rather than the `*Ids` arrays).
 */
function childIdsOf(project: {
  coverImageId?: string
  embedCodeIds?: string[]
  featuredEmbedCodeId?: string
  imageIds?: string[]
  linkIds?: string[]
}) {
  return {
    imageIds: project.coverImageId
      ? [project.coverImageId, ...(project.imageIds ?? [])]
      : (project.imageIds ?? []),
    linkIds: project.linkIds ?? [],
    embedCodeIds: project.featuredEmbedCodeId
      ? [project.featuredEmbedCodeId, ...(project.embedCodeIds ?? [])]
      : (project.embedCodeIds ?? [])
  }
}

type ChildIds = ReturnType<typeof childIdsOf>

/**
 * Keeps the canonical, indexed `project_id` back-reference on
 * images/links/embed_codes in sync with a project's `*Ids` arrays: every
 * id newly present is stamped with this project's id, every id no
 * longer present is cleared back to NULL (which reassigns it to the
 * default project, per the NULL-means-default ownership rule).
 */
async function syncChildProjectIds(
  projectId: string,
  next: ChildIds,
  previous?: ChildIds
) {
  const images = diffedIds(next.imageIds, previous?.imageIds)
  const links = diffedIds(next.linkIds, previous?.linkIds)
  const embedCodes = diffedIds(
    next.embedCodeIds,
    previous?.embedCodeIds
  )

  if (images.attached.length) {
    await sql`
      UPDATE images
      SET project_id = ${projectId}
      WHERE id = ANY(${images.attached})
    `
  }
  if (images.detached.length) {
    await sql`
      UPDATE images
      SET project_id = NULL
      WHERE id = ANY(${images.detached}) AND project_id = ${projectId}
    `
  }

  if (links.attached.length) {
    await sql`
      UPDATE links
      SET project_id = ${projectId}
      WHERE id = ANY(${links.attached})
    `
  }
  if (links.detached.length) {
    await sql`
      UPDATE links
      SET project_id = NULL
      WHERE id = ANY(${links.detached}) AND project_id = ${projectId}
    `
  }

  if (embedCodes.attached.length) {
    await sql`
      UPDATE embed_codes
      SET project_id = ${projectId}
      WHERE id = ANY(${embedCodes.attached})
    `
  }
  if (embedCodes.detached.length) {
    await sql`
      UPDATE embed_codes
      SET project_id = NULL
      WHERE id = ANY(${embedCodes.detached})
        AND project_id = ${projectId}
    `
  }
}

function diffedIds(next: string[], previous: string[] = []) {
  return {
    attached: diffIds(next, previous),
    detached: diffIds(previous, next)
  }
}

/** Ids present in `next` but not in `previous`. */
function diffIds(next: string[], previous: string[]) {
  const previousSet = new Set(previous)
  return next.filter((id) => !previousSet.has(id))
}

function toDbRow(
  project: CreateProject,
  existing?: Partial<Project>
) {
  const projectToSave = {
    ...existing,
    ...project
  }

  return {
    coverImageId: projectToSave.coverImageId ?? null,
    description: projectToSave.description ?? null,
    embedCodeIds: projectToSave.embedCodeIds ?? null,
    endDate: projectToSave.endDate ?? null,
    featuredEmbedCodeId: projectToSave.featuredEmbedCodeId ?? null,
    imageIds: projectToSave.imageIds ?? null,
    isPublished: projectToSave.isPublished ?? null,
    linkIds: projectToSave.linkIds ?? null,
    shortDescription: projectToSave.shortDescription ?? null,
    slug: projectToSave.slug,
    startDate: projectToSave.startDate ?? null,
    tagIds: projectToSave.tagIds ?? null,
    title: projectToSave.title,
    type: projectToSave.type ?? null
  }
}
