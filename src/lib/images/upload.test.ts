/** @jest-environment node */
import sharp from 'sharp'

import { deleteImageFile, uploadFile } from '@/lib/images/upload'
import { VARIANT_VERSION, VARIANT_WIDTHS } from '@/lib/images/util'

jest.mock('@/lib/images/util', () => ({
  ...jest.requireActual('@/lib/images/util'),
  // small enough to exceed with a few test frames
  MAX_ANIMATION_PIXELS: 2_000_000
}))

const mockPut = jest.fn()
const mockDelete = jest.fn()
jest.mock('@/lib/storage', () => ({
  storageAdapter: () => ({
    provider: 's3',
    put: mockPut,
    delete: mockDelete,
    publicUrl: (key: string) => `https://bucket.example/${key}`
  })
}))

const originalEnv = process.env
beforeEach(() => {
  process.env = {
    ...originalEnv,
    STORAGE_PROVIDER: 's3',
    AWS_S3_BUCKET_NAME: 'bucket',
    AWS_S3_REGION: 'us-east-1',
    REMOTE_IMAGE_HOSTNAME: ''
  }
})
afterEach(() => {
  process.env = originalEnv
})

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

describe('uploadFile', () => {
  beforeEach(() => {
    mockPut.mockReset()
  })

  it('issues an id and stores the original at images/{id}.{ext}', async () => {
    const res = await uploadFile(
      await imageFile('jpeg', 'IMG_0001.JPG')
    )

    expect(res.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(mockPut).toHaveBeenCalledWith(
      `images/${res.id}.jpg`,
      expect.any(Buffer),
      'image/jpeg'
    )
    expect(res).toEqual({
      id: res.id,
      format: 'jpeg',
      width: 800,
      height: 600,
      originalFilename: 'IMG_0001.JPG',
      contentHash: expect.stringMatching(/^[0-9a-f]{64}$/),
      url: `https://bucket.example/images/${res.id}.jpg`,
      blurDataUrl: expect.stringMatching(/^data:image\/webp;base64,/),
      variantVersion: VARIANT_VERSION
    })
  })

  it('writes every variant width as WebP, never wider than the original', async () => {
    const res = await uploadFile(
      await imageFile('jpeg', 'IMG_0001.JPG')
    )

    for (const width of VARIANT_WIDTHS) {
      const call = mockPut.mock.calls.find(
        ([key]) =>
          key === `images/${res.id}_v${VARIANT_VERSION}_${width}.webp`
      )
      expect(call?.[2]).toBe('image/webp')
      const meta = await sharp(call?.[1] as Buffer).metadata()
      expect(meta.format).toBe('webp')
      expect(meta.width).toBe(Math.min(width, 800))
    }
  })

  it('keeps an animated GIF animated in every variant', async () => {
    const frame = (background: string) =>
      sharp({
        create: { width: 800, height: 600, channels: 3, background }
      })
        .png()
        .toBuffer()
    const bytes = await sharp(
      [await frame('#000'), await frame('#fff')],
      { join: { animated: true } }
    )
      .gif()
      .toBuffer()
    const res = await uploadFile(
      new File([new Uint8Array(bytes)], 'loop.gif', {
        type: 'image/gif'
      })
    )

    expect(res).toMatchObject({
      format: 'gif',
      width: 800,
      height: 600
    })
    for (const width of VARIANT_WIDTHS) {
      const call = mockPut.mock.calls.find(
        ([key]) =>
          key === `images/${res.id}_v${VARIANT_VERSION}_${width}.webp`
      )
      const meta = await sharp(call?.[1] as Buffer, {
        animated: true
      }).metadata()
      expect(meta.pages).toBe(2)
    }
  })

  it('refuses an animation whose frames together are too many pixels', async () => {
    // distinct, or the encoder merges them
    const frames = await Promise.all(
      ['#000', '#333', '#666', '#999', '#ccc'].map((background) =>
        sharp({
          create: { width: 800, height: 600, channels: 3, background }
        })
          .png()
          .toBuffer()
      )
    )
    const bytes = await sharp(frames, { join: { animated: true } })
      .gif()
      .toBuffer()

    await expect(
      uploadFile(
        new File([new Uint8Array(bytes)], 'long.gif', {
          type: 'image/gif'
        })
      )
    ).rejects.toThrow('"long.gif" has too many frames')
    expect(mockPut).not.toHaveBeenCalled()
  })

  it('saves without variants when writing them fails', async () => {
    mockPut.mockImplementation(async (key: string) => {
      if (key.endsWith('.webp')) throw new Error('storage down')
    })
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    const res = await uploadFile(
      await imageFile('jpeg', 'IMG_0001.JPG')
    )

    expect(res.url).toMatch(/\.jpg$/)
    expect(res.variantVersion).toBeUndefined()
    errorSpy.mockRestore()
  })

  it('records the size as displayed, after EXIF rotation', async () => {
    const bytes = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: '#000'
      }
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer()
    const res = await uploadFile(
      new File([new Uint8Array(bytes)], 'rotated.jpg', {
        type: 'image/jpeg'
      })
    )

    expect(res).toMatchObject({ width: 600, height: 800 })
  })

  it('stores same-named files under different keys', async () => {
    const first = await uploadFile(
      await imageFile('jpeg', 'IMG_0001.JPG')
    )
    const second = await uploadFile(
      await imageFile('jpeg', 'IMG_0001.JPG')
    )

    expect(first.url).not.toBe(second.url)
  })

  it('takes the extension and Content-Type from the bytes, not the name or MIME type', async () => {
    const res = await uploadFile(
      await imageFile('png', 'photo.jpg', 'image/jpeg')
    )

    expect(res.format).toBe('png')
    expect(mockPut).toHaveBeenCalledWith(
      `images/${res.id}.png`,
      expect.any(Buffer),
      'image/png'
    )
  })

  it('refuses an unsupported format without uploading', async () => {
    await expect(
      uploadFile(await imageFile('tiff', 'scan.jpg'))
    ).rejects.toThrow('Unsupported image format (tiff)')
    expect(mockPut).not.toHaveBeenCalled()
  })

  it('refuses a file that is not an image', async () => {
    const file = new File(['not an image'], 'fake.jpg', {
      type: 'image/jpeg'
    })

    await expect(uploadFile(file)).rejects.toThrow(
      'File is not a readable image'
    )
    expect(mockPut).not.toHaveBeenCalled()
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
    expect(mockPut).not.toHaveBeenCalled()
  })

  it('refuses an aspect over 10:1 without uploading', async () => {
    await expect(
      uploadFile(
        await imageFile('jpeg', 'banner.jpg', 'image/jpeg', {
          width: 12000,
          height: 600
        })
      )
    ).rejects.toThrow('"banner.jpg" is too long and thin')
    expect(mockPut).not.toHaveBeenCalled()
  })

  it('refuses more than 40 MP without uploading', async () => {
    await expect(
      uploadFile(
        await imageFile('jpeg', 'huge.jpg', 'image/jpeg', {
          width: 8000,
          height: 5001
        })
      )
    ).rejects.toThrow('"huge.jpg" is too large')
    expect(mockPut).not.toHaveBeenCalled()
  })

  it('accepts a 600 px short edge', async () => {
    const res = await uploadFile(
      await imageFile('jpeg', 'portrait.jpg', 'image/jpeg', {
        width: 600,
        height: 900
      })
    )
    expect(res.url).toMatch(/\.jpg$/)
  })
})

