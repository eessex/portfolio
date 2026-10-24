import {
  formatMegabytes,
  MAX_UPLOAD_FILE_SIZE,
  MAX_UPLOAD_REQUEST_SIZE,
  newFilesSize
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
