import { sql } from '@vercel/postgres'

import { projectClientSchema } from '@/lib/projects/schemas'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import type { pagePathTypes } from '@/lib/schemas'
import { formatDbResponseForClient } from '@/ui/util'

const path: typeof pagePathTypes[number] = 'projects'
const projectPathType = 'project'

export async function fetchProjects (isAuthed: boolean = false): Promise<FetchProjectsResult> {
  try {
    const data = await sql<ProjectClient>`
      SELECT
        p.*,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(p.cover_image_id, p.image_ids[1])
        ) AS cover_image
      FROM projects as p
      WHERE ${isAuthed} OR p.is_published = true
      ORDER BY
        (p.end_date IS NOT NULL),
        p.start_date DESC
    ;`
    const parsedProjects = data.rows.map(p => formatDbResponseForClient({
      ...p,
      path
    }, projectClientSchema))
    return { allProjects: parsedProjects }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch ${path}.`)
  }
}

export async function fetchProjectBySlug (slug: string, isAuthed: boolean = false): Promise<ProjectClient | undefined> {
  try {
    const data = await sql<ProjectClient>`
      SELECT
        p.*,
        (
          SELECT build_image_json(i)
          FROM images i
          WHERE i.id = COALESCE(p.cover_image_id, p.image_ids[1])
        ) AS cover_image
      FROM projects as p
      WHERE p.slug = ${slug}
        AND (${isAuthed} OR p.is_published = true)
      LIMIT 1
    ;`
    if (data.rows.length === 0) {
      return undefined
    }
    const project = formatDbResponseForClient({
      ...data.rows[0],
      path
    }, projectClientSchema)
    return project
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(`Failed to fetch ${projectPathType}.`)
  }
}
