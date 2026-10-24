jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
jest.mock('@/lib/site-settings/cached', () => ({
  fetchCachedSiteSettings: jest.fn()
}))

import { generateMetadata } from '@/app/layout'
import { imageFixture } from '@/lib/images/fixtures'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'

const mockSettings = jest.mocked(fetchCachedSiteSettings)

describe('generateMetadata', () => {
  it.each([
    ['landscape', 1.5, { width: 1200, height: 800 }],
    ['portrait', 0.75, { width: 1200, height: 1600 }]
  ])(
    'reports a %s cover image at its true OG size',
    async (_, aspect, size) => {
      mockSettings.mockResolvedValue({
        title: 'Site',
        coverImage: { ...imageFixture, aspect }
      } as Awaited<ReturnType<typeof fetchCachedSiteSettings>>)

      const meta = await generateMetadata()

      expect(meta.openGraph?.images).toEqual([
        expect.objectContaining({ url: imageFixture.url, ...size })
      ])
    }
  )

  it('has no OG image without a cover image', async () => {
    mockSettings.mockResolvedValue(undefined)

    const meta = await generateMetadata()

    expect(meta.openGraph?.images).toEqual([])
  })
})
