'use cache'

import { cacheTag } from 'next/cache'

import {
  fetchDefaultProject,
  fetchProjectById,
  fetchProjectsRaw
} from '@/lib/projects/data'

export async function fetchCachedProjectsFirstPage(
  isAuthed: boolean,
  isDefaultExcluded: boolean = false
) {
  cacheTag('projects')
  cacheTag(`projects:${isAuthed ? 'authed' : 'public'}`)

  return await fetchProjectsRaw(isAuthed, undefined, undefined, {
    isDefaultExcluded
  })
}

export async function fetchCachedProjectById(
  id: string,
  isAuthed: boolean = false
) {
  cacheTag('projects') // embedded-item actions invalidate this
  cacheTag(`projects:${isAuthed ? 'authed' : 'public'}`)
  cacheTag(`project:${id}`)

  return fetchProjectById(id, isAuthed)
}

export async function fetchCachedDefaultProject(
  isAuthed: boolean = false
) {
  cacheTag('projects') // embedded-item actions invalidate this
  cacheTag(`projects:${isAuthed ? 'authed' : 'public'}`)
  cacheTag('projects:default')

  const project = await fetchDefaultProject(isAuthed)
  if (project) cacheTag(`project:${project.id}`)
  return project
}
