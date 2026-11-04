import { fetchCachedProjectsFirstPage } from '@/lib/projects/cached'
import type { NavPath } from '@/lib/site-settings/nav-paths'

// sections whose create form needs existing content first
const canCreate: Partial<Record<NavPath, () => Promise<boolean>>> = {
  // a release's project is required and can't be created inline
  releases: async () =>
    (await fetchCachedProjectsFirstPage(true)).totalCount > 0
}

/** Whether a section's create form can succeed; true on error */
export async function isCreatable(path: NavPath) {
  try {
    return (await canCreate[path]?.()) ?? true
  } catch (error) {
    // create links are admin-only, so showing them is the safe side
    console.error(
      `Failed to check whether ${path} can be created:`,
      error
    )
    return true
  }
}
