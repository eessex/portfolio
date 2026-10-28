import { cacheTag } from 'next/cache'

import {
  fetchDefaultProject,
  fetchProjectById,
  type FetchProjectsOptions,
  fetchProjectsRaw
} from '@/lib/projects/data'

/** The first page is cached; later pages and searches aren't. */
export async function fetchProjects(
  isAuthed: boolean = false,
  cursor?: string,
  query?: string,
  { isDefaultExcluded = false }: FetchProjectsOptions = {}
) {
  if (!cursor && !query) {
    return fetchCachedProjectsFirstPage(isAuthed, isDefaultExcluded)
  }

  return fetchProjectsRaw(isAuthed, cursor, query, {
    isDefaultExcluded
  })
}

export async function fetchCachedProjectsFirstPage(
  isAuthed: boolean,
  isDefaultExcluded: boolean = false
) {
  'use cache'
  cacheTag('projects')

  return await fetchProjectsRaw(isAuthed, undefined, undefined, {
    isDefaultExcluded
  })
}

export async function fetchCachedProjectById(
  id: string,
  isAuthed: boolean = false
) {
  'use cache'
  cacheTag('projects') // embedded-item actions invalidate this
  cacheTag(`project:${id}`)

  return fetchProjectById(id, isAuthed)
}

export async function fetchCachedDefaultProject(
  isAuthed: boolean = false
) {
  'use cache'
  cacheTag('projects') // embedded-item actions invalidate this

  const project = await fetchDefaultProject(isAuthed)
  if (project) cacheTag(`project:${project.id}`)
  return project
}
