import type {
  CreateVenue,
  Venue
} from '@/lib/venues/types'

export const newVenueFixture: CreateVenue = {
  name: 'Test Venue Texas',
  address: '123 Main St',
  city: 'Austin',
  state: 'TX',
  country: 'USA',
  url: 'https://testvenue-texas.com'
}

export const venueFixture: Venue = {
  ...newVenueFixture,
  id: 'b3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  createdAt: new Date()
}
