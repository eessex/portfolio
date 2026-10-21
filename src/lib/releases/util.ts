import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'

export const sortReleasesByCategory = (
  releases: ReleaseClient[],
  isProject: boolean
) => {
  const result: FetchReleasesResult = {
    albums: [],
    soundtracks: [],
    eps: [],
    singlesAndCompilations: [],
    collaborativeReleases: [],
    featuredOn: [],
    everythingElse: [],
    releases: [] // For project pages, pages where there's only a couple releases
  }

  const hasMultipleTypes =
    new Set(releases.map((r) => r.type)).size > 1

  if (isProject && !hasMultipleTypes) {
    result.releases = [...releases]
    return result
  }

  for (const release of releases) {
    switch (release.type) {
      case 'album':
        result.albums.push(release)
        break
      case 'single':
      case 'compilation':
        result.singlesAndCompilations.push(release)
        break
      case 'soundtrack':
        result.soundtracks.push(release)
        break
      case 'collaborativeRelease':
        result.collaborativeReleases.push(release)
        break
      case 'feature':
        result.featuredOn.push(release)
        break
      case 'ep':
        result.eps.push(release)
        break
      default:
        result.everythingElse.push(release)
    }
  }

  return result
}