describe('deleteImageFile', () => {
  beforeEach(() => mockDelete.mockReset())

  const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6'

  it('deletes the original derived from the id and format', async () => {
    await deleteImageFile({
      id,
      format: 'png',
      url: 'https://anywhere.example/old.png'
    })
    expect(mockDelete).toHaveBeenCalledWith(`images/${id}.png`)
    for (const width of VARIANT_WIDTHS) {
      expect(mockDelete).toHaveBeenCalledWith(
        `images/${id}_v${VARIANT_VERSION}_${width}.webp`
      )
    }
  })

  it('deletes an older row by its stored url on the active provider', async () => {
    await deleteImageFile({
      id,
      url: 'https://bucket.s3.us-east-1.amazonaws.com/images/IMG%200001.jpg'
    })
    expect(mockDelete).toHaveBeenCalledWith('images/IMG 0001.jpg')
  })

  it('leaves a file on another host alone', async () => {
    await deleteImageFile({
      id,
      url: 'https://old-bucket.s3.amazonaws.com/images/photo.jpg'
    })
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("deletes a row's own variant version", async () => {
    await deleteImageFile({
      id,
      format: 'png',
      variantVersion: 2,
      url: 'https://anywhere.example/old.png'
    })
    for (const width of VARIANT_WIDTHS) {
      expect(mockDelete).toHaveBeenCalledWith(
        `images/${id}_v2_${width}.webp`
      )
    }
  })

  it('logs storage errors instead of throwing', async () => {
    mockDelete.mockRejectedValueOnce(new Error('S3 error'))
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    await expect(
      deleteImageFile({
        id,
        format: 'jpeg',
        url: 'https://x.example/a'
      })
    ).resolves.toBeUndefined()
    errorSpy.mockRestore()
  })
})
