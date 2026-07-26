import {
  type CreateEmbedCode,
  type EmbedCode,
  EmbedCodeHosts,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'

export const createEmbedCodeFixture: CreateEmbedCode = {
  title: 'Test Embed Code',
  caption: 'This is an embed code for testing purposes.',
  type: EmbedCodeTypes.video,
  host: EmbedCodeHosts.youtube,
  src: 'https://www.youtube-nocookie.com/embed/mkveEuKy6B8?si=kgECvQiU_ZySMCC1&controls=0'
}

export const embedCodeFixture: EmbedCode = {
  ...createEmbedCodeFixture,
  createdAt: new Date('2024-01-01T12:00:00Z'),
  updatedAt: new Date(),
  id: '123e4567-e89b-12d3-a456-426614174000'
}
