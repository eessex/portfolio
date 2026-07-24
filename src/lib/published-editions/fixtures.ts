import type {
  CreatePublishedEdition,
  PublishedEdition
} from '@/lib/published-editions/schemas/db'

export const newPublishedEditionFixtureAlpha: CreatePublishedEdition =
  {
    publisherName: 'Soap Library',
    catalogNumber: 'SL021',
    format: 'LP',
    publishDate: new Date('2020-01-01'),
    releaseId: 'a3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a'
  }

export const publishedEditionFixtureAlpha: PublishedEdition = {
  ...newPublishedEditionFixtureAlpha,
  id: 'b3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  createdAt: new Date()
}

export const newPublishedEditionFixtureBeta: CreatePublishedEdition =
  {
    publisherName: 'RVNG',
    format: 'Cassette',
    publishDate: new Date('2021-06-15'),
    releaseId: 'c4c9d9f3-5g9b-5d3b-0f3b-3g9c9d9f3g9ba'
  }

export const publishedEditionFixtureBeta: PublishedEdition = {
  ...newPublishedEditionFixtureBeta,
  id: 'd5d0e0g4-6h0c-6e4c-1g4c-4h0d0e0g4h0cb',
  createdAt: new Date()
}

export const newPublishedEditionFixtureGamma: CreatePublishedEdition =
  {
    publisherName: 'PAN',
    format: 'Digital',
    publishDate: new Date('2022-03-20'),
    releaseId: 'e6e1f1h5-7i1d-7f5d-2h5d-5i1e1f1h5i1dc'
  }

export const publishedEditionFixtureGamma: PublishedEdition = {
  ...newPublishedEditionFixtureGamma,
  id: 'f7f2g2i6-8j2e-8g6e-3i6e-6j2f2g2i6j2ed',
  createdAt: new Date()
}
