jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
jest.mock('@/lib/site-settings/cached', () => ({
  fetchCachedSiteSettings: jest.fn()
}))

import manifest from '@/app/manifest'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'

const mockSettings = jest.mocked(fetchCachedSiteSettings)
type Settings = Awaited<ReturnType<typeof fetchCachedSiteSettings>>

describe('manifest', () => {
  it('names the site and lists the stored 192 and 512px icons', async () => {
    mockSettings.mockResolvedValue({
      title: 'Band',
      iconImageId: 'c1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
      iconVersion: 1
    } as Settings)

    const res = await manifest()

    expect(res.name).toBe('Band')
    expect(res.icons?.map(({ src, sizes }) => [src, sizes])).toEqual([
      [
        'https://test-bucket.s3.us-east-1.amazonaws.com/icons/c1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a/v1/icon-192.png',
        '192x192'
      ],
      [
        'https://test-bucket.s3.us-east-1.amazonaws.com/icons/c1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a/v1/icon-512.png',
        '512x512'
      ]
    ])
  })

  it('lists the default icons without one', async () => {
    mockSettings.mockResolvedValue(undefined)

    const res = await manifest()

    expect(res.icons?.map(({ src }) => src)).toEqual([
      '/default-icons/icon-192.png',
      '/default-icons/icon-512.png'
    ])
  })
})
