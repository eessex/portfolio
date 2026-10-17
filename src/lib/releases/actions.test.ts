import { updateTag } from 'next/cache'

import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import { deleteRelease, editRelease } from '@/lib/releases/actions'
import {
  newReleaseFixtureAlpha,
  releaseFixtureAlpha
} from '@/lib/releases/fixtures'
import type { CreateRelease, Release } from '@/lib/releases/types'
import { generateUniqueSlug } from '@/lib/slug/data'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/slug/data', () => ({
  generateUniqueSlug: jest.fn()
}))
const mockGenerateUniqueSlug = jest.mocked(generateUniqueSlug)

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

jest.mock('@/lib/images/actions', () => ({
  resolveOrderedImageIds: jest.fn()
}))
const mockResolveOrderedImageIds = jest.mocked(resolveOrderedImageIds)

jest.mock('@/lib/embed-codes/actions', () => ({
  resolveOrderedEmbedCodeIds: jest.fn()
}))
const mockResolveOrderedEmbedCodeIds = jest.mocked(
  resolveOrderedEmbedCodeIds
)

jest.mock('@/lib/links/actions', () => ({
  resolveOrderedLinkIds: jest.fn()
}))
const mockResolveOrderedLinkIds = jest.mocked(resolveOrderedLinkIds)

const COVER_IMAGE_ID = '11111111-1111-4111-8111-111111111111'
const IMAGE_ID = '44444444-4444-4444-8444-444444444444'
const EMBED_CODE_ID = '22222222-2222-4222-8222-222222222222'
const OTHER_EMBED_CODE_ID = '33333333-3333-4333-8333-333333333333'

