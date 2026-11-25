import { imageSchema } from '@/lib/images/schemas/db'
import { uploadFormats } from '@/lib/images/util'
import {
  blobHostname,
  imageKey,
  keyFromUrl,
  publicUrl
} from '@/lib/storage/keys'

const originalEnv = process.env
const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6'

beforeEach(() => {
  process.env = {
    ...originalEnv,
    BLOB_READ_WRITE_TOKEN: '',
    BLOB_STORE_ID: ''
  }
})

afterEach(() => {
  process.env = originalEnv
})

describe('publicUrl', () => {
  it('builds a Blob URL from the store id in the token', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_AbC123_secret'
    expect(blobHostname()).toBe(
      'abc123.public.blob.vercel-storage.com'
    )
    expect(publicUrl('images/a.jpg')).toBe(
      'https://abc123.public.blob.vercel-storage.com/images/a.jpg'
    )
  })

  it('prefers BLOB_STORE_ID over the token', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_AbC123_secret'
    process.env.BLOB_STORE_ID = 'store_Other9'
    expect(publicUrl('images/a.jpg')).toBe(
      'https://other9.public.blob.vercel-storage.com/images/a.jpg'
    )
  })

  it('throws when there is no store', () => {
    expect(() => publicUrl('images/a.jpg')).toThrow(
      'No Blob store host'
    )
  })
})

describe('imageKey', () => {
  it('names the original from the id and format', () => {
    expect(imageKey(id, 'jpeg')).toBe(`images/${id}.jpg`)
    expect(imageKey(id, 'png')).toBe(`images/${id}.png`)
  })

  it('knows every format the schema allows', () => {
    expect(imageSchema.in.shape.format.unwrap().options).toEqual(
      Object.keys(uploadFormats)
    )
  })
})

describe('keyFromUrl', () => {
  it('decodes the path without its leading slash', () => {
    expect(
      keyFromUrl('https://h.example/images/IMG%200001.jpg?x=1')
    ).toBe('images/IMG 0001.jpg')
  })
})

describe('imageSchema url', () => {
  const row = {
    id,
    aspect: 1.5,
    createdAt: new Date('2024-01-01'),
    url: 'https://old.example/images/IMG_0001.jpg'
  }

  it('derives the url from the id and format from the Blob store', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_AbC123_secret'
    expect(imageSchema.parse({ ...row, format: 'jpeg' }).url).toBe(
      `https://abc123.public.blob.vercel-storage.com/images/${id}.jpg`
    )
  })

  it('falls back to the stored url for rows with no format', () => {
    expect(imageSchema.parse(row).url).toBe(row.url)
  })
})
