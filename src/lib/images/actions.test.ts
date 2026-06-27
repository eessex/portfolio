import { revalidatePath } from 'next/cache'

import { sql } from '@/lib/db'
import { deleteImage, editImage } from '@/lib/images/actions'
import { imageFixture, newImageFixture } from '@/lib/images/fixtures'
import { deleteFromS3, uploadFile } from '@/lib/images/s3'
import type { CreateImage, Image } from '@/lib/images/types'
import { formDataFromObject, mockFile } from '@/test/helpers'

jest.mock('@/lib/images/s3', () => ({
  uploadFile: jest.fn(),
  deleteFromS3: jest.fn()
}))

const deleteFromS3Mock = deleteFromS3 as jest.Mock
const uploadFileMock = uploadFile as jest.Mock

jest.mock('next/cache')
jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

describe('Image Actions', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('#deleteImage', () => {
    it('can delete a image', async () => {
      mockSql.mockResolvedValueOnce([imageFixture])
      deleteFromS3Mock.mockResolvedValueOnce(undefined)
      const res = await deleteImage(imageFixture)

      expect(res).toEqual({ ok: true })
      expect(deleteFromS3Mock).toHaveBeenCalledWith(imageFixture.url)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/images')
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteImage(imageFixture)
      expect(deleteFromS3Mock).not.toHaveBeenCalled()

      expect(res!.message).toBe('Failed to delete image: DB error')
    })

    it('can handle image not found', async () => {
      mockSql.mockResolvedValueOnce([])
      const res = await deleteImage(imageFixture)
      expect(deleteFromS3Mock).not.toHaveBeenCalled()

      expect(res!.message).toBe(
        'Failed to delete image: Image not found.'
      )
    })

    it('can handle S3 deletion errors', async () => {
      mockSql.mockResolvedValueOnce([imageFixture])
      deleteFromS3Mock.mockRejectedValueOnce(new Error('S3 error'))
      const res = await deleteImage(imageFixture)

      expect(res!.message).toBe('Failed to delete image: S3 error')
    })
  })

  describe('#editImage', () => {
    it('can edit an existing image', async () => {
      mockSql.mockResolvedValueOnce([imageFixture])
      const res = await editImage(formDataFromObject(imageFixture))

      expect(uploadFileMock).not.toHaveBeenCalled()
      expect(res?.ok).toBe(true)
      expect((res?.res as Image)?.caption).toEqual(
        'This is a new image for testing purposes.'
      )
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/images')
    })

    it('can create a new image', async () => {
      uploadFileMock.mockResolvedValueOnce(
        'https://example.com/uploaded-image.jpg'
      )
      const imageFileFixture = mockFile(
        'uploaded-image.jpg',
        2048,
        'image/jpeg'
      )
      const formData = formDataFromObject({
        ...newImageFixture,
        file: imageFileFixture
      })

      mockSql.mockResolvedValueOnce([imageFixture])
      const res = await editImage(formData)

      expect(uploadFileMock).toHaveBeenCalled()
      expect(res?.ok).toBe(true)
      expect((res?.res as Image)?.caption).toEqual(
        'This is a new image for testing purposes.'
      )
      expect((res?.res as Image)?.id).toEqual(
        '3fa85f64-5717-4562-b3fc-2c963f66afa6'
      )
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/images')
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editImage(formDataFromObject(imageFixture))

      expect(res!.message).toBe('Failed to edit image: DB error')
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreateImage> = { ...newImageFixture }
      delete invalid.url
      const res = await editImage(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate image.')
      expect(res!.errors).toEqual({ url: ['Required'] })
    })
  })
})
