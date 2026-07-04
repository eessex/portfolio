import type { CreateLink, Link } from '@/lib/links/schemas/db'

export const newLinkFixture: CreateLink = {
  url: 'https://testlink.com',
  title: 'Test Link'
}

export const newPressLinkFixture: CreateLink = {
  url: 'https://testpresslink.com',
  title: 'Test Press Link',
  attribution: 'Test Attribution',
  publishDate: new Date(),
  type: 'press',
  quotation: 'Test Quotation'
}

export const linkFixture: Link = {
  ...newLinkFixture,
  id: 'a3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  createdAt: new Date()
}

export const pressLinkFixture: Link = {
  ...newPressLinkFixture,
  id: 'b3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8b',
  createdAt: new Date()
}
