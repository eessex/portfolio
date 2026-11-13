import { isCreatable } from '@/lib/creatable'
import { fetchCachedEventsFirstPage } from '@/lib/events/cached'
import {
  fetchCachedDefaultProject,
  fetchCachedProjectsFirstPage
} from '@/lib/projects/cached'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import type { NavItemStatus, NavPath } from '@/ui/nav/nav-items'

// isAuthed is a cache key and filter here, not a session read
const hasContent: Record<
  NavPath,
  (isAuthed: boolean) => Promise<boolean>
> = {
  events: async (isAuthed) =>
    (await fetchCachedEventsFirstPage(isAuthed)).totalCount > 0,
  releases: async (isAuthed) =>
    (await fetchCachedReleasesFirstPage(isAuthed)).totalCount > 0,
  // the default project is About's, not a project to list
  projects: async (isAuthed) =>
    (await fetchCachedProjectsFirstPage(isAuthed, true)).totalCount >
    0,
  about: async (isAuthed) =>
    !!(await fetchCachedDefaultProject(isAuthed))
}

/** Undefined: left out of the menu, even for admins */
export async function fetchNavItemStatus(
  navPath: NavPath
): Promise<NavItemStatus | undefined> {
  try {
    if (await hasContent[navPath](false)) return 'published'
    if (await hasContent[navPath](true)) return 'drafts'
  } catch (error) {
    // admin-only, not a public link to a possibly empty page; caught
    // since a throw takes down every page
    console.error(`Failed to check nav item ${navPath}:`, error)
    return 'empty'
  }
  // an empty section is left out while its create form can't succeed
  return (await isCreatable(navPath)) ? 'empty' : undefined
}
