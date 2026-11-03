import { fetchCachedEventsFirstPage } from '@/lib/events/cached'
import {
  fetchCachedDefaultProject,
  fetchCachedProjectsFirstPage
} from '@/lib/projects/cached'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItems,
  type NavItemStatus,
  type NavPath
} from '@/ui/nav/nav-items'

// isAuthed is a cache key and filter here, not a session read
const hasContent: Record<
  NavPath,
  (isAuthed: boolean) => Promise<boolean>
> = {
  events: async (isAuthed) =>
    (await fetchCachedEventsFirstPage(isAuthed)).totalCount > 0,
  releases: async (isAuthed) =>
    (await fetchCachedReleasesFirstPage(isAuthed)).totalCount > 0,
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

async function navItemVisibility(
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

export async function Nav() {
  const [siteSettings, statuses] = await Promise.all([
    fetchCachedSiteSettings().catch((error) => {
      console.error('Failed to fetch site settings for nav:', error)
      return undefined
    }),
    Promise.all(
      navItems.map(({ navPath }) => navItemVisibility(navPath))
    )
  ])

  const items: NavItem[] = navItems.flatMap((item, i) => {
    const status = statuses[i]
    return status ? [{ ...item, status }] : []
  })

  return <NavClient title={siteSettings?.title} items={items} />
}
