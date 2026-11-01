import type { BeforeSendEvent } from '@vercel/analytics/next'

import { beforeSend } from './analytics'

const event = (path: string): BeforeSendEvent => ({
  type: 'pageview',
  url: `https://example.com${path}`
})

describe('beforeSend', () => {
  it.each([
    '/dashboard',
    '/dashboard/images',
    '/releases/new',
    '/events/some-event/edit',
    '/about/edit',
    '/login',
    '/invite',
    '/reset-password'
  ])('drops %s', (path) => {
    expect(beforeSend(event(path))).toBeNull()
  })

  it.each(['/', '/about', '/releases', '/events/some-event'])(
    'keeps %s',
    (path) => {
      expect(beforeSend(event(path))).toEqual(event(path))
    }
  )

  it('filters Speed Insights vitals the same way', () => {
    const vital = (path: string) => ({
      type: 'vital' as const,
      url: `https://example.com${path}`
    })
    expect(beforeSend(vital('/dashboard'))).toBeNull()
    expect(beforeSend(vital('/about'))).toEqual(vital('/about'))
  })
})
