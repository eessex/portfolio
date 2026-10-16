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
import type { Contact } from '@/lib/schemas/fields'
import { generateUniqueSlug } from '@/lib/slug/data'
import { slugCacheTag } from '@/lib/slug/util'
import {
  extractIndexedGroups,
  formatDbResponseForClient
} from '@/lib/util'

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
      const contactInfo = resolveContactInfo(data)

      return {
        ...data,
        // Omitted (not just undefined) when the editor wasn't submitted,
        // so a partial update keeps the existing contacts.
        ...(contactInfo && { contactInfo }),
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
  updateTag(slugCacheTag('projects'))
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
    // one transaction, so a failed DELETE doesn't leave the hand-offs
    // applied to a project that still exists
    del: async () => {
      await sql.transaction([
        handOffImages(project.id),
        handOffLinks(project.id),
        handOffEmbedCodes(project.id),
        sql`
          DELETE FROM projects
          WHERE id = ${project.id}
        `
      ])
    }
  })
}

async function createProject(project: CreateProject) {
  try {
    const {
      contactInfo,
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
        contact_info,
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
        ${contactInfo}::jsonb[],
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
      type,
      contactInfo
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
        contact_info = ${contactInfo}::jsonb[],
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
 * Keeps the canonical, indexed `project_id` owner on
 * images/links/embed_codes in sync with a project's `*Ids` arrays. An
 * item can be listed by many projects but has one owner: the first
 * project to attach it. Newly attached ids are claimed only if
 * unowned; a project reusing another's item shows it (via its own
 * arrays) without taking it over. Newly detached ids this project owns
 * are handed off (see `handOffImages`).
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
      WHERE id = ANY(${images.attached}) AND project_id IS NULL
    `
  }
  if (images.detached.length) {
    await handOffImages(projectId, images.detached)
  }

  if (links.attached.length) {
    await sql`
      UPDATE links
      SET project_id = ${projectId}
      WHERE id = ANY(${links.attached}) AND project_id IS NULL
    `
  }
  if (links.detached.length) {
    await handOffLinks(projectId, links.detached)
  }

  if (embedCodes.attached.length) {
    await sql`
      UPDATE embed_codes
      SET project_id = ${projectId}
      WHERE id = ANY(${embedCodes.attached}) AND project_id IS NULL
    `
  }
  if (embedCodes.detached.length) {
    await handOffEmbedCodes(projectId, embedCodes.detached)
  }
}

/**
 * Hands images owned by `projectId` to the earliest-created other
 * project that still lists them (`image_ids` or `cover_image_id`), or
 * to NULL — the unassigned pool, which follows the current default
 * project — when none does. `ids` limits it to those images; omitted,
 * it hands off everything the project owns (before a delete, whose
 * `ON DELETE SET NULL` would otherwise skip the hand-off). Returns the
 * unawaited query so `deleteProject` can batch it into a transaction.
 */
function handOffImages(projectId: string, ids?: string[]) {
  return sql`
    UPDATE images AS i
    SET project_id = (
      SELECT p.id FROM projects AS p
      WHERE p.id <> ${projectId}
        AND (i.id = ANY(p.image_ids) OR p.cover_image_id = i.id)
      ORDER BY p.created_at, p.id
      LIMIT 1
    )
    WHERE i.project_id = ${projectId}
      AND (${ids ?? null}::uuid[] IS NULL OR i.id = ANY(${ids ?? null}::uuid[]))
  `
}

/** `handOffImages` for links, listed via `link_ids`. */
function handOffLinks(projectId: string, ids?: string[]) {
  return sql`
    UPDATE links AS l
    SET project_id = (
      SELECT p.id FROM projects AS p
      WHERE p.id <> ${projectId}
        AND l.id = ANY(p.link_ids)
      ORDER BY p.created_at, p.id
      LIMIT 1
    )
    WHERE l.project_id = ${projectId}
      AND (${ids ?? null}::uuid[] IS NULL OR l.id = ANY(${ids ?? null}::uuid[]))
  `
}

/**
 * `handOffImages` for embed codes, listed via `embed_code_ids` or
 * `featured_embed_code_id`.
 */
function handOffEmbedCodes(projectId: string, ids?: string[]) {
  return sql`
    UPDATE embed_codes AS ec
    SET project_id = (
      SELECT p.id FROM projects AS p
      WHERE p.id <> ${projectId}
        AND (
          ec.id = ANY(p.embed_code_ids)
          OR p.featured_embed_code_id = ec.id
        )
      ORDER BY p.created_at, p.id
      LIMIT 1
    )
    WHERE ec.project_id = ${projectId}
      AND (${ids ?? null}::uuid[] IS NULL OR ec.id = ANY(${ids ?? null}::uuid[]))
  `
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

/**
 * Pulls the repeatable `contactInfo[i].title` / `contactInfo[i].contact`
 * form fields out of the raw submission (mirroring the id resolvers,
 * which strip their own bracketed keys before validation) into a plain
 * `Contact[]`. Contacts carry no id, so every extracted group is a `new`
 * entry. Blank (including whitespace-only) values are dropped to
 * `undefined`. A fully blank row is discarded, so empty editor rows never
 * persist, but a labelled row with no `contact` throws — surfaced by
 * `runFormAction` as a form error rather than silently losing the label.
 *
 * Returns `undefined` when the submission has no `contactInfo` fields,
 * so partial updates leave stored contacts alone.
 */
function resolveContactInfo(
  data: Record<string, unknown>
): Contact[] | undefined {
  const isSubmitted = Object.keys(data).some((key) =>
    key.startsWith('contactInfo[')
  )
  if (!isSubmitted) return undefined

  const contacts: Contact[] = []
  for (const entry of extractIndexedGroups(data, 'contactInfo')) {
    const fields = entry.kind === 'new' ? entry.fields : {}
    const title = cleanContactField(fields.title)
    const contact = cleanContactField(fields.contact)
    if (!contact) {
      if (title) {
        throw new Error(
          `Contact "${title}" needs an email, phone, or link`
        )
      }
      continue
    }
    contacts.push({ title, contact })
  }
  return contacts
}

function cleanContactField(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== ''
    ? value
    : undefined
}

/**
 * Serializes a `Contact[]` for a Postgres `jsonb[]` column: each entry is
 * JSON-stringified so the `${...}::jsonb[]` cast parses it back to jsonb.
 * An empty/absent list is stored as NULL (reads back as `undefined`).
 */
function toContactInfoColumn(contactInfo?: Contact[]) {
  return contactInfo?.length
    ? contactInfo.map((contact) => JSON.stringify(contact))
    : null
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
    contactInfo: toContactInfoColumn(projectToSave.contactInfo),
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
