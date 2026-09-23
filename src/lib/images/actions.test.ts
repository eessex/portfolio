import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  deleteImage,
  editImage,
  resolveCoverImageId,
  resolveOrderedImageIds,
  saveImageFromFields
} from '@/lib/images/actions'
import {
  createImageFixture,
  imageFixture
} from '@/lib/images/fixtures'
import { deleteFromS3, uploadFile } from '@/lib/images/s3'
import type { CreateImage, Image } from '@/lib/images/schemas/db'
import { formDataFromObject, mockFile } from '@/test/helpers'

jest.mock('@/lib/images/s3', () => ({
  uploadFile: jest.fn(),
  deleteFromS3: jest.fn()
}))

const deleteFromS3Mock = deleteFromS3 as jest.Mock
const uploadFileMock = uploadFile as jest.Mock

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
      expect(updateTag).toHaveBeenCalledWith('images')
      // images are embedded into cached release/event/project/about/edition pages
      expect(updateTag).toHaveBeenCalledWith('releases')
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteImage(imageFixture)
      expect(deleteFromS3Mock).not.toHaveBeenCalled()

      expect(res!.message).toBe('Failed to delete image: DB error.')
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

      expect(res!.message).toBe('Failed to delete image: S3 error.')
    })
  })

  describe('#editImage', () => {
    it('can edit an existing image', async () => {
      mockSql
        .mockResolvedValueOnce([imageFixture]) // fetchImagesByIds
        .mockResolvedValueOnce([imageFixture]) // UPDATE ... RETURNING *
      const res = await editImage(
        formDataFromObject(imageFixture),
        imageFixture.id
      )

      expect(uploadFileMock).not.toHaveBeenCalled()
      expect(res?.ok).toBe(true)
      expect((res?.res as Image)?.caption).toEqual(
        'This is a new image for testing purposes.'
      )
      expect(updateTag).toHaveBeenCalledWith('images')
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('merges submitted fields with the existing image on update', async () => {
      mockSql
        .mockResolvedValueOnce([imageFixture])
        .mockResolvedValueOnce([imageFixture])

      // only aspect and url (required) are submitted; caption/title
      // should fall back to the existing image's values
      await editImage(
        formDataFromObject({
          aspect: imageFixture.aspect,
          url: imageFixture.url
        }),
        imageFixture.id
      )

      const [, alt, aspect, caption] = mockSql.mock
        .calls[1] as unknown as string[]
      expect(alt).toBe(null)
      expect(aspect).toBeCloseTo(imageFixture.aspect)
      expect(caption).toBe(imageFixture.caption)
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
        ...createImageFixture,
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
      expect(updateTag).toHaveBeenCalledWith('images')
      // images are embedded into cached release/event/project/about/edition pages
      expect(updateTag).toHaveBeenCalledWith('releases')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editImage(formDataFromObject(imageFixture))

      expect(res!.message).toBe('Failed to save image: DB error.')
    })

    it('can handle errors fetching the existing image on update', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editImage(
        formDataFromObject(imageFixture),
        imageFixture.id
      )

      expect(res!.message).toBe('Failed to save image: DB error.')
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreateImage> = { ...createImageFixture }
      delete invalid.url
      const res = await editImage(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate image.')
      expect(res!.errors).toEqual({ url: ['Required'] })
    })
  })

  describe('#saveImageFromFields', () => {
    it('uploads the file and creates an image from raw fields', async () => {
      uploadFileMock.mockResolvedValueOnce(
        'https://example.com/uploaded-image.jpg'
      )
      mockSql.mockResolvedValueOnce([imageFixture])

      const res = await saveImageFromFields({
        ...createImageFixture,
        file: mockFile('uploaded-image.jpg', 2048, 'image/jpeg')
      })

      expect(uploadFileMock).toHaveBeenCalled()
      expect(res.caption).toEqual(
        'This is a new image for testing purposes.'
      )
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('normalizes raw checkbox/empty-string fields before validating', async () => {
      mockSql.mockResolvedValueOnce([imageFixture])

      await saveImageFromFields({
        ...createImageFixture,
        type: 'press',
        alt: ''
      })

      const rows = mockSql.mock.calls[0] as unknown as string[]
      const [, , , , isHiddenOnAboutPage, type] = rows
      expect(type).toBe('press')
      expect(isHiddenOnAboutPage).toBe(null)
    })

    it('throws a descriptive error on invalid fields', async () => {
      const invalid: Partial<CreateImage> = { ...createImageFixture }
      delete invalid.url

      await expect(saveImageFromFields(invalid)).rejects.toThrow(
        'Invalid image data: Required'
      )
      expect(mockSql).not.toHaveBeenCalled()
    })
  })

  describe('#resolveOrderedImageIds', () => {
    it('returns the first entry as coverImageId and the rest as imageIds', async () => {
      const result = await resolveOrderedImageIds({
        'images[0].id': 'image-1',
        'images[1].id': 'image-2',
        'images[2].id': 'image-3'
      })

      expect(result).toEqual({
        coverImageId: 'image-1',
        imageIds: ['image-2', 'image-3']
      })
    })

    it('creates pending new images in place and preserves position for the cover', async () => {
      uploadFileMock.mockResolvedValueOnce(
        'https://example.com/uploaded-image.jpg'
      )
      mockSql.mockResolvedValueOnce([
        {
          ...imageFixture,
          id: '44444444-4444-4444-8444-444444444444'
        }
      ])

      const result = await resolveOrderedImageIds({
        'images[0].aspect': 1.5,
        'images[0].caption': 'A brand new cover',
        'images[0].url': 'https://example.com/image.jpg',
        'images[1].id': 'image-2'
      })

      expect(result).toEqual({
        coverImageId: '44444444-4444-4444-8444-444444444444',
        imageIds: ['image-2']
      })
    })

    it('updates an edited existing entry (id + fields) in place', async () => {
      mockSql
        .mockResolvedValueOnce([imageFixture]) // fetchImagesByIds
        .mockResolvedValueOnce([imageFixture]) // UPDATE ... RETURNING *

      const result = await resolveOrderedImageIds({
        'images[0].id': 'image-1',
        'images[0].url': imageFixture.url,
        'images[0].aspect': 1.5,
        'images[0].caption': 'Edited caption'
      })

      expect(result).toEqual({
        coverImageId: imageFixture.id,
        imageIds: []
      })
      // a metadata-only edit keeps the existing file (no new upload)
      expect(uploadFileMock).not.toHaveBeenCalled()
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('returns an undefined coverImageId and empty imageIds when nothing is selected', async () => {
      const result = await resolveOrderedImageIds({ 'images[]': '' })

      expect(result).toEqual({
        coverImageId: undefined,
        imageIds: []
      })
    })

    it('ignores an untouched empty new slot', async () => {
      const result = await resolveOrderedImageIds({
        'images[0].file': mockFile('', 0, ''),
        'images[0].caption': '',
        'images[0].alt': '',
        'images[0].title': '',
        'images[0].type': ''
      })

      expect(result).toEqual({
        coverImageId: undefined,
        imageIds: []
      })
      expect(uploadFileMock).not.toHaveBeenCalled()
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('drops empty new slots but keeps a filled one, preserving order', async () => {
      uploadFileMock.mockResolvedValueOnce(
        'https://example.com/uploaded-image.jpg'
      )
      mockSql.mockResolvedValueOnce([
        {
          ...imageFixture,
          id: '44444444-4444-4444-8444-444444444444'
        }
      ])

      const result = await resolveOrderedImageIds({
        'images[0].file': mockFile('', 0, ''),
        'images[0].caption': '',
        'images[1].aspect': 1.5,
        'images[1].url': 'https://example.com/image.jpg',
        'images[2].id': 'image-2'
      })

      expect(result).toEqual({
        coverImageId: '44444444-4444-4444-8444-444444444444',
        imageIds: ['image-2']
      })
    })

    it('supports a custom field prefix', async () => {
      const result = await resolveOrderedImageIds(
        { 'gallery[0].id': 'image-1' },
        'gallery'
      )

      expect(result).toEqual({
        coverImageId: 'image-1',
        imageIds: []
      })
    })
  })

  describe('#resolveCoverImageId', () => {
    it('passes an existing coverImageId straight through', async () => {
      const data: Record<string, unknown> = {
        coverImageId: imageFixture.id
      }

      const id = await resolveCoverImageId(data)

      expect(id).toBe(imageFixture.id)
      expect(mockSql).not.toHaveBeenCalled()
      expect(uploadFileMock).not.toHaveBeenCalled()
    })

    it('updates the image when an id is submitted alongside edited fields', async () => {
      mockSql
        .mockResolvedValueOnce([imageFixture]) // fetchImagesByIds
        .mockResolvedValueOnce([imageFixture]) // UPDATE ... RETURNING *

      const data: Record<string, unknown> = {
        coverImageId: imageFixture.id,
        'coverImage.url': imageFixture.url,
        'coverImage.aspect': 1.5,
        'coverImage.caption': 'Edited caption'
      }

      const id = await resolveCoverImageId(data)

      expect(id).toBe(imageFixture.id)
      // a metadata-only edit keeps the existing file (no new upload)
      expect(uploadFileMock).not.toHaveBeenCalled()
      expect(mockSql).toHaveBeenCalledTimes(2)
      expect(data).not.toHaveProperty(['coverImage.url'])
      expect(data).not.toHaveProperty(['coverImage.caption'])
    })

    it('creates a new image from inline fields when a file is submitted', async () => {
      uploadFileMock.mockResolvedValueOnce(
        'https://example.com/uploaded.jpg'
      )
      mockSql.mockResolvedValueOnce([
        {
          ...imageFixture,
          id: '44444444-4444-4444-8444-444444444444'
        }
      ])

      const data: Record<string, unknown> = {
        'coverImage.file': mockFile(),
        'coverImage.aspect': 1.5,
        'coverImage.caption': 'A brand new cover'
      }

      const id = await resolveCoverImageId(data)

      expect(id).toBe('44444444-4444-4444-8444-444444444444')
      expect(uploadFileMock).toHaveBeenCalledTimes(1)
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('strips prefixed image fields but leaves the parent title untouched', async () => {
      uploadFileMock.mockResolvedValueOnce(
        'https://example.com/uploaded.jpg'
      )
      mockSql.mockResolvedValueOnce([imageFixture])

      const data: Record<string, unknown> = {
        title: 'Site title',
        description: 'Site description',
        'coverImage.file': mockFile(),
        'coverImage.aspect': 1.5,
        'coverImage.caption': 'cap',
        'coverImage.title': 'Image title'
      }

      await resolveCoverImageId(data)

      expect(data).not.toHaveProperty('coverImage.file')
      expect(data).not.toHaveProperty('coverImage.aspect')
      expect(data).not.toHaveProperty('coverImage.caption')
      expect(data).not.toHaveProperty('coverImage.title')
      expect(data.title).toBe('Site title')
      expect(data.description).toBe('Site description')
    })

    it('reads the id and inline fields from a custom id field name', async () => {
      mockSql
        .mockResolvedValueOnce([imageFixture]) // fetchImagesByIds
        .mockResolvedValueOnce([imageFixture]) // UPDATE ... RETURNING *

      const data: Record<string, unknown> = {
        heroImageId: imageFixture.id,
        'heroImage.url': imageFixture.url,
        'heroImage.aspect': 1.5,
        'heroImage.caption': 'Edited caption'
      }

      const id = await resolveCoverImageId(data, 'heroImageId')

      expect(id).toBe(imageFixture.id)
      expect(mockSql).toHaveBeenCalledTimes(2)
      expect(data).not.toHaveProperty(['heroImage.url'])
    })

    it('returns undefined when neither a coverImageId nor a file is submitted', async () => {
      const id = await resolveCoverImageId({ description: 'x' })

      expect(id).toBeUndefined()
      expect(mockSql).not.toHaveBeenCalled()
      expect(uploadFileMock).not.toHaveBeenCalled()
    })
  })
})
