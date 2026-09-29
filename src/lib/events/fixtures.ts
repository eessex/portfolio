import type {
  CreateEvent,
  Event,
  EventClient
} from '@/lib/events/types'
import { venueFixtureAlpha } from '@/lib/venues/fixtures'

export const newEventFixtureAlpha: CreateEvent = {
  path: 'events',
  title: 'Test Event',
  slug: 'test-event',
  venueId: venueFixtureAlpha.id,
  startTime: new Date('2030-01-01T20:00:00'),
  isPublished: true,
  shortDescription: 'A test event.'
}

export const eventFixtureAlpha: Event = {
  ...newEventFixtureAlpha,
  id: 'a1a1a1a1-1111-4111-8111-a1a1a1a1a1a1',
  createdAt: new Date('2025-01-01')
}

export const eventFixtureUpcoming: EventClient = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  isUpcoming: true,
  startTime: new Date('2030-01-01'),
  path: 'events',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  slug: 'event-2',
  venueId: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Ultimate party: Madonna, Abba, Tina Turner',
  isPublished: true,
  venue: venueFixtureAlpha
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
  shortDescription: 'A test event for SEO metadata.',
  isPublished: true,
  venue: venueFixtureAlpha
}
