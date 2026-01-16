import type {
  CreateImage,
  Image
} from '@/lib/images/types'

export const newImageFixture: CreateImage = {
  aspect: 1.7777,
  caption: 'This is a new image for testing purposes.',
  tagIds: [],
  title: 'Test Embed Code',
  url: 'https://example.com/image.jpg'
}

export const imageFixture: Image = {
  ...newImageFixture,
  createdAt: new Date('2024-01-01T12:00:00Z'),
  updatedAt: new Date(),
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
}
