import type { EventClient } from '@/lib/events/types'

export const eventFixtureUpcoming: EventClient = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  isUpcoming: true,
  startTime: new Date('2030-01-01'),
  path: 'events',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  slug: 'event-2',
  venueId: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Ultimate party: Madonna, Abba, Tina Turner'
}

export const eventFixturePast: EventClient = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  startTime: new Date('2020-01-01'),
  path: 'events',
  createdAt: new Date('2019-01-01'),
  updatedAt: new Date('2019-01-01'),
  slug: 'event-1',
  venueId: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Tina Turner, ABBA, Madonna',
  shortDescription: 'A test event for SEO metadata.'
}
