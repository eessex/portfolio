import { z } from 'zod'

export const EmbedCodeSchema = z.object({
  caption: z.string().max(255).optional(),
  id: z.string().uuid().optional(),
  iframe: z.string().min(1).max(10000),
})

export const ImageSchema = z.object({
  alt: z.string().max(255).optional(),
  aspect: z.number().min(0.1).max(10),
  caption: z.string().max(255).optional(),
  id: z.string().uuid().optional(),
  isPress: z.boolean().optional(),
  url: z.string().url()
})

export const LinkSchema = z.object({
  attribution: z.string().max(255).optional(),
  id: z.string().uuid().optional(),
  isPress: z.boolean().optional(),
  isSocialProfile: z.boolean().optional(),
  publishedDate: z.string().datetime().optional(),
  title: z.string().max(255).optional(),
  url: z.string().url(),
})
