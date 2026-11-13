/** @jest-environment node */
import sharp, { type Color } from 'sharp'

import { sql } from '@/lib/db'
import {
  generateSiteIcons,
  tooSmallIconMessage
} from '@/lib/site-settings/icons'
import { ICON_VERSION } from '@/lib/site-settings/util'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
const mockSql = jest.mocked(sql)

const mockPut = jest.fn()
jest.mock('@/lib/storage', () => ({
  storageAdapter: () => ({
    provider: 's3',
    put: mockPut,
    publicUrl: (key: string) => `https://bucket.example/${key}`
  })
}))

const imageId = 'b3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a'

function solid(
  width: number,
  height: number,
  background: Color,
  channels: 3 | 4 = 3
) {
  return sharp({ create: { width, height, channels, background } })
}

function mockOriginal(bytes: Buffer) {
  mockSql.mockResolvedValueOnce([
    { id: imageId, url: 'https://old.example/x.png', format: 'png' }
  ] as never)
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    arrayBuffer: async () => bytes
  } as unknown as Response)
}

function written(file: string): Buffer {
  const call = mockPut.mock.calls.find(
    ([key]) => key === `icons/${imageId}/v${ICON_VERSION}/${file}`
  )
  expect(call).toBeDefined()
  return call![1]
}

describe('generateSiteIcons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('reads the original from storage and writes all five files', async () => {
    mockOriginal(await solid(600, 600, '#f00').png().toBuffer())

    await generateSiteIcons(imageId)

    expect(fetch).toHaveBeenCalledWith(
      `https://bucket.example/images/${imageId}.png`
    )
    expect(
      mockPut.mock.calls.map(([key, , type]) => [key, type])
    ).toEqual(
      [
        ['favicon.ico', 'image/x-icon'],
        ['icon-32.png', 'image/png'],
        ['icon-192.png', 'image/png'],
        ['icon-512.png', 'image/png'],
        ['apple-touch-icon.png', 'image/png']
      ].map(([file, type]) => [
        `icons/${imageId}/v${ICON_VERSION}/${file}`,
        type
      ])
    )
  })

  it('center-crops a non-square image', async () => {
    // red edges around a centered green square
    const green = await solid(600, 600, '#0f0').png().toBuffer()
    mockOriginal(
      await solid(1200, 600, '#f00')
        .composite([{ input: green, left: 300, top: 0 }])
        .png()
        .toBuffer()
    )

    await generateSiteIcons(imageId)

    const icon = written('icon-512.png')
    expect(await sharp(icon).metadata()).toMatchObject({
      width: 512,
      height: 512
    })
    const { data } = await sharp(icon)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    // the top-left pixel is the crop's green, not the red edge
    // (give or take resampling)
    const [r, g] = data
    expect(r).toBeLessThan(16)
    expect(g).toBeGreaterThan(240)
  })

  it('refuses an image under the upload minimum, writing nothing', async () => {
    mockOriginal(await solid(400, 400, '#f00').png().toBuffer())

    await expect(generateSiteIcons(imageId)).rejects.toThrow(
      tooSmallIconMessage
    )
    expect(mockPut).not.toHaveBeenCalled()
  })

  it('rasterizes a small-viewBox SVG at full size, not upscaled', async () => {
    // left half filled, so a blurred upscale would soften the edge
    mockOriginal(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="12" height="24"/></svg>'
      )
    )

    await generateSiteIcons(imageId)

    const { data, info } = await sharp(written('icon-512.png'))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    expect(info.width).toBe(512)
    const alphaAt = (x: number) => data[x * info.channels + 3]
    expect(alphaAt(253)).toBe(255)
    expect(alphaAt(258)).toBe(0)
  })

  it('flattens the Apple touch icon onto white', async () => {
    mockOriginal(
      await solid(600, 600, { r: 0, g: 0, b: 0, alpha: 0 }, 4)
        .png()
        .toBuffer()
    )

    await generateSiteIcons(imageId)

    const icon = written('apple-touch-icon.png')
    const metadata = await sharp(icon).metadata()
    expect(metadata).toMatchObject({
      width: 180,
      height: 180,
      hasAlpha: false
    })
    const { data } = await sharp(icon).raw().toBuffer({
      resolveWithObject: true
    })
    expect([...data.subarray(0, 3)]).toEqual([255, 255, 255])
  })

  it('packs 16, 32 and 48px PNGs into the ICO', async () => {
    mockOriginal(await solid(600, 600, '#f00').png().toBuffer())

    await generateSiteIcons(imageId)

    const ico = written('favicon.ico')
    expect(ico.readUInt16LE(2)).toBe(1)
    const count = ico.readUInt16LE(4)
    const entries = Array.from({ length: count }, (_, i) => {
      const at = 6 + 16 * i
      return {
        size: ico.readUInt8(at),
        length: ico.readUInt32LE(at + 8),
        offset: ico.readUInt32LE(at + 12)
      }
    })
    expect(entries.map(({ size }) => size)).toEqual([16, 32, 48])
    for (const { size, length, offset } of entries) {
      const png = ico.subarray(offset, offset + length)
      expect(await sharp(png).metadata()).toMatchObject({
        format: 'png',
        width: size,
        height: size
      })
    }
  })

  it('logs and rethrows a failure', async () => {
    mockSql.mockResolvedValueOnce([] as never)

    await expect(generateSiteIcons(imageId)).rejects.toThrow(
      'The site icon image was not found'
    )
    expect(console.error).toHaveBeenCalledWith(
      `Failed to generate site icons for ${imageId}:`,
      expect.any(Error)
    )
  })
})
