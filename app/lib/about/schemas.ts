import {
  basePageSchema,
  defaultSchema,
  hydratedItemIdSchemas,
  shortText,
  uuid
} from '@/lib/scemas'
import { z } from 'zod'

/**
 * The about page, with contact info and other details.
 */
export const aboutContactSchema = z.object({ title: shortText.optional(), contact: shortText.optional() })

export const aboutSchema = defaultSchema.extend({
  contactInfo: z.array(aboutContactSchema).optional(),
  coverImageId: basePageSchema.shape.coverImageId,
  description: basePageSchema.shape.description,
  featuredEmbedCodeId: uuid.optional(),
  slug: basePageSchema.shape.slug
})

export const aboutClientSchema = aboutSchema.extend(
  hydratedItemIdSchemas.pick({
    coverImage: true,
    featuredEmbedCode: true
  }).shape
)
