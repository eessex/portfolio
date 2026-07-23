import type {
  CreatePublisher,
  Publisher
} from '@/lib/publishers/schemas/db'

export const newPublisherFixtureAlpha: CreatePublisher = {
  name: 'Soap Library',
  url: 'https://soaplibrary.example.com',
  type: 'recordLabel'
}

export const publisherFixtureAlpha: Publisher = {
  ...newPublisherFixtureAlpha,
  id: '11111111-1111-4111-8111-111111111111',
  createdAt: new Date()
}

export const newPublisherFixtureBeta: CreatePublisher = {
  name: 'RVNG',
  type: 'recordLabel'
}

export const publisherFixtureBeta: Publisher = {
  ...newPublisherFixtureBeta,
  id: '22222222-2222-4222-8222-222222222222',
  createdAt: new Date()
}

export const newPublisherFixtureGamma: CreatePublisher = {
  name: 'PAN',
  type: 'recordLabel'
}

export const publisherFixtureGamma: Publisher = {
  ...newPublisherFixtureGamma,
  id: '33333333-3333-4333-8333-333333333333',
  createdAt: new Date()
}
