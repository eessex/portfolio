import type {
  CreateRelease,
  Release,
  ReleaseClient
} from '@/lib/releases/types'

export const newReleaseFixtureAlpha: CreateRelease = {
  path: 'releases',
  title: 'Test Release',
  slug: 'test-release',
  type: 'album',
  releaseDate: new Date('2025-01-01'),
  artist: 'Test Artist',
  isPublished: true,
  projectId: 'c3c3c3c3-3333-4333-8333-c3c3c3c3c3c3',
  shortDescription: 'A test release.'
}

export const releaseFixtureAlpha: Release = {
  ...newReleaseFixtureAlpha,
  id: 'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2',
  createdAt: new Date('2025-01-01')
}

export const releaseFixtureAlbum: ReleaseClient = {
  path: 'releases',
  id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'album',
  title: 'Test Album',
  slug: 'test-album',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  releaseDate: new Date('2025-01-01'),
  artist: 'Test Artist Album',
  shortDescription: 'A test album for SEO metadata.',
  isPublished: true
}

export const releaseFixtureSingle: ReleaseClient = {
  path: 'releases',
  id: '550e8400-e29b-41d4-a716-446655440001',
  type: 'single',
  title: 'Test Single',
  slug: 'test-single',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  releaseDate: new Date('2026-01-01'),
  artist: 'Test Artist Single',
  isPublished: true
}
