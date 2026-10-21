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
  return saveProjectForm(formData, id, false)
}

/**
 * Saves the default project (rendered at `/about`) from `/about/edit`,
 * the only way to set `is_default_project`: a create flags the new
 * row, and updates keep the stored flag (`toDbRow`). The partial
 * unique index rejects a second default, returned as a form error.
 */
export async function editDefaultProject(
  formData: FormData,
  id?: string
) {
  return saveProjectForm(formData, id, true)
}

function saveProjectForm(
  formData: FormData,
  id: string | undefined,
  isDefaultProject: boolean
) {
  return runFormAction({
    formData,
    schema: createProjectSchema,
    itemType: 'projects',
    prepare: async (data) => {
      const { coverImageId, imageIds } =
        await resolveOrderedImageIds(data)
      const { linkIds } = await resolveOrderedLinkIds(data)
      const { embedCodeIds } = await resolveOrderedEmbedCodeIds(data)
      const contactInfo = resolveContactInfo(data)

      return {
        ...data,
        // never taken from the form: only `editDefaultProject` sets
        // it, and updates keep the stored value (`toDbRow`)
        isDefaultProject: isDefaultProject || undefined,
        // Omitted (not just undefined) when the editor wasn't submitted,
        // so a partial update keeps the existing contacts.
        ...(contactInfo && { contactInfo }),
        coverImageId,
        embedCodeIds,
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
    save: async (project) => {
      try {
        return id
          ? await updateProject(project, id)
          : await createProject(project)
      } catch (err) {
        if (isSecondDefaultError(err)) {
          throw new Error('A default project already exists')
        }
        throw err
      }
    }
  })
}

/** Creating a second default project trips the partial unique index. */
function isSecondDefaultError(err: unknown) {
  const cause = err instanceof Error ? err.cause : undefined
  return (
    (cause as { constraint?: string } | undefined)?.constraint ===
    'idx_projects_single_default'
  )
}

/**
 * Projects are embedded directly into their releases'/events' cached
 * fetches via build_project_json, so saving/deleting one must
 * invalidate those caches too, not just the projects list. Saving can
 * also create new images/links/embed codes inline (via the
 * `images`/`links`/`embedCodes` pickers' create-new flows), bypassing
 * `editImage`'s/`editLink`'s/`editEmbedCode`'s own cache invalidation,
 * and changes which projects list them (their `project_slugs`), so
 * those tags are invalidated here too.
 */
function invalidateProjectTags(id?: string) {
  updateTag('projects')
  updateTag('projects:authed')
  updateTag('projects:public')
  updateTag(slugCacheTag('projects'))
  updateTag('projects:default')
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
      // stored flag, not the client-sent one: /about depends on it
      const rows = await sql`
        SELECT is_default_project FROM projects
        WHERE id = ${project.id}
      `
      if (rows[0]?.is_default_project) {
        return {
          ok: false,
          message: 'The default project can’t be deleted.'
        }
      }
      await sql.transaction([
        ...ownedPageItemTables.map((table) =>
          handOffPageItems(table, project.id)
        ),
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
      imageIds,
      isDefaultProject,
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
        image_ids,
        is_default_project,
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
        ${imageIds},
        ${isDefaultProject},
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
    return formatDbResponseForClient(
      { ...row, path: 'projects' },
      projectSchema
    )
  } catch (cause) {
    throw new Error('Failed to update project.', { cause })
  }
}

// published editions follow their release's project
const ownedPageItemTables = ['releases', 'events'] as const

/**
 * Moves a project's releases/events to the default project before it's
 * deleted; their FKs' `ON DELETE SET NULL` would otherwise leave them
 * unowned.
 */
function handOffPageItems(
  table: (typeof ownedPageItemTables)[number],
  projectId: string
) {
  // code constant, not user input, so safe to inline
  return sql`
    UPDATE ${sql.unsafe(table)}
    SET project_id = (SELECT id FROM projects WHERE is_default_project)
    WHERE project_id = ${projectId}
  `
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
    imageIds: projectToSave.imageIds ?? null,
    // the stored flag wins: an update can neither set nor clear it, so
    // UPDATE doesn't write the column at all
    isDefaultProject:
      existing?.isDefaultProject ?? project.isDefaultProject ?? false,
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
