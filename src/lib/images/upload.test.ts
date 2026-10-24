/** @jest-environment node */
import sharp from 'sharp'

import { deleteImageFile, uploadFile } from '@/lib/images/upload'

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
      url: `https://bucket.example/images/${res.id}.jpg`
    })
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
