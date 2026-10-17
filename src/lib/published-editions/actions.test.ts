import { auth } from '@/auth'
import { sql } from '@/lib/db'
import {
  savePublishedEditionFromFields,
  syncReleasePublishedEditions
} from '@/lib/published-editions/actions'
import { publishedEditionFixtureAlpha } from '@/lib/published-editions/fixtures'
import { publisherFixtureAlpha } from '@/lib/publishers/fixtures'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

const RELEASE_ID = publishedEditionFixtureAlpha.releaseId
const EDITION_ID = publishedEditionFixtureAlpha.id
const OTHER_EDITION_ID = '44444444-4444-4444-8444-444444444444'

// raw inline-picker fields, as submitted
const editionFields = {
  format: 'LP',
  publishDate: '2020-01-01',
  publisherId: publisherFixtureAlpha.id,
  catalogNumber: 'SL021',
  editionSize: '500'
}

describe('Published Edition Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('#savePublishedEditionFromFields', () => {
    it('creates an edition for the release', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])

      const saved = await savePublishedEditionFromFields(RELEASE_ID, {
        ...editionFields
      })

      expect(saved.id).toBe(EDITION_ID)
      // INSERT params: catalog, size, format, date, publisher, release
      const params = mockSql.mock.calls[0]
      expect(params?.[1]).toBe('SL021')
      expect(params?.[2]).toBe(500)
      expect(params?.[3]).toBe('LP')
      expect(params?.[5]).toBe(publisherFixtureAlpha.id)
      expect(params?.[6]).toBe(RELEASE_ID)
    })

    it("doesn't write the hidden buy link or image columns", async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])

      await savePublishedEditionFromFields(RELEASE_ID, {
        ...editionFields
      })

      const query = mockSql.mock.calls[0]?.[0] as unknown as string[]
      expect(query.join('')).not.toMatch(
        /buy_link_id|image_ids|cover_image_id|project_id/
      )
    })

    it('scopes an update to the release', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])

      await savePublishedEditionFromFields(
        RELEASE_ID,
        { ...editionFields },
        EDITION_ID
      )

      // UPDATE params: catalog, size, format, date, publisher, id, release
      const params = mockSql.mock.calls[0]
      expect(params?.[6]).toBe(EDITION_ID)
      expect(params?.[7]).toBe(RELEASE_ID)
    })

    it("rejects an update to another release's edition", async () => {
      // the release-scoped UPDATE matches no row
      mockSql.mockResolvedValueOnce([])

      await expect(
        savePublishedEditionFromFields(
          RELEASE_ID,
          { ...editionFields },
          OTHER_EDITION_ID
        )
      ).rejects.toThrow('Failed to update published edition.')
    })

    it('creates an inline publisher from just a name', async () => {
      const { publisherId: _publisherId, ...withoutPublisher } =
        editionFields
      mockSql
        .mockResolvedValueOnce([]) // publisher name lookup
        .mockResolvedValueOnce([publisherFixtureAlpha]) // publisher INSERT
        .mockResolvedValueOnce([publishedEditionFixtureAlpha])

      await savePublishedEditionFromFields(RELEASE_ID, {
        ...withoutPublisher,
        'publisher.name': 'Soap Library'
      })

      expect(mockSql).toHaveBeenCalledTimes(3)
      expect(mockSql.mock.calls[2]?.[5]).toBe(
        publisherFixtureAlpha.id
      )
    })

    it('saves without the optional fields', async () => {
      mockSql.mockResolvedValueOnce([publishedEditionFixtureAlpha])

      await savePublishedEditionFromFields(RELEASE_ID, {
        format: 'Digital',
        publishDate: '2020-01-01',
        publisherId: publisherFixtureAlpha.id,
        catalogNumber: '',
        editionSize: ''
      })

      expect(mockSql.mock.calls[0]?.[1]).toBeNull()
      expect(mockSql.mock.calls[0]?.[2]).toBeNull()
    })

    it('throws for an invalid format', async () => {
      await expect(
        savePublishedEditionFromFields(RELEASE_ID, {
          ...editionFields,
          format: '8-track'
        })
      ).rejects.toThrow(/invalid published edition data/i)
      expect(mockSql).not.toHaveBeenCalled()
    })
  })

  describe('#syncReleasePublishedEditions', () => {
    it('rejects unauthenticated callers', async () => {
      ;(auth as unknown as jest.Mock).mockResolvedValueOnce(null)

      await expect(
        syncReleasePublishedEditions(RELEASE_ID, [])
      ).rejects.toThrow()
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('creates new, updates edited, keeps existing, then deletes the rest', async () => {
      mockSql
        .mockResolvedValueOnce([
          { ...publishedEditionFixtureAlpha, id: OTHER_EDITION_ID }
        ]) // UPDATE edited
        .mockResolvedValueOnce([publishedEditionFixtureAlpha]) // INSERT new
        .mockResolvedValueOnce([]) // DELETE

      await syncReleasePublishedEditions(RELEASE_ID, [
        {
          kind: 'existing',
          id: '55555555-5555-4555-8555-555555555555'
        },
        {
          kind: 'edited',
          id: OTHER_EDITION_ID,
          fields: { ...editionFields }
        },
        { kind: 'new', fields: { ...editionFields } }
      ])

      expect(mockSql).toHaveBeenCalledTimes(3)
      const deleteCall = mockSql.mock.calls[2]
      expect(
        (deleteCall?.[0] as unknown as string[]).join('')
      ).toMatch(/DELETE FROM published_editions/)
      expect(deleteCall?.[1]).toBe(RELEASE_ID)
      expect(deleteCall?.[2]).toEqual([
        '55555555-5555-4555-8555-555555555555',
        OTHER_EDITION_ID,
        EDITION_ID
      ])
    })

    it('removes the editions it created when a later one fails', async () => {
      mockSql
        .mockResolvedValueOnce([publishedEditionFixtureAlpha]) // INSERT new
        .mockRejectedValueOnce(new Error('db down')) // INSERT new
        .mockResolvedValueOnce([]) // DELETE created

      await expect(
        syncReleasePublishedEditions(RELEASE_ID, [
          { kind: 'new', fields: { ...editionFields } },
          { kind: 'new', fields: { ...editionFields } }
        ])
      ).rejects.toThrow()

      expect(mockSql).toHaveBeenCalledTimes(3)
      const deleteCall = mockSql.mock.calls[2]
      expect(
        (deleteCall?.[0] as unknown as string[]).join('')
      ).toMatch(/DELETE FROM published_editions/)
      expect(deleteCall?.[1]).toBe(RELEASE_ID)
      expect(deleteCall?.[2]).toEqual([EDITION_ID])
    })

    it('removes the editions it created when the final delete fails', async () => {
      mockSql
        .mockResolvedValueOnce([publishedEditionFixtureAlpha]) // INSERT new
        .mockRejectedValueOnce(new Error('db down')) // DELETE unlisted
        .mockResolvedValueOnce([]) // DELETE created

      await expect(
        syncReleasePublishedEditions(RELEASE_ID, [
          { kind: 'new', fields: { ...editionFields } }
        ])
      ).rejects.toThrow('db down')

      expect(mockSql).toHaveBeenCalledTimes(3)
      expect(mockSql.mock.calls[2]?.[1]).toBe(RELEASE_ID)
      expect(mockSql.mock.calls[2]?.[2]).toEqual([EDITION_ID])
    })

    it('deletes every edition when none are kept', async () => {
      mockSql.mockResolvedValueOnce([])

      await syncReleasePublishedEditions(RELEASE_ID, [])

      expect(mockSql).toHaveBeenCalledTimes(1)
      expect(mockSql.mock.calls[0]?.[2]).toEqual([])
    })
  })
})
