import type {
  CreateEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/types'
import { embedCodeYoutubeFixture } from '@/ui/embed-codes/fixtures'

export const newEmbedCodeFixture: CreateEmbedCode = {
  title: 'Test Embed Code',
  iframe: embedCodeYoutubeFixture,
  caption: 'This is an embed code for testing purposes.',
  type: 'video',
  host: 'youtube',
  src: 'https://www.youtube-nocookie.com/embed/mkveEuKy6B8?si=kgECvQiU_ZySMCC1&controls=0',
  tagIds: []
}

export const embedCodeFixture: EmbedCode = {
  ...newEmbedCodeFixture,
  createdAt: new Date('2024-01-01T12:00:00Z'),
  updatedAt: new Date(),
  id: '123e4567-e89b-12d3-a456-426614174000'
}
