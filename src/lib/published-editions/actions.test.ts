import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  deletePublishedEdition,
  editPublishedEdition
} from '@/lib/published-editions/actions'
import {
  newPublishedEditionFixtureAlpha,
  publishedEditionFixtureAlpha
} from '@/lib/published-editions/fixtures'
import type { CreatePublishedEdition } from '@/lib/published-editions/schemas/db'
import { formDataFromObject } from '@/test/helpers'

jest.mock('next/cache')
jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

const existingPublishedEditionRow = {
  ...publishedEditionFixtureAlpha,
  release: {
    id: publishedEditionFixtureAlpha.releaseId,
    title: 'Existing Release'
  },
  releaseSlugs: []
}

describe('Published Edition Actions', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('#deletePublishedEdition', () => {
    it('can delete a published edition', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])
      const res = await deletePublishedEdition(
        publishedEditionFixtureAlpha
      )

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('publishedEditions')
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
      expect(updateTag).toHaveBeenCalledWith('publishedEditions')
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

      // only publisher (required) is submitted; format/publishDate/
      // releaseId should fall back to the existing edition's values
      await editPublishedEdition(
        formDataFromObject({
          publisher: 'Updated Publisher',
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

    it('can create a new published edition', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])
      const res = await editPublishedEdition(
        formDataFromObject(newPublishedEditionFixtureAlpha)
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as { id: string })?.id).toEqual(
        publishedEditionFixtureAlpha.id
      )
      expect(updateTag).toHaveBeenCalledWith('publishedEditions')
      expect(mockSql).toHaveBeenCalledTimes(1)

      const [, , catalogNumber] = mockSql.mock
        .calls[0] as unknown as string[]
      expect(catalogNumber).toBe(
        newPublishedEditionFixtureAlpha.catalogNumber
      )
    })

    it('can save without an optional catalogNumber', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])
      const { catalogNumber: _catalogNumber, ...withoutCatalogNumber } =
        newPublishedEditionFixtureAlpha
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
        'Failed to edit published edition: DB error.'
      )
    })

    it('can handle errors fetching the existing edition on update', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editPublishedEdition(
        formDataFromObject(publishedEditionFixtureAlpha),
        publishedEditionFixtureAlpha.id
      )

      expect(res!.message).toBe(
        'Failed to edit published edition: DB error.'
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
  })
})
