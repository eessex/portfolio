import type { ReleaseClient } from '@/lib/releases/types'

export const releaseFixtureAlbum: ReleaseClient = {
  path: 'releases',
  id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'album',
  title: 'Test Album',
  slug: 'test-album',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  releaseDate: new Date('2025-01-01'),
  artist: 'Test Artist Album'
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
  artist: 'Test Artist Single'
}
