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

  describe('icons', () => {
    const iconImageId = 'c1b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a'
    const settings = (icon: object) =>
      ({ title: 'Site', ...icon }) as Awaited<
        ReturnType<typeof fetchCachedSiteSettings>
      >

    it('links the stored icons when one is set', async () => {
      mockSettings.mockResolvedValue(
        settings({ iconImageId, iconVersion: 2 })
      )

      const { icons } = await generateMetadata()

      expect(icons).toEqual({
        icon: [
          {
            url: `https://test-bucket.s3.us-east-1.amazonaws.com/icons/${iconImageId}/v2/icon-32.png`,
            type: 'image/png',
            sizes: '32x32'
          }
        ],
        apple: [
          {
            url: `https://test-bucket.s3.us-east-1.amazonaws.com/icons/${iconImageId}/v2/apple-touch-icon.png`,
            sizes: '180x180'
          }
        ]
      })
    })

    it.each([
      ['no icon', {}],
      ['a deleted icon image', { iconVersion: 1 }]
    ])('links the defaults for %s', async (_, icon) => {
      mockSettings.mockResolvedValue(settings(icon))

      const { icons } = await generateMetadata()

      expect(icons).toEqual({
        icon: [
          expect.objectContaining({
            url: '/default-icons/icon-32.png'
          })
        ],
        apple: [
          expect.objectContaining({
            url: '/default-icons/apple-touch-icon.png'
          })
        ]
      })
    })

    it('adds no manifest field, which manifest.ts links', async () => {
      mockSettings.mockResolvedValue(undefined)

      expect(await generateMetadata()).not.toHaveProperty('manifest')
    })
  })
})
