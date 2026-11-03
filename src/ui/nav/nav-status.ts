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

// an empty section is left out while its create form can't succeed
const canCreate: Partial<Record<NavPath, () => Promise<boolean>>> = {
  // a release's project is required and can't be created inline
  releases: async () =>
    (await fetchCachedProjectsFirstPage(true)).totalCount > 0
}

async function isCreatable(navPath: NavPath) {
  try {
    return (await canCreate[navPath]?.()) ?? true
  } catch (error) {
    // the ghost link is admin-only, so showing it is the safe side
    console.error(
      `Failed to check whether nav item ${navPath} can be created:`,
      error
    )
    return true
  }
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
  return (await isCreatable(navPath)) ? 'empty' : undefined
}
