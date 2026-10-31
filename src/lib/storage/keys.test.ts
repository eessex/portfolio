import { imageSchema } from '@/lib/images/schemas/db'
import { uploadFormats } from '@/lib/images/util'
import {
  blobHostname,
  imageKey,
  keyFromUrl,
  publicUrl,
  storageProvider
} from '@/lib/storage/keys'

const originalEnv = process.env
const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6'

beforeEach(() => {
  process.env = {
    ...originalEnv,
    STORAGE_PROVIDER: '',
    AWS_S3_BUCKET_NAME: 'bucket',
    AWS_S3_REGION: 'us-east-1',
    REMOTE_IMAGE_HOSTNAME: '',
    BLOB_READ_WRITE_TOKEN: '',
    BLOB_STORE_ID: ''
  }
})

afterEach(() => {
  process.env = originalEnv
})

describe('storageProvider', () => {
  it('defaults to S3 without a Blob token', () => {
    expect(storageProvider()).toBe('s3')
  })

  it('defaults to Blob when a Blob token exists', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_AbC123_secret'
    expect(storageProvider()).toBe('blob')
  })

  it('prefers STORAGE_PROVIDER over the credentials', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_AbC123_secret'
    process.env.STORAGE_PROVIDER = 's3'
    expect(storageProvider()).toBe('s3')
  })

  it('refuses an unknown provider', () => {
    process.env.STORAGE_PROVIDER = 'r2'
    expect(() => storageProvider()).toThrow(
      'Unknown STORAGE_PROVIDER "r2"'
    )
  })
})

describe('publicUrl', () => {
  it('builds an S3 URL from the bucket and region', () => {
    expect(publicUrl('images/a.jpg')).toBe(
      'https://bucket.s3.us-east-1.amazonaws.com/images/a.jpg'
    )
  })

  it('builds a Blob URL from the store id in the token', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_AbC123_secret'
    expect(blobHostname()).toBe(
      'abc123.public.blob.vercel-storage.com'
    )
    expect(publicUrl('images/a.jpg')).toBe(
      'https://abc123.public.blob.vercel-storage.com/images/a.jpg'
    )
  })

  it('throws when the provider has no hostname', () => {
    process.env.STORAGE_PROVIDER = 'blob'
    expect(() => publicUrl('images/a.jpg')).toThrow(
      'No public hostname for blob storage'
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

  it('derives the url from the id and format on the active provider', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_AbC123_secret'
    expect(imageSchema.parse({ ...row, format: 'jpeg' }).url).toBe(
      `https://abc123.public.blob.vercel-storage.com/images/${id}.jpg`
    )
  })

  it('falls back to the stored url for rows with no format', () => {
    expect(imageSchema.parse(row).url).toBe(row.url)
  })
})
