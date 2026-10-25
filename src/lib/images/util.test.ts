import {
  formatMegabytes,
  hasVariants,
  imageAspect,
  imageVariantUrl,
  MAX_UPLOAD_FILE_SIZE,
  MAX_UPLOAD_REQUEST_SIZE,
  newFilesSize,
  ogImage
} from '@/lib/images/util'
import { mockFile } from '@/test/helpers'

describe('newFilesSize', () => {
  it('sums only the files a form submits', () => {
    const formData = new FormData()
    formData.append('title', 'A title')
    formData.append('images[0].file', mockFile('a.jpg', 1000))
    formData.append('images[1].file', mockFile('b.jpg', 2500))

    expect(newFilesSize(formData)).toBe(3500)
  })

  it('lets one max-size file through but not two', () => {
    const formData = new FormData()
    formData.append('file', mockFile('a.jpg', MAX_UPLOAD_FILE_SIZE))
    expect(newFilesSize(formData)).toBeLessThanOrEqual(
      MAX_UPLOAD_REQUEST_SIZE
    )

    formData.append('file', mockFile('b.jpg', MAX_UPLOAD_FILE_SIZE))
    expect(newFilesSize(formData)).toBeGreaterThan(
      MAX_UPLOAD_REQUEST_SIZE
    )
  })
})

describe('formatMegabytes', () => {
  it('rounds to one decimal place', () => {
    expect(formatMegabytes(4 * 1000 * 1000)).toBe('4 MB')
    expect(formatMegabytes(4.5 * 1000 * 1000)).toBe('4.5 MB')
    expect(formatMegabytes(7_340_000)).toBe('7.3 MB')
  })
})

const original = 'https://store.example/images/abc.jpg'

describe('imageAspect', () => {
  it('prefers the stored size once variants are written', () => {
    expect(
      imageAspect({
        width: 800,
        height: 400,
        aspect: 1,
        variantVersion: 1
      })
    ).toBe(2)
  })

  it('keeps a legacy aspect over a possibly pre-rotation size', () => {
    expect(
      imageAspect({ width: 800, height: 600, aspect: 0.75 })
    ).toBe(0.75)
  })

  it('uses the size when there is no aspect', () => {
    expect(imageAspect({ width: 800, height: 400 })).toBe(2)
  })

  it('falls back to aspect, then a square', () => {
    expect(imageAspect({ aspect: 1.5 })).toBe(1.5)
    expect(imageAspect({})).toBe(1)
  })
})

describe('hasVariants', () => {
  it('needs a format and a variant version', () => {
    expect(
      hasVariants({
        url: original,
        format: 'jpeg',
        variantVersion: 1
      })
    ).toBe(true)
    expect(
      hasVariants({
        url: original,
        format: 'jpeg',
        variantVersion: 0
      })
    ).toBe(false)
    expect(hasVariants({ url: original, variantVersion: 1 })).toBe(
      false
    )
  })
})

describe('imageVariantUrl', () => {
  it('maps a width to the next variant up', () => {
    expect(imageVariantUrl(original, 640, 1)).toBe(
      'https://store.example/images/abc_v1_640.webp'
    )
    expect(imageVariantUrl(original, 700, 1)).toBe(
      'https://store.example/images/abc_v1_800.webp'
    )
    expect(imageVariantUrl(original, 100, 1)).toBe(
      'https://store.example/images/abc_v1_256.webp'
    )
  })

  it('caps at the largest variant', () => {
    expect(imageVariantUrl(original, 3840, 1)).toBe(
      'https://store.example/images/abc_v1_1600.webp'
    )
  })

  it('names each version so caches miss', () => {
    expect(imageVariantUrl(original, 640, 2)).toBe(
      'https://store.example/images/abc_v2_640.webp'
    )
  })
})

describe('ogImage', () => {
  it('uses the 1200 variant at its true size', () => {
    expect(
      ogImage({
        url: original,
        format: 'jpeg',
        variantVersion: 1,
        width: 1000,
        height: 500
      })
    ).toEqual({
      url: 'https://store.example/images/abc_v1_1200.webp',
      width: 1000,
      height: 500,
      type: 'image/webp'
    })
  })

  it('uses the original without variants', () => {
    expect(
      ogImage({ url: original, width: 2400, height: 1200 })
    ).toEqual({ url: original, width: 1200, height: 600 })
  })
})
