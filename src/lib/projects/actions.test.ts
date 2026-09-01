import { updateTag } from 'next/cache'

import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import { deleteProject, editProject } from '@/lib/projects/actions'
import {
  newProjectFixtureAlpha,
  projectFixtureAlpha
} from '@/lib/projects/fixtures'
import type { CreateProject, Project } from '@/lib/projects/types'
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

const EXISTING_IMAGE_ID_1 = '11111111-1111-4111-8111-111111111111'
const NEW_IMAGE_ID = '33333333-3333-4333-8333-333333333333'
const EXISTING_EMBED_CODE_ID = '22222222-2222-4222-8222-222222222222'
const NEW_EMBED_CODE_ID = '44444444-4444-4444-8444-444444444444'

describe('Project Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGenerateUniqueSlug.mockResolvedValue(projectFixtureAlpha.slug)
    mockResolveOrderedImageIds.mockResolvedValue({
      coverImageId: undefined,
      imageIds: []
    })
    mockResolveOrderedEmbedCodeIds.mockResolvedValue({
      embedCodeIds: [],
      featuredEmbedCodeId: undefined
    })
    mockResolveOrderedLinkIds.mockResolvedValue({ linkIds: [] })
  })

  it('rejects unauthenticated callers', async () => {
    const mockAuth = auth as unknown as jest.Mock
    mockAuth.mockResolvedValueOnce(null)
    const res = await deleteProject(projectFixtureAlpha)

    expect(res).toEqual({
      ok: false,
      message: 'You must be signed in to perform this action.'
    })
    expect(mockSql).not.toHaveBeenCalled()
  })

  describe('#deleteProject', () => {
    it('can delete a project', async () => {
      mockSql.mockResolvedValueOnce([projectFixtureAlpha])
      const res = await deleteProject(projectFixtureAlpha)

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('projects')
      expect(updateTag).toHaveBeenCalledWith('projects:authed')
      expect(updateTag).toHaveBeenCalledWith('projects:public')
      expect(updateTag).toHaveBeenCalledWith(
        `project:${projectFixtureAlpha.id}`
      )
      // projects are embedded into cached release/event pages
      expect(updateTag).toHaveBeenCalledWith('releases')
      expect(updateTag).toHaveBeenCalledWith('events')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteProject(projectFixtureAlpha)

      expect(res!.message).toBe('Failed to delete project: DB error.')
    })
  })

  describe('#editProject', () => {
    it('can edit an existing project', async () => {
      mockSql
        .mockResolvedValueOnce([projectFixtureAlpha]) // fetchProjectById
        .mockResolvedValueOnce([projectFixtureAlpha]) // UPDATE ... RETURNING *
      const res = await editProject(
        formDataFromObject({
          ...projectFixtureAlpha,
          isPublished: 'on'
        }),
        projectFixtureAlpha.id
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Project)?.title).toEqual('Test Project')
      expect(mockGenerateUniqueSlug).toHaveBeenCalledWith(
        'Test Project',
        'projects',
        projectFixtureAlpha.id
      )
      expect(updateTag).toHaveBeenCalledWith('projects')

      // second sql call is the UPDATE, scoped to the given id
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('merges submitted fields with the existing project on update', async () => {
      mockSql
        .mockResolvedValueOnce([projectFixtureAlpha])
        .mockResolvedValueOnce([projectFixtureAlpha])

      // only title is submitted; other fields should fall back to
      // the existing project's values rather than being nulled out
      await editProject(
        formDataFromObject({ title: 'Updated Title' }),
        projectFixtureAlpha.id
      )

      const [, , , , , , , isPublished, , shortDescription] = mockSql
        .mock.calls[1] as unknown as string[]
      expect(isPublished).toBe(projectFixtureAlpha.isPublished)
      expect(shortDescription).toBe(
        projectFixtureAlpha.shortDescription ?? null
      )
    })

    it('can create a new project', async () => {
      mockSql.mockResolvedValueOnce([projectFixtureAlpha])
      const res = await editProject(
        formDataFromObject({
          ...newProjectFixtureAlpha,
          isPublished: 'on'
        })
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Project)?.title).toEqual('Test Project')
      expect((res?.res as Project)?.id).toEqual(
        projectFixtureAlpha.id
      )
      expect(mockGenerateUniqueSlug).toHaveBeenCalledWith(
        'Test Project',
        'projects',
        undefined
      )
      expect(updateTag).toHaveBeenCalledWith('projects')
      // projects are embedded into cached release/event pages
      expect(updateTag).toHaveBeenCalledWith('releases')
      expect(updateTag).toHaveBeenCalledWith('events')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editProject(
        formDataFromObject({
          ...newProjectFixtureAlpha,
          isPublished: 'on'
        })
      )

      expect(res!.message).toBe('Failed to save project: DB error.')
    })

    it('can handle errors fetching the existing project on update', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editProject(
        formDataFromObject({
          ...projectFixtureAlpha,
          isPublished: 'on'
        }),
        projectFixtureAlpha.id
      )

      expect(res!.message).toBe('Failed to save project: DB error.')
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreateProject> = {
        ...newProjectFixtureAlpha,
        isPublished: 'on' as unknown as boolean
      }
      delete invalid.title
      const res = await editProject(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate project.')
      expect(res!.errors).toEqual({ title: ['Required'] })
    })

    describe('images picker (coverImageId + imageIds from order)', () => {
      it('passes the raw submitted data to resolveOrderedImageIds', async () => {
        mockSql
          .mockResolvedValueOnce([projectFixtureAlpha]) // fetchProjectById
          .mockResolvedValueOnce([projectFixtureAlpha]) // UPDATE

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on',
            'images[]': '',
            'images[0].id': EXISTING_IMAGE_ID_1
          }),
          projectFixtureAlpha.id
        )

        expect(mockResolveOrderedImageIds).toHaveBeenCalledWith(
          expect.objectContaining({
            'images[0].id': EXISTING_IMAGE_ID_1
          })
        )
      })

      it('writes the resolved coverImageId and imageIds to the saved row', async () => {
        mockSql
          .mockResolvedValueOnce([projectFixtureAlpha])
          .mockResolvedValueOnce([projectFixtureAlpha])
        mockResolveOrderedImageIds.mockResolvedValueOnce({
          coverImageId: NEW_IMAGE_ID,
          imageIds: [EXISTING_IMAGE_ID_1]
        })

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on'
          }),
          projectFixtureAlpha.id
        )

        expect(mockSql.mock.calls[1]?.[1]).toEqual(NEW_IMAGE_ID)
        expect(mockSql.mock.calls[1]?.[6]).toEqual([
          EXISTING_IMAGE_ID_1
        ])
      })

      it('clears both coverImageId and imageIds when nothing is selected', async () => {
        mockSql
          .mockResolvedValueOnce([projectFixtureAlpha])
          .mockResolvedValueOnce([projectFixtureAlpha])
        mockResolveOrderedImageIds.mockResolvedValueOnce({
          coverImageId: undefined,
          imageIds: []
        })

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on'
          }),
          projectFixtureAlpha.id
        )

        expect(mockSql.mock.calls[1]?.[1]).toBeNull()
        expect(mockSql.mock.calls[1]?.[6]).toEqual([])
      })
    })

    describe('embed codes picker (featuredEmbedCodeId + embedCodeIds)', () => {
      it('passes the raw submitted data to resolveOrderedEmbedCodeIds', async () => {
        mockSql
          .mockResolvedValueOnce([projectFixtureAlpha]) // fetchProjectById
          .mockResolvedValueOnce([projectFixtureAlpha]) // UPDATE

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on',
            'embedCodes[]': '',
            'embedCodes[0].id': EXISTING_EMBED_CODE_ID
          }),
          projectFixtureAlpha.id
        )

        expect(mockResolveOrderedEmbedCodeIds).toHaveBeenCalledWith(
          expect.objectContaining({
            'embedCodes[0].id': EXISTING_EMBED_CODE_ID
          })
        )
      })

      it('writes the resolved featuredEmbedCodeId and embedCodeIds to the saved row', async () => {
        mockSql
          .mockResolvedValueOnce([projectFixtureAlpha])
          .mockResolvedValueOnce([projectFixtureAlpha])
        mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
          featuredEmbedCodeId: NEW_EMBED_CODE_ID,
          embedCodeIds: [EXISTING_EMBED_CODE_ID]
        })

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on'
          }),
          projectFixtureAlpha.id
        )

        expect(mockSql.mock.calls[1]?.[3]).toEqual([
          EXISTING_EMBED_CODE_ID
        ])
        expect(mockSql.mock.calls[1]?.[5]).toEqual(NEW_EMBED_CODE_ID)
      })

      it('leaves featuredEmbedCodeId unset when no slot is marked featured', async () => {
        mockSql
          .mockResolvedValueOnce([projectFixtureAlpha])
          .mockResolvedValueOnce([projectFixtureAlpha])
        mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
          featuredEmbedCodeId: undefined,
          embedCodeIds: [EXISTING_EMBED_CODE_ID]
        })

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on'
          }),
          projectFixtureAlpha.id
        )

        expect(mockSql.mock.calls[1]?.[5]).toBeNull()
      })
    })

    describe('project_id sync (Plan B2 auto-populate)', () => {
      it('stamps newly attached images/embed codes with the project id on create', async () => {
        mockSql.mockResolvedValueOnce([projectFixtureAlpha]) // INSERT ... RETURNING
        mockResolveOrderedImageIds.mockResolvedValueOnce({
          coverImageId: NEW_IMAGE_ID,
          imageIds: []
        })
        mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
          featuredEmbedCodeId: NEW_EMBED_CODE_ID,
          embedCodeIds: []
        })

        await editProject(
          formDataFromObject({
            ...newProjectFixtureAlpha,
            isPublished: 'on'
          })
        )

        // call 0: INSERT ... RETURNING
        // call 1: attach the cover image
        // call 2: attach the featured embed code
        expect(mockSql).toHaveBeenCalledTimes(3)
        expect(mockSql.mock.calls[1]?.[1]).toEqual(
          projectFixtureAlpha.id
        )
        expect(mockSql.mock.calls[1]?.[2]).toEqual([NEW_IMAGE_ID])
        expect(mockSql.mock.calls[2]?.[1]).toEqual(
          projectFixtureAlpha.id
        )
        expect(mockSql.mock.calls[2]?.[2]).toEqual([
          NEW_EMBED_CODE_ID
        ])
      })

      it('does not touch images/links/embed_codes when nothing is attached', async () => {
        mockSql.mockResolvedValueOnce([projectFixtureAlpha]) // INSERT ... RETURNING

        await editProject(
          formDataFromObject({
            ...newProjectFixtureAlpha,
            isPublished: 'on'
          })
        )

        expect(mockSql).toHaveBeenCalledTimes(1)
      })

      it('attaches newly added images and clears project_id from removed images on update', async () => {
        const existingProjectWithImages = {
          ...projectFixtureAlpha,
          imageIds: [EXISTING_IMAGE_ID_1]
        }
        mockSql
          .mockResolvedValueOnce([existingProjectWithImages]) // fetchProjectById
          .mockResolvedValueOnce([projectFixtureAlpha]) // UPDATE ... RETURNING
        mockResolveOrderedImageIds.mockResolvedValueOnce({
          coverImageId: NEW_IMAGE_ID,
          imageIds: []
        })

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on'
          }),
          projectFixtureAlpha.id
        )

        // call 2: attach NEW_IMAGE_ID
        expect(mockSql.mock.calls[2]?.[1]).toEqual(
          projectFixtureAlpha.id
        )
        expect(mockSql.mock.calls[2]?.[2]).toEqual([NEW_IMAGE_ID])

        // call 3: clear project_id from the removed EXISTING_IMAGE_ID_1
        expect(mockSql.mock.calls[3]?.[1]).toEqual([
          EXISTING_IMAGE_ID_1
        ])
        expect(mockSql.mock.calls[3]?.[2]).toEqual(
          projectFixtureAlpha.id
        )
      })

      it('does not detach an image still present in the resolved list', async () => {
        const existingProjectWithImages = {
          ...projectFixtureAlpha,
          imageIds: [EXISTING_IMAGE_ID_1]
        }
        mockSql
          .mockResolvedValueOnce([existingProjectWithImages])
          .mockResolvedValueOnce([projectFixtureAlpha])
        mockResolveOrderedImageIds.mockResolvedValueOnce({
          coverImageId: undefined,
          imageIds: [EXISTING_IMAGE_ID_1]
        })

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on'
          }),
          projectFixtureAlpha.id
        )

        // no attach/detach calls needed: the set is unchanged
        expect(mockSql).toHaveBeenCalledTimes(2)
      })
    })
  })
})
