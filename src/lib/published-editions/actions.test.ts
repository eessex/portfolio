import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import {
  deletePublishedEdition,
  editPublishedEdition
} from '@/lib/published-editions/actions'
import {
  newPublishedEditionFixtureAlpha,
  publishedEditionFixtureAlpha
} from '@/lib/published-editions/fixtures'
import type { CreatePublishedEdition } from '@/lib/published-editions/schemas/db'
import {
  newPublisherFixtureAlpha,
  publisherFixtureAlpha,
  publisherFixtureBeta
} from '@/lib/publishers/fixtures'
import { ReleaseTypes } from '@/lib/releases/schemas'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

jest.mock('@/lib/images/actions', () => ({
  resolveOrderedImageIds: jest.fn()
}))
const mockResolveOrderedImageIds = jest.mocked(resolveOrderedImageIds)

const EXISTING_IMAGE_ID_1 = '11111111-1111-4111-8111-111111111111'
const NEW_IMAGE_ID = '33333333-3333-4333-8333-333333333333'

const existingPublishedEditionRow = {
  ...publishedEditionFixtureAlpha,
  release: {
    id: publishedEditionFixtureAlpha.releaseId,
    title: 'Existing Release',
    type: ReleaseTypes.album
  },
  releaseSlugs: []
}

