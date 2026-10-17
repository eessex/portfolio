import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  deleteEmbedCode,
  editEmbedCode,
  resolveOrderedEmbedCodeIds,
  saveEmbedCodeFromFields
} from '@/lib/embed-codes/actions'
import { fetchEmbedCodeMetadata } from '@/lib/embed-codes/cover-image'
import {
  createEmbedCodeFixture,
  embedCodeFixture
} from '@/lib/embed-codes/fixtures'
import { resolveOEmbed } from '@/lib/embed-codes/oembed'
import type {
  CreateEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/schemas/db'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

jest.mock('@/lib/embed-codes/cover-image', () => ({
  fetchEmbedCodeMetadata: jest.fn()
}))
const fetchEmbedCodeMetadataMock = jest.mocked(fetchEmbedCodeMetadata)

jest.mock('@/lib/embed-codes/oembed', () => ({
  resolveOEmbed: jest.fn()
}))
const resolveOEmbedMock = jest.mocked(resolveOEmbed)

describe('Embed Code Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetchEmbedCodeMetadataMock.mockResolvedValue({})
    resolveOEmbedMock.mockResolvedValue(undefined)
  })

  describe('#deleteEmbedCode', () => {
    it('can delete a embedCode', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      const res = await deleteEmbedCode(embedCodeFixture)

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('embed-codes')
      // embed codes are embedded into cached release/event/project pages
      expect(updateTag).toHaveBeenCalledWith('releases')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteEmbedCode(embedCodeFixture)

      expect(res!.message).toBe(
        'Failed to delete embed code: DB error.'
      )
    })
  })

  describe('#editEmbedCode', () => {
    it('can edit an existing embedCode', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      const res = await editEmbedCode(
        formDataFromObject(embedCodeFixture)
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as EmbedCode)?.caption).toEqual(
        'This is an embed code for testing purposes.'
      )
      expect(updateTag).toHaveBeenCalledWith('embed-codes')
    })

    it('can create a new embedCode', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      const res = await editEmbedCode(
        formDataFromObject(createEmbedCodeFixture)
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as EmbedCode)?.caption).toEqual(
        'This is an embed code for testing purposes.'
      )
      expect((res?.res as EmbedCode)?.id).toEqual(
        '123e4567-e89b-12d3-a456-426614174000'
      )
      expect(updateTag).toHaveBeenCalledWith('embed-codes')
      // embed codes are embedded into cached release/event/project pages
      expect(updateTag).toHaveBeenCalledWith('releases')
    })

    it('normalizes empty optional fields to undefined before saving', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      await editEmbedCode(
        formDataFromObject({ ...createEmbedCodeFixture, caption: '' })
      )

      const [, caption] = mockSql.mock
        .calls[0] as unknown as unknown[]
      expect(caption).toBeUndefined()
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editEmbedCode(
        formDataFromObject(embedCodeFixture)
      )

      expect(res!.message).toBe(
        'Failed to save embed code: DB error.'
      )
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreateEmbedCode> = {
        ...createEmbedCodeFixture
      }
      delete invalid.src
      const res = await editEmbedCode(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate embed code.')
      expect(res!.errors).toEqual({ src: ['Required'] })
    })

    it('fetches and stores a cover image when creating', async () => {
      fetchEmbedCodeMetadataMock.mockResolvedValueOnce({
        coverImageId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      })
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      await editEmbedCode(formDataFromObject(createEmbedCodeFixture))

      expect(fetchEmbedCodeMetadataMock).toHaveBeenCalledWith(
        createEmbedCodeFixture.host,
        createEmbedCodeFixture.src
      )
      const [, , , coverImageId] = mockSql.mock
        .calls[0] as unknown as unknown[]
      expect(coverImageId).toEqual(
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      )
    })

    it('sets the title from oEmbed when creating', async () => {
      fetchEmbedCodeMetadataMock.mockResolvedValueOnce({
        title: 'Fetched From oEmbed'
      })
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      await editEmbedCode(formDataFromObject(createEmbedCodeFixture))

      const [, , , , , , title] = mockSql.mock
        .calls[0] as unknown as unknown[]
      expect(title).toEqual('Fetched From oEmbed')
    })

    it('does not fetch or upload a cover image when updating', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      await editEmbedCode(
        formDataFromObject(embedCodeFixture),
        embedCodeFixture.id
      )

      expect(fetchEmbedCodeMetadataMock).not.toHaveBeenCalled()
    })

    it('regenerates the title from oEmbed when updating, without fetching a cover image', async () => {
      resolveOEmbedMock.mockResolvedValueOnce({
        title: 'Refreshed Title'
      })
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      await editEmbedCode(
        formDataFromObject(embedCodeFixture),
        embedCodeFixture.id
      )

      expect(resolveOEmbedMock).toHaveBeenCalledWith(
        embedCodeFixture.host,
        embedCodeFixture.src
      )
      expect(fetchEmbedCodeMetadataMock).not.toHaveBeenCalled()
      const [, , , , , , title] = mockSql.mock
        .calls[1] as unknown as unknown[]
      expect(title).toEqual('Refreshed Title')
    })

    it('keeps the existing title when updating and oEmbed resolves nothing', async () => {
      // The real form no longer has a Title input at all, so a genuine
      // submission never includes a `title` entry — simulate that here
      // rather than relying on embedCodeFixture's own title value.
      resolveOEmbedMock.mockResolvedValueOnce(undefined)
      mockSql.mockResolvedValueOnce([
        { ...embedCodeFixture, title: 'Original Title' }
      ])
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      await editEmbedCode(
        formDataFromObject({ ...embedCodeFixture, title: undefined }),
        embedCodeFixture.id
      )

      const [, , , , , , title] = mockSql.mock
        .calls[1] as unknown as unknown[]
      expect(title).toEqual('Original Title')
    })

    it('keeps the existing title when updating and oEmbed throws', async () => {
      resolveOEmbedMock.mockRejectedValueOnce(
        new Error('network error')
      )
      mockSql.mockResolvedValueOnce([
        { ...embedCodeFixture, title: 'Original Title' }
      ])
      mockSql.mockResolvedValueOnce([embedCodeFixture])
      await editEmbedCode(
        formDataFromObject({ ...embedCodeFixture, title: undefined }),
        embedCodeFixture.id
      )

      const [, , , , , , title] = mockSql.mock
        .calls[1] as unknown as unknown[]
      expect(title).toEqual('Original Title')
    })
  })

  describe('#saveEmbedCodeFromFields', () => {
    it('creates an embed code from raw fields, resolving metadata first', async () => {
      fetchEmbedCodeMetadataMock.mockResolvedValueOnce({
        coverImageId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        title: 'Fetched From oEmbed'
      })
      mockSql.mockResolvedValueOnce([embedCodeFixture])

      const res = await saveEmbedCodeFromFields({
        ...createEmbedCodeFixture
      })

      expect(fetchEmbedCodeMetadataMock).toHaveBeenCalledWith(
        createEmbedCodeFixture.host,
        createEmbedCodeFixture.src
      )
      expect(res.caption).toEqual(
        'This is an embed code for testing purposes.'
      )
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('normalizes raw checkbox/empty-string fields before validating', async () => {
      mockSql.mockResolvedValueOnce([embedCodeFixture])

      await saveEmbedCodeFromFields({
        ...createEmbedCodeFixture,
        caption: ''
      })

      const [, caption] = mockSql.mock
        .calls[0] as unknown as unknown[]
      expect(caption).toBeUndefined()
    })

    it('throws a descriptive error on invalid fields', async () => {
      const invalid: Partial<CreateEmbedCode> = {
        ...createEmbedCodeFixture
      }
      delete invalid.src

      await expect(saveEmbedCodeFromFields(invalid)).rejects.toThrow(
        'Invalid embed code data: Required'
      )
      expect(mockSql).not.toHaveBeenCalled()
    })
  })

  describe('#resolveOrderedEmbedCodeIds', () => {
    it('returns all entries as embedCodeIds, in order', async () => {
      const result = await resolveOrderedEmbedCodeIds({
        'embedCodes[0].id': 'embed-1',
        'embedCodes[1].id': 'embed-2',
        'embedCodes[2].id': 'embed-3'
      })

      expect(result).toEqual({
        embedCodeIds: ['embed-1', 'embed-2', 'embed-3']
      })
    })

    it('removes all indexed keys from the input data object', async () => {
      const data: Record<string, unknown> = {
        'embedCodes[0].id': 'embed-1'
      }

      await resolveOrderedEmbedCodeIds(data)

      expect(data).toEqual({})
    })

    it('updates an edited existing entry (id + fields) in place', async () => {
      mockSql
        .mockResolvedValueOnce([embedCodeFixture]) // fetchEmbedCodesByIds
        .mockResolvedValueOnce([embedCodeFixture]) // UPDATE ... RETURNING *

      const result = await resolveOrderedEmbedCodeIds({
        'embedCodes[0].id': 'embed-1',
        'embedCodes[0].caption': 'Edited caption',
        'embedCodes[0].type': createEmbedCodeFixture.type,
        'embedCodes[0].host': createEmbedCodeFixture.host,
        'embedCodes[0].src': createEmbedCodeFixture.src
      })

      expect(result).toEqual({
        embedCodeIds: [embedCodeFixture.id]
      })
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('creates pending new embed codes in place, preserving position', async () => {
      fetchEmbedCodeMetadataMock.mockResolvedValueOnce({})
      mockSql.mockResolvedValueOnce([
        {
          ...embedCodeFixture,
          id: '44444444-4444-4444-8444-444444444444'
        }
      ])

      const result = await resolveOrderedEmbedCodeIds({
        'embedCodes[0].id': 'embed-1',
        'embedCodes[1].host': createEmbedCodeFixture.host,
        'embedCodes[1].type': createEmbedCodeFixture.type,
        'embedCodes[1].src': createEmbedCodeFixture.src
      })

      expect(result).toEqual({
        embedCodeIds: [
          'embed-1',
          '44444444-4444-4444-8444-444444444444'
        ]
      })
    })

    it('propagates validation errors from an inline-created entry', async () => {
      await expect(
        resolveOrderedEmbedCodeIds({
          'embedCodes[0].host': createEmbedCodeFixture.host
        })
      ).rejects.toThrow(/Invalid embed code data/)
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('returns empty embedCodeIds when nothing is selected', async () => {
      const result = await resolveOrderedEmbedCodeIds({
        'embedCodes[]': ''
      })

      expect(result).toEqual({
        embedCodeIds: []
      })
    })

    it('ignores an untouched empty new slot', async () => {
      const result = await resolveOrderedEmbedCodeIds({
        'embedCodes[0].iframe': '',
        'embedCodes[0].type': '',
        'embedCodes[0].contentType': '',
        'embedCodes[0].caption': ''
      })

      expect(result).toEqual({
        embedCodeIds: []
      })
      expect(fetchEmbedCodeMetadataMock).not.toHaveBeenCalled()
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('drops empty new slots but keeps a filled one, preserving order', async () => {
      fetchEmbedCodeMetadataMock.mockResolvedValueOnce({})
      mockSql.mockResolvedValueOnce([
        {
          ...embedCodeFixture,
          id: '44444444-4444-4444-8444-444444444444'
        }
      ])

      const result = await resolveOrderedEmbedCodeIds({
        'embedCodes[0].id': 'embed-1',
        'embedCodes[1].iframe': '',
        'embedCodes[1].type': '',
        'embedCodes[1].caption': '',
        'embedCodes[2].host': createEmbedCodeFixture.host,
        'embedCodes[2].type': createEmbedCodeFixture.type,
        'embedCodes[2].src': createEmbedCodeFixture.src
      })

      expect(result).toEqual({
        embedCodeIds: [
          'embed-1',
          '44444444-4444-4444-8444-444444444444'
        ]
      })
    })

    it('supports a custom field prefix', async () => {
      const result = await resolveOrderedEmbedCodeIds(
        {
          'gallery[0].id': 'embed-1',
          'gallery[1].id': 'embed-2'
        },
        'gallery'
      )

      expect(result).toEqual({
        embedCodeIds: ['embed-1', 'embed-2']
      })
    })
  })
})
