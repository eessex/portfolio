import type { z } from 'zod'

import type { releaseClientSchema, releaseSchema } from '@/lib/releases/schemas'

export type Release = z.infer<typeof releaseSchema>
export type ReleaseClient = z.infer<typeof releaseClientSchema>

export interface FetchReleasesResult {
  soloReleases: ReleaseClient[]
  singles: ReleaseClient[]
  compilations: ReleaseClient[]
  collaborativeReleases: ReleaseClient[]
  featuredOn: ReleaseClient[]
}