describe('Release Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGenerateUniqueSlug.mockResolvedValue(releaseFixtureAlpha.slug)
    mockResolveOrderedImageIds.mockResolvedValue({
      coverImageId: undefined,
      imageIds: []
    })
    mockResolveOrderedEmbedCodeIds.mockResolvedValue({
      embedCodeIds: []
    })
    mockResolveOrderedLinkIds.mockResolvedValue({ linkIds: [] })
  })

  it('rejects unauthenticated callers', async () => {
    const mockAuth = auth as unknown as jest.Mock
    mockAuth.mockResolvedValueOnce(null)
    const res = await deleteRelease(releaseFixtureAlpha)

    expect(res).toEqual({
      ok: false,
      message: 'You must be signed in to perform this action.'
    })
    expect(mockSql).not.toHaveBeenCalled()
  })

  describe('#deleteRelease', () => {
    it('can delete a release', async () => {
      mockSql.mockResolvedValueOnce([releaseFixtureAlpha])
      const res = await deleteRelease(releaseFixtureAlpha)

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('releases')
      expect(updateTag).toHaveBeenCalledWith('releases:authed')
      expect(updateTag).toHaveBeenCalledWith('releases:public')
      expect(updateTag).toHaveBeenCalledWith(
        `release:${releaseFixtureAlpha.id}`
      )
      expect(updateTag).toHaveBeenCalledWith('published-editions')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteRelease(releaseFixtureAlpha)

      expect(res!.message).toBe('Failed to delete release: DB error.')
    })
  })

  describe('#editRelease', () => {
    it('can edit an existing release', async () => {
      mockSql
        .mockResolvedValueOnce([releaseFixtureAlpha]) // fetchReleaseById
        .mockResolvedValueOnce([releaseFixtureAlpha]) // UPDATE ... RETURNING *
      mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
        embedCodeIds: [EMBED_CODE_ID]
      })
      const res = await editRelease(
        formDataFromObject({
          ...releaseFixtureAlpha,
          isPublished: 'on'
        }),
        releaseFixtureAlpha.id
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Release)?.title).toEqual('Test Release')
      expect(mockGenerateUniqueSlug).toHaveBeenCalledWith(
        'Test Release',
        'releases',
        releaseFixtureAlpha.id
      )
      expect(updateTag).toHaveBeenCalledWith('releases')
      expect(updateTag).toHaveBeenCalledWith(
        `release:${releaseFixtureAlpha.id}`
      )

      expect(mockSql.mock.calls[1]?.[4]).toEqual([EMBED_CODE_ID])
      expect(mockSql.mock.calls[1]?.[6]).toBe(true)
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('unpublishes a release when the Published checkbox is unchecked', async () => {
      mockSql
        .mockResolvedValueOnce([releaseFixtureAlpha])
        .mockResolvedValueOnce([releaseFixtureAlpha])

      const { isPublished: _omit, ...withoutPublished } =
        releaseFixtureAlpha
      await editRelease(
        formDataFromObject(withoutPublished),
        releaseFixtureAlpha.id
      )

      expect(mockSql.mock.calls[1]?.[6]).toBe(false)
    })

    it('merges submitted fields with the existing release on update', async () => {
      mockSql
        .mockResolvedValueOnce([releaseFixtureAlpha])
        .mockResolvedValueOnce([releaseFixtureAlpha])

      await editRelease(
        formDataFromObject({
          title: 'Updated Title',
          type: releaseFixtureAlpha.type,
          releaseDate: releaseFixtureAlpha.releaseDate
        }),
        releaseFixtureAlpha.id
      )

      expect(mockSql.mock.calls[1]?.[1]).toBe(
        releaseFixtureAlpha.artist
      )
      expect(mockSql.mock.calls[1]?.[10]).toBe(
        releaseFixtureAlpha.shortDescription
      )
    })

    it('can create a new release', async () => {
      mockSql.mockResolvedValueOnce([releaseFixtureAlpha])
      mockResolveOrderedImageIds.mockResolvedValueOnce({
        coverImageId: COVER_IMAGE_ID,
        imageIds: [IMAGE_ID]
      })
      const res = await editRelease(
        formDataFromObject({
          ...newReleaseFixtureAlpha,
          isPublished: 'on'
        })
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Release)?.id).toEqual(
        releaseFixtureAlpha.id
      )
      expect(mockGenerateUniqueSlug).toHaveBeenCalledWith(
        'Test Release',
        'releases',
        undefined
      )
      expect(updateTag).toHaveBeenCalledWith('releases')
      expect(mockSql.mock.calls[0]?.[2]).toBe(COVER_IMAGE_ID)
      expect(mockSql.mock.calls[0]?.[5]).toEqual([IMAGE_ID])
      expect(mockSql.mock.calls[0]?.[14]).toBe('album')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('writes the resolved embedCodeIds, in order, to the saved row', async () => {
      mockSql
        .mockResolvedValueOnce([releaseFixtureAlpha])
        .mockResolvedValueOnce([releaseFixtureAlpha])
      mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
        embedCodeIds: [OTHER_EMBED_CODE_ID, EMBED_CODE_ID]
      })

      await editRelease(
        formDataFromObject({
          ...releaseFixtureAlpha,
          isPublished: 'on'
        }),
        releaseFixtureAlpha.id
      )

      expect(mockSql.mock.calls[1]?.[4]).toEqual([
        OTHER_EMBED_CODE_ID,
        EMBED_CODE_ID
      ])
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editRelease(
        formDataFromObject({
          ...newReleaseFixtureAlpha,
          isPublished: 'on'
        })
      )

      expect(res!.message).toBe('Failed to save release: DB error.')
    })

    it('can handle validation errors when releaseDate is missing', async () => {
      const invalid: Partial<CreateRelease> = {
        ...newReleaseFixtureAlpha,
        isPublished: 'on' as unknown as boolean
      }
      delete invalid.releaseDate
      const res = await editRelease(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate release.')
      expect(res!.errors).toEqual({ releaseDate: ['Required'] })
    })

    it('can handle validation errors when type is missing', async () => {
      const invalid: Partial<CreateRelease> = {
        ...newReleaseFixtureAlpha,
        isPublished: 'on' as unknown as boolean
      }
      delete invalid.type
      const res = await editRelease(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate release.')
      expect(res!.errors).toEqual({ type: ['Required'] })
    })

    it('passes the raw submitted data to the ordered id resolvers', async () => {
      mockSql.mockResolvedValueOnce([releaseFixtureAlpha])

      await editRelease(
        formDataFromObject({
          ...newReleaseFixtureAlpha,
          isPublished: 'on',
          'images[]': '',
          'images[0].id': COVER_IMAGE_ID
        })
      )

      expect(mockResolveOrderedImageIds).toHaveBeenCalledWith(
        expect.objectContaining({
          'images[0].id': COVER_IMAGE_ID
        })
      )
    })
  })
})
