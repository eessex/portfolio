/** @jest-environment node */
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fetchMock from 'jest-fetch-mock'
import sharp from 'sharp'

import { uploadFile } from '@/lib/images/s3'

jest.mock('@/lib/images/s3-client', () => ({ s3: {} }))
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(
    async (_client: unknown, command: { input: { Key: string } }) =>
      `https://bucket.s3.amazonaws.com/${command.input.Key}?sig=1`
  )
}))

const mockGetSignedUrl = jest.mocked(getSignedUrl)

async function imageFile(
  format: 'jpeg' | 'png' | 'tiff',
  name: string,
  type = 'image/jpeg',
  { width = 800, height = 600 } = {}
) {
  const bytes = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: '#000'
    }
  })
    .toFormat(format)
    .toBuffer()
  return new File([new Uint8Array(bytes)], name, { type })
}

function uploadedContentType() {
  const [, init] = fetchMock.mock.calls[0]!
  return (init?.headers as Record<string, string>)['Content-Type']
}

describe('uploadFile', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    mockGetSignedUrl.mockClear()
  })

  it('stores same-named files under different keys', async () => {
    const first = await uploadFile(
      await imageFile('jpeg', 'IMG_0001.JPG')
    )
    const second = await uploadFile(
      await imageFile('jpeg', 'IMG_0001.JPG')
    )

    expect(first).toMatch(/\/images\/[0-9a-f-]{36}\.jpg$/)
    expect(second).toMatch(/\/images\/[0-9a-f-]{36}\.jpg$/)
    expect(first).not.toBe(second)
  })

  it('takes the extension and Content-Type from the bytes, not the name or MIME type', async () => {
    const url = await uploadFile(
      await imageFile('png', 'photo.jpg', 'image/jpeg')
    )

    expect(url).toMatch(/\/images\/[0-9a-f-]{36}\.png$/)
    expect(uploadedContentType()).toBe('image/png')
  })

  it('refuses an unsupported format without uploading', async () => {
    await expect(
      uploadFile(await imageFile('tiff', 'scan.jpg'))
    ).rejects.toThrow('Unsupported image format (tiff)')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('refuses a file that is not an image', async () => {
    const file = new File(['not an image'], 'fake.jpg', {
      type: 'image/jpeg'
    })

    await expect(uploadFile(file)).rejects.toThrow(
      'File is not a readable image'
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('refuses a short edge under 600 px without uploading', async () => {
    await expect(
      uploadFile(
        await imageFile('jpeg', 'thumb.jpg', 'image/jpeg', {
          width: 1200,
          height: 599
        })
      )
    ).rejects.toThrow('"thumb.jpg" is too small')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('accepts a 600 px short edge', async () => {
    const url = await uploadFile(
      await imageFile('jpeg', 'portrait.jpg', 'image/jpeg', {
        width: 600,
        height: 900
      })
    )
    expect(url).toMatch(/\.jpg$/)
  })
})
