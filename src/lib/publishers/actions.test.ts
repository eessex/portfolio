import { updateTag } from 'next/cache'

import { auth } from '@/auth'
import { sql } from '@/lib/db'
import {
  deletePublisher,
  editPublisher,
  resolvePublisherId,
  savePublisherFromFields
} from '@/lib/publishers/actions'
import {
  newPublisherFixtureAlpha,
  publisherFixtureAlpha
} from '@/lib/publishers/fixtures'
import type {
  CreatePublisher,
  Publisher
} from '@/lib/publishers/schemas/db'
import { formDataFromObject } from '@/test/helpers'

jest.mock('next/cache')

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

const existingPublisherRow = {
  ...publisherFixtureAlpha,
  releaseSlugs: []
}

describe('Publisher Actions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('rejects unauthenticated callers', async () => {
    const mockAuth = auth as unknown as jest.Mock
    mockAuth.mockResolvedValueOnce(null)
    const res = await deletePublisher(publisherFixtureAlpha)

    expect(res).toEqual({
      ok: false,
      message: 'You must be signed in to perform this action.'
    })
    expect(mockSql).not.toHaveBeenCalled()
  })

  describe('#deletePublisher', () => {
    it('can delete a publisher', async () => {
      mockSql.mockResolvedValueOnce([publisherFixtureAlpha])
      const res = await deletePublisher(publisherFixtureAlpha)

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('publishers')
      // publishers are embedded into cached published edition fetches
      expect(updateTag).toHaveBeenCalledWith('published-editions')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deletePublisher(publisherFixtureAlpha)

      expect(res!.message).toBe(
        'Failed to delete publisher: DB error.'
      )
    })

    it('refuses to delete the built-in publisher, whatever the client sends', async () => {
      mockSql.mockResolvedValueOnce([{ is_built_in: true }])
      const res = await deletePublisher({
        ...publisherFixtureAlpha,
        isBuiltIn: false
      })

      expect(res).toEqual({
        ok: false,
        message:
          'The Self-released publisher is built in and can’t be changed.'
      })
      // only the flag lookup, no DELETE
      expect(mockSql).toHaveBeenCalledTimes(1)
      expect(updateTag).not.toHaveBeenCalled()
    })
  })

  describe('built-in publisher', () => {
    it('refuses to update it', async () => {
      mockSql.mockResolvedValueOnce([
        { ...existingPublisherRow, is_built_in: true }
      ]) // fetchPublisherById

      const res = await editPublisher(
        formDataFromObject({ name: 'Renamed' }),
        publisherFixtureAlpha.id
      )

      expect(res?.ok).toBe(false)
      expect(res?.message).toMatch(/built in and can’t be changed/)
      expect(mockSql).toHaveBeenCalledTimes(1)
    })
  })

  describe('#editPublisher', () => {
    it('can edit an existing publisher', async () => {
      mockSql
        .mockResolvedValueOnce([existingPublisherRow]) // fetchPublisherById
        .mockResolvedValueOnce([publisherFixtureAlpha]) // UPDATE ... RETURNING *
      const res = await editPublisher(
        formDataFromObject(publisherFixtureAlpha),
        publisherFixtureAlpha.id
      )
      expect(res?.ok).toBe(true)
      expect((res?.res as Publisher)?.name).toEqual('Soap Library')
      expect(updateTag).toHaveBeenCalledWith('publishers')

      // second sql call is the UPDATE, scoped to the given id
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('merges submitted fields with the existing publisher on update', async () => {
      mockSql
        .mockResolvedValueOnce([existingPublisherRow])
        .mockResolvedValueOnce([publisherFixtureAlpha])

      // only name and type (required) are submitted; url should fall
      // back to the existing publisher's value rather than being
      // nulled out
      await editPublisher(
        formDataFromObject({
          name: 'Soap Library',
          type: publisherFixtureAlpha.type
        }),
        publisherFixtureAlpha.id
      )

      const [, name, type, url] = mockSql.mock
        .calls[1] as unknown as string[]
      expect(name).toBe('Soap Library')
      expect(type).toBe(publisherFixtureAlpha.type)
      expect(url).toBe(publisherFixtureAlpha.url)
    })

    it('can create a new publisher', async () => {
      mockSql.mockResolvedValueOnce([publisherFixtureAlpha])
      const res = await editPublisher(
        formDataFromObject(newPublisherFixtureAlpha)
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Publisher)?.name).toEqual('Soap Library')
      expect(updateTag).toHaveBeenCalledWith('publishers')
      expect(updateTag).toHaveBeenCalledWith('published-editions')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editPublisher(
        formDataFromObject(publisherFixtureAlpha)
      )

      expect(res!.message).toBe('Failed to save publisher: DB error.')
    })

    it('can handle errors fetching the existing publisher on update', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editPublisher(
        formDataFromObject(publisherFixtureAlpha),
        publisherFixtureAlpha.id
      )

      expect(res!.message).toBe('Failed to save publisher: DB error.')
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreatePublisher> = {
        ...newPublisherFixtureAlpha
      }
      delete invalid.name
      const res = await editPublisher(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate publisher.')
      expect(res!.errors).toEqual({ name: ['Required'] })
    })
  })

  describe('#savePublisherFromFields', () => {
    it('creates a publisher from raw field data', async () => {
      mockSql
        .mockResolvedValueOnce([]) // name lookup
        .mockResolvedValueOnce([publisherFixtureAlpha]) // INSERT

      const publisher = await savePublisherFromFields({
        name: newPublisherFixtureAlpha.name,
        type: newPublisherFixtureAlpha.type,
        url: newPublisherFixtureAlpha.url
      })

      expect(publisher.name).toBe('Soap Library')
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('reuses an existing publisher with the same name', async () => {
      mockSql.mockResolvedValueOnce([publisherFixtureAlpha])

      const publisher = await savePublisherFromFields({
        name: 'soap library'
      })

      expect(publisher.id).toBe(publisherFixtureAlpha.id)
      expect(mockSql).toHaveBeenCalledTimes(1)
      expect(mockSql.mock.calls[0]?.[1]).toBe('soap library')
    })

    it('creates a publisher from just a name, with no type', async () => {
      mockSql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { ...publisherFixtureAlpha, type: null, url: null }
        ])

      const publisher = await savePublisherFromFields({
        name: 'Test Label'
      })

      // INSERT params: name, type, url
      expect(mockSql.mock.calls[1]?.[1]).toBe('Test Label')
      expect(mockSql.mock.calls[1]?.[2]).toBeNull()
      expect(publisher.type).toBeUndefined()
    })

    it('updates an existing publisher when given an id', async () => {
      mockSql
        .mockResolvedValueOnce([existingPublisherRow])
        .mockResolvedValueOnce([publisherFixtureAlpha])

      const publisher = await savePublisherFromFields(
        {
          name: newPublisherFixtureAlpha.name,
          type: newPublisherFixtureAlpha.type,
          url: newPublisherFixtureAlpha.url
        },
        publisherFixtureAlpha.id
      )

      expect(publisher.id).toBe(publisherFixtureAlpha.id)
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('throws for invalid field data', async () => {
      await expect(
        savePublisherFromFields({ type: 'recordLabel' })
      ).rejects.toThrow(/invalid publisher data/i)
      expect(mockSql).not.toHaveBeenCalled()
    })
  })

  describe('#resolvePublisherId', () => {
    it('passes an existing publisherId straight through', async () => {
      const data: Record<string, unknown> = {
        publisherId: publisherFixtureAlpha.id
      }

      const id = await resolvePublisherId(data)

      expect(id).toBe(publisherFixtureAlpha.id)
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('updates the publisher when an id is submitted alongside edited fields', async () => {
      mockSql
        .mockResolvedValueOnce([existingPublisherRow])
        .mockResolvedValueOnce([publisherFixtureAlpha])
      const data: Record<string, unknown> = {
        publisherId: publisherFixtureAlpha.id,
        'publisher.name': 'Edited Name',
        'publisher.type': newPublisherFixtureAlpha.type,
        'publisher.url': newPublisherFixtureAlpha.url
      }

      const id = await resolvePublisherId(data)

      expect(id).toBe(publisherFixtureAlpha.id)
      expect(mockSql).toHaveBeenCalledTimes(2)
      expect(data).not.toHaveProperty(['publisher.name'])
      expect(data).not.toHaveProperty(['publisher.type'])
      expect(data).not.toHaveProperty(['publisher.url'])
    })

    it('creates a new publisher from inline fields when no publisherId is submitted', async () => {
      mockSql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([publisherFixtureAlpha])
      const data: Record<string, unknown> = {
        'publisher.name': newPublisherFixtureAlpha.name,
        'publisher.type': newPublisherFixtureAlpha.type,
        'publisher.url': newPublisherFixtureAlpha.url
      }

      const id = await resolvePublisherId(data)

      expect(id).toBe(publisherFixtureAlpha.id)
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('strips the inline-creation fields from data so they do not leak into the parent schema', async () => {
      mockSql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([publisherFixtureAlpha])
      const data: Record<string, unknown> = {
        'publisher.name': newPublisherFixtureAlpha.name,
        'publisher.type': newPublisherFixtureAlpha.type,
        'publisher.url': newPublisherFixtureAlpha.url
      }

      await resolvePublisherId(data)

      expect(data).not.toHaveProperty(['publisher.name'])
      expect(data).not.toHaveProperty(['publisher.type'])
      expect(data).not.toHaveProperty(['publisher.url'])
    })

    it('returns undefined when neither an id nor inline fields are submitted', async () => {
      const id = await resolvePublisherId({})

      expect(id).toBeUndefined()
      expect(mockSql).not.toHaveBeenCalled()
    })
  })
})