describe('Published Edition Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockResolveOrderedImageIds.mockResolvedValue({
      coverImageId: undefined,
      imageIds: []
    })
  })

  describe('#deletePublishedEdition', () => {
    it('can delete a published edition', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])
      const res = await deletePublishedEdition(
        publishedEditionFixtureAlpha
      )

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('published-editions')
      expect(updateTag).toHaveBeenCalledWith('releases')
      expect(updateTag).toHaveBeenCalledWith(
        `release:${publishedEditionFixtureAlpha.releaseId}`
      )
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deletePublishedEdition(
        publishedEditionFixtureAlpha
      )

      expect(res!.message).toBe(
        'Failed to delete published edition: DB error.'
      )
    })
  })

  describe('#editPublishedEdition', () => {
    it('can edit an existing published edition', async () => {
      mockSql
        .mockResolvedValueOnce([existingPublishedEditionRow]) // fetchPublishedEditionById
        .mockResolvedValueOnce([publishedEditionFixtureAlpha]) // UPDATE ... RETURNING *
      const res = await editPublishedEdition(
        formDataFromObject(publishedEditionFixtureAlpha),
        publishedEditionFixtureAlpha.id
      )

      expect(res?.ok).toBe(true)
      expect(updateTag).toHaveBeenCalledWith('published-editions')
      expect(updateTag).toHaveBeenCalledWith('releases')
      expect(updateTag).toHaveBeenCalledWith(
        `release:${publishedEditionFixtureAlpha.releaseId}`
      )
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('merges submitted fields with the existing edition on update', async () => {
      mockSql
        .mockResolvedValueOnce([existingPublishedEditionRow])
        .mockResolvedValueOnce([publishedEditionFixtureAlpha])

      // only publisherId (required) is submitted; format/publishDate/
      // releaseId should fall back to the existing edition's values
      await editPublishedEdition(
        formDataFromObject({
          publisherId: publisherFixtureBeta.id,
          format: publishedEditionFixtureAlpha.format,
          publishDate: publishedEditionFixtureAlpha.publishDate,
          releaseId: publishedEditionFixtureAlpha.releaseId
        }),
        publishedEditionFixtureAlpha.id
      )

      const [, buyLinkId, catalogNumber, coverImageId, , format] =
        mockSql.mock.calls[1] as unknown as string[]
      expect(buyLinkId).toBe(null)
      // catalogNumber wasn't submitted, so it falls back to the existing edition's value
      expect(catalogNumber).toBe(
        publishedEditionFixtureAlpha.catalogNumber
      )
      expect(coverImageId).toBe(null)
      expect(format).toBe(publishedEditionFixtureAlpha.format)
    })

    it('coerces editionSize from a form string to a number', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])
      const res = await editPublishedEdition(
        formDataFromObject({
          ...newPublishedEditionFixtureAlpha,
          editionSize: '150'
        })
      )

      expect(res?.ok).toBe(true)
      const [, , , , editionSize] = mockSql.mock
        .calls[0] as unknown as string[]
      expect(editionSize).toBe(150)
    })

    it('can create a new published edition', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])
      const res = await editPublishedEdition(
        formDataFromObject(newPublishedEditionFixtureAlpha)
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as { id: string })?.id).toEqual(
        publishedEditionFixtureAlpha.id
      )
      expect(updateTag).toHaveBeenCalledWith('published-editions')
      expect(mockSql).toHaveBeenCalledTimes(1)

      const [, , catalogNumber] = mockSql.mock
        .calls[0] as unknown as string[]
      expect(catalogNumber).toBe(
        newPublishedEditionFixtureAlpha.catalogNumber
      )
    })

    it('can save without an optional catalogNumber', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])
      const {
        catalogNumber: _catalogNumber,
        ...withoutCatalogNumber
      } = newPublishedEditionFixtureAlpha
      const res = await editPublishedEdition(
        formDataFromObject(withoutCatalogNumber)
      )

      expect(res?.ok).toBe(true)
      const [, , catalogNumber] = mockSql.mock
        .calls[0] as unknown as string[]
      expect(catalogNumber).toBe(null)
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editPublishedEdition(
        formDataFromObject(newPublishedEditionFixtureAlpha)
      )

      expect(res!.message).toBe(
        'Failed to save published edition: DB error.'
      )
    })

    it('can handle errors fetching the existing edition on update', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editPublishedEdition(
        formDataFromObject(publishedEditionFixtureAlpha),
        publishedEditionFixtureAlpha.id
      )

      expect(res!.message).toBe(
        'Failed to save published edition: DB error.'
      )
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreatePublishedEdition> = {
        ...newPublishedEditionFixtureAlpha
      }
      delete invalid.releaseId
      const res = await editPublishedEdition(
        formDataFromObject(invalid)
      )

      expect(res!.message).toBe(
        'Failed to validate published edition.'
      )
      expect(res!.errors).toEqual({ releaseId: ['Required'] })
    })

    describe('images picker (coverImageId + imageIds from order)', () => {
      it('passes the raw submitted data to resolveOrderedImageIds', async () => {
        mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])

        await editPublishedEdition(
          formDataFromObject({
            ...newPublishedEditionFixtureAlpha,
            'images[0].id': EXISTING_IMAGE_ID_1
          })
        )

        expect(mockResolveOrderedImageIds).toHaveBeenCalledWith(
          expect.objectContaining({
            'images[0].id': EXISTING_IMAGE_ID_1
          })
        )
      })

      it('writes the resolved coverImageId and imageIds to the saved row', async () => {
        mockSql
          .mockResolvedValueOnce([existingPublishedEditionRow])
          .mockResolvedValueOnce([publishedEditionFixtureAlpha])
        mockResolveOrderedImageIds.mockResolvedValueOnce({
          coverImageId: NEW_IMAGE_ID,
          imageIds: [EXISTING_IMAGE_ID_1]
        })

        await editPublishedEdition(
          formDataFromObject(publishedEditionFixtureAlpha),
          publishedEditionFixtureAlpha.id
        )

        expect(mockSql.mock.calls[1]?.[3]).toEqual(NEW_IMAGE_ID)
        expect(mockSql.mock.calls[1]?.[6]).toEqual([
          EXISTING_IMAGE_ID_1
        ])
      })

      it('clears both coverImageId and imageIds when nothing is selected', async () => {
        mockSql
          .mockResolvedValueOnce([existingPublishedEditionRow])
          .mockResolvedValueOnce([publishedEditionFixtureAlpha])

        await editPublishedEdition(
          formDataFromObject(publishedEditionFixtureAlpha),
          publishedEditionFixtureAlpha.id
        )

        expect(mockSql.mock.calls[1]?.[3]).toBeNull()
        expect(mockSql.mock.calls[1]?.[6]).toEqual([])
      })
    })

    describe('publisher picker', () => {
      it('creates a new publisher inline when name/type fields are submitted instead of a publisherId', async () => {
        const { publisherId: _publisherId, ...withoutPublisherId } =
          newPublishedEditionFixtureAlpha
        mockSql
          .mockResolvedValueOnce([publisherFixtureAlpha]) // publisher INSERT
          .mockResolvedValueOnce([publishedEditionFixtureAlpha]) // edition INSERT

        const res = await editPublishedEdition(
          formDataFromObject({
            ...withoutPublisherId,
            'publisher.name': newPublisherFixtureAlpha.name,
            'publisher.type': newPublisherFixtureAlpha.type,
            'publisher.url': newPublisherFixtureAlpha.url
          })
        )

        expect(res?.ok).toBe(true)
        expect(mockSql).toHaveBeenCalledTimes(2)
        expect(mockSql.mock.calls[1]?.[8]).toEqual(
          publisherFixtureAlpha.id
        )
        expect(updateTag).toHaveBeenCalledWith('publishers')
      })

      it('does not create a publisher when an existing publisherId is submitted', async () => {
        mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])

        await editPublishedEdition(
          formDataFromObject(newPublishedEditionFixtureAlpha)
        )

        // only the edition INSERT — no publisher created
        expect(mockSql).toHaveBeenCalledTimes(1)
      })
    })
  })
})
