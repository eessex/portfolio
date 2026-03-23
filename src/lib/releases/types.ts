import type { z } from 'zod'

import type {
  releaseClientSchema,
  releaseSchema
} from '@/lib/releases/schemas'

export type Release = z.infer<typeof releaseSchema>
export type ReleaseClient = z.infer<typeof releaseClientSchema>

export interface FetchReleasesResult {
  albums: ReleaseClient[]
  eps: ReleaseClient[]
  soundtracks: ReleaseClient[]
  singlesAndCompilations: ReleaseClient[]
  collaborativeReleases: ReleaseClient[]
  featuredOn: ReleaseClient[]
  everythingElse: ReleaseClient[]
  releases: ReleaseClient[] // For project pages, pages where there's only a couple releases
}
