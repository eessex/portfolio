import {
  type CreateEmbedCode,
  type EmbedCode,
  EmbedCodeHosts,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { embedCodeYoutubeFixture } from '@/ui/embed-codes/fixtures'

export const createEmbedCodeFixture: CreateEmbedCode = {
  title: 'Test Embed Code',
  iframe: embedCodeYoutubeFixture,
  caption: 'This is an embed code for testing purposes.',
  type: EmbedCodeTypes.video,
  host: EmbedCodeHosts.youtube,
  src: 'https://www.youtube-nocookie.com/embed/mkveEuKy6B8?si=kgECvQiU_ZySMCC1&controls=0'
}

export const embedCodeFixture: EmbedCode = {
  ...createEmbedCodeFixture,
  coverImageId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  updatedAt: new Date(),
  id: '123e4567-e89b-12d3-a456-426614174000'
}
