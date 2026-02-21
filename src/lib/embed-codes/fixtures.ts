import type {
  CreateEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/types'

export const newEmbedCodeFixture: CreateEmbedCode = {
  title: 'Test Embed Code',
  iframe: '<iframe src="https://example.com/embed"></iframe>',
  caption: 'This is an embed code for testing purposes.',
  type: 'video',
  tagIds: []
}

export const embedCodeFixture: EmbedCode = {
  ...newEmbedCodeFixture,
  createdAt: new Date('2024-01-01T12:00:00Z'),
  updatedAt: new Date(),
  id: '123e4567-e89b-12d3-a456-426614174000'
}
