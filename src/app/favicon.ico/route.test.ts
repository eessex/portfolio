/** @jest-environment node */
jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
jest.mock('@/lib/site-settings/cached', () => ({
  fetchCachedSiteSettings: jest.fn()
}))

import { GET } from '@/app/favicon.ico/route'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'

const mockSettings = jest.mocked(fetchCachedSiteSettings)
type Settings = Awaited<ReturnType<typeof fetchCachedSiteSettings>>
const request = new Request('https://site.example/favicon.ico')

describe('GET /favicon.ico', () => {
  it('redirects to the stored ICO', async () => {
    mockSettings.mockResolvedValue({
      iconImageId: 'c1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
      iconVersion: 1
    } as Settings)

    const res = await GET(request)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'https://test-bucket.s3.us-east-1.amazonaws.com/icons/c1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a/v1/favicon.ico'
    )
  })

  it('redirects to the default without one', async () => {
    mockSettings.mockResolvedValue(undefined)

    const res = await GET(request)

    expect(res.headers.get('location')).toBe(
      'https://site.example/default-icons/favicon.ico'
    )
  })
})
