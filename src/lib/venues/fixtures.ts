import type { CreateVenue, Venue } from '@/lib/venues/types'

export const newVenueFixtureAlpha: CreateVenue = {
  name: 'Test Venue Texas',
  address: '123 Main St',
  city: 'Austin',
  state: 'TX',
  country: 'USA',
  url: 'https://testvenue-texas.com'
}

export const venueFixtureAlpha: Venue = {
  ...newVenueFixtureAlpha,
  id: 'b3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  createdAt: new Date()
}

export const newVenueFixtureBeta: CreateVenue = {
  name: 'Test Venue New York',
  address: '321 Broadway',
  city: 'New York',
  state: 'NY',
  country: 'USA',
  url: 'https://testvenue-newyork.com'
}

export const venueFixtureBeta: Venue = {
  ...newVenueFixtureBeta,
  id: 'c4c9d9f3-5g9b-5d3b-0f3b-3g9c9d9f3g9ba',
  createdAt: new Date()
}

export const newVenueFixtureGamma: CreateVenue = {
  name: 'Test Venue Chicago',
  address: '456 Lake St',
  city: 'Chicago',
  state: 'IL',
  country: 'USA',
  url: 'https://testvenue-chicago.com'
}

export const venueFixtureGamma: Venue = {
  ...newVenueFixtureGamma,
  id: 'd5d0e0g4-6h0c-6e4c-1g4c-4h0d0e0g4h0cb',
  createdAt: new Date()
}
