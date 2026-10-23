import { updateTag } from 'next/cache'

import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import { syncReleasePublishedEditions } from '@/lib/published-editions/actions'
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

jest.mock('@/lib/published-editions/actions', () => ({
  syncReleasePublishedEditions: jest.fn()
}))
const mockSyncEditions = jest.mocked(syncReleasePublishedEditions)

const PUBLISHER_ID = '66666666-6666-4666-8666-666666666666'
const EDITION_ID = '77777777-7777-4777-8777-777777777777'

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
      expect(updateTag).toHaveBeenCalledWith(
        `release:${releaseFixtureAlpha.id}`
      )
      expect(updateTag).not.toHaveBeenCalledWith('published-editions')
    })

    it('invalidates other caches embedding inline-edited items', async () => {
      mockSql.mockResolvedValueOnce([releaseFixtureAlpha])
      await deleteRelease(releaseFixtureAlpha)

      for (const tag of ['projects', 'events', 'settings']) {
        expect(updateTag).toHaveBeenCalledWith(tag)
      }
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
          projectId: releaseFixtureAlpha.projectId,
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

    it('requires a project on create', async () => {
      const { projectId: _omit, ...invalid } = newReleaseFixtureAlpha
      const res = await editRelease(
        formDataFromObject({ ...invalid, isPublished: 'on' })
      )

      expect(res!.message).toBe('Failed to validate release.')
      expect(res!.errors).toEqual({
        projectId: ['Select a project.']
      })
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('rejects removing the project on update', async () => {
      // an emptied single picker submits its id field as ''
      const res = await editRelease(
        formDataFromObject({
          ...newReleaseFixtureAlpha,
          isPublished: 'on',
          projectId: ''
        }),
        releaseFixtureAlpha.id
      )

      expect(res!.errors).toEqual({
        projectId: ['Select a project.']
      })
      expect(mockSql).not.toHaveBeenCalled()
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

    describe('published editions', () => {
      const { releaseDate: _releaseDate, ...withoutDate } =
        newReleaseFixtureAlpha

      function releaseFormData(editions: Record<string, string>) {
        return formDataFromObject({
          ...withoutDate,
          isPublished: 'on',
          'publishedEditions[]': '',
          ...editions
        })
      }

      it('requires at least one edition, writing nothing', async () => {
        const res = await editRelease(releaseFormData({}))

        expect(res).toEqual({
          ok: false,
          message: 'Failed to validate release.',
          errors: {
            publishedEditions: ['Add at least one published edition.']
          }
        })
        expect(mockSql).not.toHaveBeenCalled()
        expect(mockSyncEditions).not.toHaveBeenCalled()
      })

      it('rejects an invalid edition before writing anything', async () => {
        const res = await editRelease(
          releaseFormData({
            'publishedEditions[0].format': 'LP',
            'publishedEditions[0].publishDate': '2020-01-01'
          })
        )

        expect(res?.errors).toEqual({
          publishedEditions: ['Edition 1 needs a publisher.']
        })
        expect(mockSql).not.toHaveBeenCalled()
      })

      it('sets the release date from the earliest new edition', async () => {
        mockSql.mockResolvedValueOnce([releaseFixtureAlpha])

        const res = await editRelease(
          releaseFormData({
            'publishedEditions[0].format': 'Digital',
            'publishedEditions[0].publishDate': '2021-03-01',
            'publishedEditions[0].publisherId': PUBLISHER_ID,
            'publishedEditions[1].format': 'LP',
            'publishedEditions[1].publishDate': '2020-06-15',
            'publishedEditions[1].publisherId': PUBLISHER_ID
          })
        )

        expect(res?.ok).toBe(true)
        const releaseDate = mockSql.mock.calls[0]?.[9] as Date
        expect(releaseDate.toISOString()).toMatch(/^2020-06-15/)
      })

      it("includes an untouched edition's stored date on update", async () => {
        mockSql
          .mockResolvedValueOnce([
            { publish_date: new Date('2019-01-01') }
          ]) // existing edition dates
          .mockResolvedValueOnce([releaseFixtureAlpha]) // fetchReleaseById
          .mockResolvedValueOnce([releaseFixtureAlpha]) // UPDATE

        await editRelease(
          releaseFormData({
            'publishedEditions[0].id': EDITION_ID,
            'publishedEditions[1].format': 'LP',
            'publishedEditions[1].publishDate': '2020-06-15',
            'publishedEditions[1].publisherId': PUBLISHER_ID
          }),
          releaseFixtureAlpha.id
        )

        // scoped to this release's editions
        expect(mockSql.mock.calls[0]?.[1]).toBe(
          releaseFixtureAlpha.id
        )
        expect(mockSql.mock.calls[0]?.[2]).toEqual([EDITION_ID])
        const releaseDate = mockSql.mock.calls[2]?.[9] as Date
        expect(releaseDate.toISOString()).toMatch(/^2019-01-01/)
      })

      it('syncs the editions after saving the release', async () => {
        mockSql.mockResolvedValueOnce([releaseFixtureAlpha])

        await editRelease(
          releaseFormData({
            'publishedEditions[0].format': 'LP',
            'publishedEditions[0].publishDate': '2020-06-15',
            'publishedEditions[0].publisher.name': 'Soap Library'
          })
        )

        expect(mockSyncEditions).toHaveBeenCalledWith(
          releaseFixtureAlpha.id,
          [
            {
              kind: 'new',
              fields: {
                format: 'LP',
                publishDate: '2020-06-15',
                'publisher.name': 'Soap Library'
              }
            }
          ]
        )
        expect(updateTag).toHaveBeenCalledWith('publishers')
      })

      it('deletes a new release whose editions fail to save', async () => {
        mockSql.mockResolvedValue([releaseFixtureAlpha])
        mockSyncEditions.mockRejectedValueOnce(new Error('db down'))

        const res = await editRelease(
          releaseFormData({
            'publishedEditions[0].format': 'LP',
            'publishedEditions[0].publishDate': '2020-06-15',
            'publishedEditions[0].publisher.name': 'Soap Library'
          })
        )

        expect(res?.ok).toBe(false)
        const lastCall = mockSql.mock.calls.at(-1)
        expect(
          (lastCall?.[0] as unknown as string[]).join('')
        ).toMatch(/DELETE FROM releases/)
        expect(lastCall?.[1]).toBe(releaseFixtureAlpha.id)
      })

      it('keeps an updated release whose editions fail to save', async () => {
        mockSql.mockResolvedValue([releaseFixtureAlpha])
        mockSyncEditions.mockRejectedValueOnce(new Error('db down'))

        const res = await editRelease(
          releaseFormData({
            'publishedEditions[0].format': 'LP',
            'publishedEditions[0].publishDate': '2020-06-15',
            'publishedEditions[0].publisher.name': 'Soap Library'
          }),
          releaseFixtureAlpha.id
        )

        expect(res?.ok).toBe(false)
        for (const [strings] of mockSql.mock.calls) {
          expect(
            (strings as unknown as string[]).join('')
          ).not.toMatch(/DELETE FROM releases/)
        }
        expect(updateTag).toHaveBeenCalledWith(
          `release:${releaseFixtureAlpha.id}`
        )
      })

      it("re-derives an updated release's date when its editions fail to save", async () => {
        mockSql.mockResolvedValue([releaseFixtureAlpha])
        mockSyncEditions.mockRejectedValueOnce(new Error('db down'))

        await editRelease(
          releaseFormData({
            'publishedEditions[0].format': 'LP',
            'publishedEditions[0].publishDate': '2019-06-15',
            'publishedEditions[0].publisher.name': 'Soap Library'
          }),
          releaseFixtureAlpha.id
        )

        const lastCall = mockSql.mock.calls.at(-1)
        const text = (lastCall?.[0] as unknown as string[]).join('')
        expect(text).toMatch(/UPDATE releases\s+SET release_date/)
        expect(text).toMatch(/MIN\(publish_date\)/)
        expect(lastCall?.slice(1)).toEqual([
          releaseFixtureAlpha.id,
          releaseFixtureAlpha.id
        ])
      })

      it('returns the sync error even if re-dating the release fails', async () => {
        mockSyncEditions.mockRejectedValueOnce(new Error('db down'))
        mockSql.mockImplementation(((
          strings: TemplateStringsArray
        ) =>
          strings.join('').includes('MIN(publish_date)')
            ? Promise.reject(new Error('still down'))
            : Promise.resolve([
                releaseFixtureAlpha
              ])) as unknown as typeof mockSql)

        const res = await editRelease(
          releaseFormData({
            'publishedEditions[0].format': 'LP',
            'publishedEditions[0].publishDate': '2019-06-15',
            'publishedEditions[0].publisher.name': 'Soap Library'
          }),
          releaseFixtureAlpha.id
        )

        expect(res).toMatchObject({ ok: false })
        expect(JSON.stringify(res)).not.toMatch(/still down/)
        expect(updateTag).toHaveBeenCalledWith(
          `release:${releaseFixtureAlpha.id}`
        )
      })

      it('leaves editions alone when the picker is not submitted', async () => {
        mockSql.mockResolvedValueOnce([releaseFixtureAlpha])

        await editRelease(
          formDataFromObject({
            ...newReleaseFixtureAlpha,
            isPublished: 'on'
          })
        )

        expect(mockSyncEditions).not.toHaveBeenCalled()
      })
    })

    describe('artist', () => {
      const PROJECT_ID = '99999999-9999-4999-8999-999999999999'

      function releaseWith(fields: Record<string, string>) {
        return formDataFromObject({
          ...newReleaseFixtureAlpha,
          isPublished: 'on',
          projectId: PROJECT_ID,
          ...fields
        })
      }

      it("saves a blank artist as the project's current name", async () => {
        mockSql
          .mockResolvedValueOnce([{ title: 'Joe Smith' }]) // project
          .mockResolvedValueOnce([releaseFixtureAlpha]) // INSERT

        await editRelease(releaseWith({ artist: '' }))

        expect(mockSql.mock.calls[0]?.[1]).toBe(PROJECT_ID)
        expect(mockSql.mock.calls[1]?.[1]).toBe('Joe Smith')
      })

      it('saves a typed name as given, without a project lookup', async () => {
        mockSql.mockResolvedValueOnce([releaseFixtureAlpha])

        await editRelease(
          releaseWith({ artist: ' Joe Smith & Friends ' })
        )

        expect(mockSql).toHaveBeenCalledTimes(1)
        expect(mockSql.mock.calls[0]?.[1]).toBe('Joe Smith & Friends')
      })

      it("keeps a name matching the project's (a snapshot)", async () => {
        mockSql.mockResolvedValueOnce([releaseFixtureAlpha])

        await editRelease(releaseWith({ artist: 'Joe Smith' }))

        expect(mockSql.mock.calls[0]?.[1]).toBe('Joe Smith')
      })

      it('replaces a cleared artist with the project name on update', async () => {
        mockSql
          .mockResolvedValueOnce([{ title: 'Joe Smith' }]) // project
          .mockResolvedValueOnce([
            { ...releaseFixtureAlpha, artist: 'Old Name' }
          ]) // fetchReleaseById
          .mockResolvedValueOnce([releaseFixtureAlpha]) // UPDATE

        await editRelease(
          releaseWith({ artist: '' }),
          releaseFixtureAlpha.id
        )

        expect(mockSql.mock.calls[2]?.[1]).toBe('Joe Smith')
      })
    })
  })
})
