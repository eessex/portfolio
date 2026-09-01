import type {
  CreateProject,
  Project,
  ProjectClient
} from '@/lib/projects/types'

export const projectFixtureBand: ProjectClient = {
  path: 'projects',
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Band 1',
  startDate: new Date('2025-01-01T00:00:00'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  slug: 'band-1',
  type: 'band',
  isPublished: true,
  shortDescription: 'A test band for SEO metadata.'
}

export const newProjectFixtureAlpha: CreateProject = {
  path: 'projects',
  title: 'Test Project',
  slug: 'test-project',
  type: 'band',
  isPublished: true,
  shortDescription: 'A test project.'
}

export const projectFixtureAlpha: Project = {
  ...newProjectFixtureAlpha,
  id: 'e6e1f1a5-7b1c-4d5e-8f6a-5b1e1f1a5c1d',
  createdAt: new Date('2025-01-01')
}
