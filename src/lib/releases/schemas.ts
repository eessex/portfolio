import { z } from 'zod'

import { embedCodeSchema } from '@/lib/embed-codes/schemas/db'
import { imageSchema } from '@/lib/images/schemas/db'
import { linkSchema } from '@/lib/links/schemas/db'
import { projectSchema } from '@/lib/projects/schemas'
import { publishedEditionClientSchema } from '@/lib/published-editions/schemas/client'
import { PagePaths } from '@/lib/schemas'
import {
  contentFields,
  ownershipFields,
  relationFields,
  systemFields,
  taxonomyFields
} from '@/lib/schemas/fields'
import { date, shortText } from '@/lib/schemas/primitives'

export const releaseTypes = [
  'album',
  'ep',
  'soundtrack',
  'feature',
  'compilation',
  'collaborativeRelease',
  'single'
] as const
export const releaseTypeSchema = z.enum(releaseTypes)
export const ReleaseTypes = Object.fromEntries(
  releaseTypes.map((v) => [v, v])
) as {
  [K in (typeof releaseTypes)[number]]: K
}
export type ReleaseType = z.infer<typeof releaseTypeSchema>

/**
 * A music release, such as an album, EP, single, or soundtrack.
 */
export const releaseSchema = z.object({
  ...systemFields,
  ...taxonomyFields,
  ...ownershipFields,
  ...contentFields,
  artist: shortText.optional(),
  coverImageId: relationFields.coverImageId,
  embedCodeIds: relationFields.embedCodeIds,
  imageIds: relationFields.imageIds,
  linkIds: relationFields.linkIds,
  path: z.literal(PagePaths.releases),
  releaseDate: date,
  type: releaseTypeSchema
})

export const releaseClientSchema = releaseSchema.extend({
  coverImage: z.lazy(() => imageSchema).optional(),
  /** `artist`, else the project's name for rows saved without one */
  displayArtist: shortText.optional(),
  embedCodes: z.lazy(() => embedCodeSchema.array()).optional(),
  hasAudio: z.boolean().optional(),
  hasVideo: z.boolean().optional(),
  images: z.lazy(() => imageSchema.array()).optional(),
  links: z.lazy(() => linkSchema.array()).optional(),
  project: z.lazy(() => projectSchema).optional(),
  publishedEditions: z
    .lazy(() => publishedEditionClientSchema.array())
    .optional()
})

export const createReleaseSchema = releaseSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  // writes only: older rows may still have no project
  .extend({
    projectId: z
      .string({ required_error: 'Select a project.' })
      .uuid()
  })
