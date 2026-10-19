jest.mock('next-auth', () => () => ({ auth: jest.fn() }))
jest.mock('@/auth.config', () => ({ authConfig: {} }))

import { config } from '@/proxy'

// Next compiles the matcher with path-to-regexp; for this single
// regex-group pattern an anchored RegExp matches the same paths.
const matcher = new RegExp(`^${config.matcher[0]}$`)

describe('proxy matcher', () => {
  it.each([
    '/',
    '/login',
    '/events/some-event',
    '/events/some-event/edit',
    '/releases/new',
    '/about/edit',
    '/dashboard/images'
  ])('runs auth on page route %s', (path) => {
    expect(matcher.test(path)).toBe(true)
  })

  it.each([
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.webmanifest',
    '/icon-192.png',
    '/apple-icon.png',
    '/globe.svg',
    '/api/session',
    '/_next/static/chunk.js'
  ])('skips static or api path %s', (path) => {
    expect(matcher.test(path)).toBe(false)
  })
})
