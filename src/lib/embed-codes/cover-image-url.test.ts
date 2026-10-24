import {
  COVER_IMAGE_THUMBNAIL_SIZE,
  coverImageUrlFromId,
  isCoverImageThumbnailUrl,
  withCoverImageUrls
} from '@/lib/embed-codes/cover-image-url'

const originalEnv = process.env

beforeEach(() => {
  process.env = {
    ...originalEnv,
    AWS_S3_BUCKET_NAME: 'bucket',
    AWS_S3_REGION: 'us-east-1'
  }
})

afterEach(() => {
  process.env = originalEnv
})

describe('coverImageUrlFromId', () => {
  it('builds the full-size url by default', () => {
    expect(coverImageUrlFromId('abc-123')).toEqual(
      'https://bucket.s3.us-east-1.amazonaws.com/embedCodeCoverImages/abc-123.jpg'
    )
  })

  it('builds a resized url with a numeric size suffix', () => {
    expect(coverImageUrlFromId('abc-123', 32)).toEqual(
      'https://bucket.s3.us-east-1.amazonaws.com/embedCodeCoverImages/abc-123_32.jpg'
    )
  })
})

describe('isCoverImageThumbnailUrl', () => {
  it('matches only the stored thumbnail variant', () => {
    expect(
      isCoverImageThumbnailUrl(
        coverImageUrlFromId('abc-123', COVER_IMAGE_THUMBNAIL_SIZE)
      )
    ).toBe(true)
    expect(
      isCoverImageThumbnailUrl(coverImageUrlFromId('abc-123'))
    ).toBe(false)
    expect(
      isCoverImageThumbnailUrl(
        'https://bucket.s3.us-east-1.amazonaws.com/images/photo_96.jpg'
      )
    ).toBe(false)
  })
})

describe('withCoverImageUrls', () => {
  it('attaches derived urls when coverImageId is set', () => {
    expect(withCoverImageUrls({ coverImageId: 'abc-123' })).toEqual({
      coverImageId: 'abc-123',
      coverImageUrl:
        'https://bucket.s3.us-east-1.amazonaws.com/embedCodeCoverImages/abc-123.jpg',
      coverImageThumbnailUrl:
        'https://bucket.s3.us-east-1.amazonaws.com/embedCodeCoverImages/abc-123_96.jpg'
    })
  })

  it('passes the item through unchanged when coverImageId is unset', () => {
    const embedCode = { title: 'Untitled', coverImageId: undefined }
    expect(withCoverImageUrls(embedCode)).toBe(embedCode)
  })
})
