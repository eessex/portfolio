import { updateTag } from 'next/cache'

import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import {
  deleteProject,
  editDefaultProject,
  editProject
} from '@/lib/projects/actions'
import {
  newProjectFixtureAlpha,
  projectFixtureAlpha
} from '@/lib/projects/fixtures'
import { createProjectSchema } from '@/lib/projects/schemas'
import type { CreateProject, Project } from '@/lib/projects/types'
import { generateUniqueSlug } from '@/lib/slug/data'
import { formDataFromObject } from '@/test/helpers'

jest.mock('@/lib/slug/data', () => ({
  generateUniqueSlug: jest.fn()
}))
const mockGenerateUniqueSlug = jest.mocked(generateUniqueSlug)

jest.mock('@/lib/db', () => ({
  sql: Object.assign(jest.fn(), {
    transaction: jest.fn(),
    unsafe: jest.fn((raw: string) => ({ raw }))
  })
}))
const mockSql = jest.mocked(sql)
const mockTransaction = jest.mocked(sql.transaction)

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
const EXISTING_LINK_ID = '55555555-5555-4555-8555-555555555555'

/** Fields the form always submits, required for non-default projects. */
const requiredFields = {
  type: newProjectFixtureAlpha.type,
  startDate: newProjectFixtureAlpha.startDate
}

describe('Project Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGenerateUniqueSlug.mockResolvedValue(projectFixtureAlpha.slug)
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
    const res = await deleteProject(projectFixtureAlpha)

    expect(res).toEqual({
      ok: false,
      message: 'You must be signed in to perform this action.'
    })
    expect(mockSql).not.toHaveBeenCalled()
  })

  describe('#deleteProject', () => {
    it('can delete a project', async () => {
      mockSql.mockResolvedValueOnce([
        { is_default_project: false }
      ] as never)
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
      mockSql.mockResolvedValueOnce([
        { is_default_project: false }
      ] as never)
      mockTransaction.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteProject(projectFixtureAlpha)

      expect(res!.message).toBe('Failed to delete project: DB error.')
      expect(updateTag).not.toHaveBeenCalled()
    })

    it('hands off everything the project owns before deleting it, in one transaction', async () => {
      mockSql.mockResolvedValueOnce([
        { is_default_project: false }
      ] as never)
      const queries = [
        'images',
        'links',
        'embedCodes',
        'releases',
        'events',
        'publishedEditions',
        'delete'
      ]
      queries.forEach((query) =>
        mockSql.mockReturnValueOnce(query as never)
      )

      await deleteProject(projectFixtureAlpha)

      expect(mockTransaction).toHaveBeenCalledTimes(1)
      expect(mockTransaction).toHaveBeenCalledWith(queries)
      const texts = mockSql.mock.calls
        .slice(1)
        .map(([strings]) => strings.join('?'))
      expect(texts).toHaveLength(7)
      expect(texts[0]).toContain('UPDATE images AS i')
      expect(texts[1]).toContain('UPDATE links AS l')
      expect(texts[2]).toContain('UPDATE embed_codes AS ec')
      expect(texts[6]).toContain('DELETE FROM projects')
      // owned page items go to the default rather than the FK's NULL
      for (const [i, table] of [
        'releases',
        'events',
        'published_editions'
      ].entries()) {
        const [strings, ...params] = mockSql.mock.calls[4 + i]!
        expect(strings.join('?')).toContain(
          'SET project_id = (SELECT id FROM projects WHERE is_default_project)'
        )
        expect(params).toEqual([
          { raw: table },
          projectFixtureAlpha.id
        ])
      }
      // no id filter: every item the project owns is handed off
      for (const [, ...params] of mockSql.mock.calls.slice(1, 4)) {
        expect(params).toEqual([
          projectFixtureAlpha.id,
          projectFixtureAlpha.id,
          null,
          null
        ])
      }
    })

    it('refuses to delete the default project, whatever the client sends', async () => {
      mockSql.mockResolvedValueOnce([
        { is_default_project: true }
      ] as never)
      const res = await deleteProject({
        ...projectFixtureAlpha,
        isDefaultProject: false
      })

      expect(res).toEqual({
        ok: false,
        message: 'The default project can’t be deleted.'
      })
      expect(mockTransaction).not.toHaveBeenCalled()
      expect(updateTag).not.toHaveBeenCalled()
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

      await editProject(
        formDataFromObject({
          ...requiredFields,
          title: 'Updated Title'
        }),
        projectFixtureAlpha.id
      )

      const [, , , , , , isPublished, , shortDescription] = mockSql
        .mock.calls[1] as unknown as string[]
      expect(isPublished).toBe(false)
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
        expect(mockSql.mock.calls[1]?.[5]).toEqual([
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
        expect(mockSql.mock.calls[1]?.[5]).toEqual([])
      })
    })

    describe('embed codes picker', () => {
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

      it('writes the resolved embedCodeIds, in order, to the saved row', async () => {
        mockSql
          .mockResolvedValueOnce([projectFixtureAlpha])
          .mockResolvedValueOnce([projectFixtureAlpha])
        mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
          embedCodeIds: [NEW_EMBED_CODE_ID, EXISTING_EMBED_CODE_ID]
        })

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on'
          }),
          projectFixtureAlpha.id
        )

        expect(mockSql.mock.calls[1]?.[3]).toEqual([
          NEW_EMBED_CODE_ID,
          EXISTING_EMBED_CODE_ID
        ])
      })
    })

    describe('project_id sync (auto-populate)', () => {
      it('stamps newly attached images/embed codes with the project id on create', async () => {
        mockSql.mockResolvedValueOnce([projectFixtureAlpha]) // INSERT ... RETURNING
        mockResolveOrderedImageIds.mockResolvedValueOnce({
          coverImageId: NEW_IMAGE_ID,
          imageIds: []
        })
        mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
          embedCodeIds: [NEW_EMBED_CODE_ID]
        })

        await editProject(
          formDataFromObject({
            ...newProjectFixtureAlpha,
            isPublished: 'on'
          })
        )

        // call 0: INSERT ... RETURNING
        // call 1: attach the cover image
        // call 2: attach the embed code
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

        // call 3: hand off the removed EXISTING_IMAGE_ID_1
        const [strings, ...params] = mockSql.mock.calls[3]!
        expect(strings.join('?')).toContain('UPDATE images AS i')
        expect(params).toEqual([
          projectFixtureAlpha.id, // other projects only
          projectFixtureAlpha.id, // owned by this project
          [EXISTING_IMAGE_ID_1],
          [EXISTING_IMAGE_ID_1]
        ])
      })

      it('only claims unowned items on attach', async () => {
        mockSql.mockResolvedValueOnce([projectFixtureAlpha])
        mockResolveOrderedImageIds.mockResolvedValueOnce({
          coverImageId: NEW_IMAGE_ID,
          imageIds: []
        })
        mockResolveOrderedLinkIds.mockResolvedValueOnce({
          linkIds: [EXISTING_LINK_ID]
        })
        mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
          embedCodeIds: [NEW_EMBED_CODE_ID]
        })

        await editProject(
          formDataFromObject({
            ...newProjectFixtureAlpha,
            isPublished: 'on'
          })
        )

        // calls 1–3: one attach per table, images → links → embed codes
        expect(mockSql).toHaveBeenCalledTimes(4)
        const attaches = mockSql.mock.calls.slice(1)
        const expected = [
          ['UPDATE images', NEW_IMAGE_ID],
          ['UPDATE links', EXISTING_LINK_ID],
          ['UPDATE embed_codes', NEW_EMBED_CODE_ID]
        ] as const
        attaches.forEach(([strings, ...params], i) => {
          const [table, id] = expected[i]!
          const text = strings.join('?')
          expect(text).toContain(table)
          expect(text).toContain('SET project_id = ?')
          expect(text).toContain('AND project_id IS NULL')
          expect(params).toEqual([projectFixtureAlpha.id, [id]])
        })
      })

      it('hands detached items to another project still listing them, else NULL', async () => {
        const existingProject = {
          ...projectFixtureAlpha,
          imageIds: [EXISTING_IMAGE_ID_1],
          linkIds: [EXISTING_LINK_ID],
          embedCodeIds: [EXISTING_EMBED_CODE_ID]
        }
        mockSql
          .mockResolvedValueOnce([existingProject]) // fetchProjectById
          .mockResolvedValueOnce([projectFixtureAlpha]) // UPDATE ... RETURNING

        await editProject(
          formDataFromObject({
            ...projectFixtureAlpha,
            isPublished: 'on'
          }),
          projectFixtureAlpha.id
        )

        // calls 2–4: one hand-off per table, in images → links →
        // embed codes order, each limited to the detached ids
        expect(mockSql).toHaveBeenCalledTimes(5)
        const handOffs = mockSql.mock.calls.slice(2)
        const expected = [
          [
            'UPDATE images AS i',
            'p.cover_image_id = i.id',
            EXISTING_IMAGE_ID_1
          ],
          [
            'UPDATE links AS l',
            'l.id = ANY(p.link_ids)',
            EXISTING_LINK_ID
          ],
          [
            'UPDATE embed_codes AS ec',
            'ec.id = ANY(p.embed_code_ids)',
            EXISTING_EMBED_CODE_ID
          ]
        ] as const
        handOffs.forEach(([strings, ...params], i) => {
          const [table, listedBy, id] = expected[i]!
          const text = strings.join('?')
          expect(text).toContain(table)
          expect(text).toContain(listedBy)
          expect(text).toContain('WHERE p.id <> ?')
          expect(text).toContain('ORDER BY p.created_at, p.id')
          // nobody else lists it: falls back to the default project
          expect(text).toContain('COALESCE(')
          expect(text).toContain(
            '(SELECT id FROM projects WHERE is_default_project)'
          )
          expect(params).toEqual([
            projectFixtureAlpha.id,
            projectFixtureAlpha.id,
            [id],
            [id]
          ])
        })
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

    describe('is_default_project', () => {
      const defaultProject: Project = {
        ...projectFixtureAlpha,
        isDefaultProject: true
      }

      it('writes false on create, ignoring a submitted flag', async () => {
        mockSql.mockResolvedValueOnce([projectFixtureAlpha])

        await editProject(
          formDataFromObject({
            ...newProjectFixtureAlpha,
            isPublished: 'on',
            isDefaultProject: 'on'
          })
        )

        const [strings, ...params] = mockSql.mock.calls[0]!
        const columns = strings.join('?').split('VALUES')[0]!
        expect(columns).toContain('is_default_project')
        // 6th column: cover_image_id … image_ids, is_default_project
        expect(params[5]).toBe(false)
      })

      it('never writes the column on update, so the stored flag is kept', async () => {
        mockSql
          .mockResolvedValueOnce([defaultProject]) // fetchProjectById
          .mockResolvedValueOnce([defaultProject]) // UPDATE

        const res = await editProject(
          formDataFromObject({
            ...requiredFields,
            title: 'Updated Title',
            isDefaultProject: ''
          }),
          defaultProject.id
        )

        expect(res?.ok).toBe(true)
        expect((res?.res as Project).isDefaultProject).toBe(true)
        const [strings] = mockSql.mock.calls[1]!
        expect(strings.join('?')).toContain('UPDATE projects')
        expect(strings.join('?')).not.toContain('is_default_project')
      })

      it('claims an unowned item with its own id, like any project', async () => {
        mockSql
          .mockResolvedValueOnce([defaultProject]) // fetchProjectById
          .mockResolvedValueOnce([defaultProject]) // UPDATE
        mockResolveOrderedImageIds.mockResolvedValueOnce({
          coverImageId: NEW_IMAGE_ID,
          imageIds: []
        })

        await editProject(
          formDataFromObject({ ...requiredFields, title: 'About' }),
          defaultProject.id
        )

        const [strings, ...params] = mockSql.mock.calls[2]!
        expect(strings.join('?')).toContain('UPDATE images')
        expect(strings.join('?')).toContain('AND project_id IS NULL')
        expect(params).toEqual([defaultProject.id, [NEW_IMAGE_ID]])
      })

      describe('editDefaultProject', () => {
        it('writes true on create', async () => {
          mockSql.mockResolvedValueOnce([defaultProject])

          const res = await editDefaultProject(
            formDataFromObject({
              ...newProjectFixtureAlpha,
              isPublished: 'on'
            })
          )

          expect(res?.ok).toBe(true)
          const [, ...params] = mockSql.mock.calls[0]!
          expect(params[5]).toBe(true)
        })

        it('never writes the column on update', async () => {
          mockSql
            .mockResolvedValueOnce([defaultProject]) // fetchProjectById
            .mockResolvedValueOnce([defaultProject]) // UPDATE

          const res = await editDefaultProject(
            formDataFromObject({ ...requiredFields, title: 'About' }),
            defaultProject.id
          )

          expect(res?.ok).toBe(true)
          const [strings] = mockSql.mock.calls[1]!
          expect(strings.join('?')).toContain('UPDATE projects')
          expect(strings.join('?')).not.toContain(
            'is_default_project'
          )
        })

        it('returns a form error when a default project already exists', async () => {
          mockSql.mockRejectedValueOnce(
            Object.assign(
              new Error(
                'duplicate key value violates unique constraint'
              ),
              { constraint: 'idx_projects_single_default' }
            )
          )

          const res = await editDefaultProject(
            formDataFromObject({
              ...newProjectFixtureAlpha,
              isPublished: 'on'
            })
          )

          expect(res).toEqual({
            ok: false,
            message:
              'Failed to save project: A default project already exists.'
          })
        })

        it('passes other save errors through unchanged', async () => {
          mockSql.mockRejectedValueOnce(
            new Error('connection refused')
          )

          const res = await editDefaultProject(
            formDataFromObject({
              ...newProjectFixtureAlpha,
              isPublished: 'on'
            })
          )

          expect(res?.message).toBe(
            'Failed to save project: connection refused.'
          )
        })
      })

      it('requires type and startDate', async () => {
        const res = await editProject(
          formDataFromObject({ title: 'No Type', isPublished: 'on' })
        )

        expect(res!.message).toBe('Failed to validate project.')
        expect(res!.errors).toEqual({
          type: ['Required'],
          startDate: ['Required']
        })
        expect(mockSql).not.toHaveBeenCalled()

        const {
          type: _t,
          startDate: _s,
          ...rest
        } = newProjectFixtureAlpha
        expect(
          createProjectSchema.safeParse({
            ...rest,
            isDefaultProject: true
          }).success
        ).toBe(false)
      })
    })

    describe('contact info (CONTACT‑1)', () => {
      it('serializes submitted contact rows to a jsonb[] param on create', async () => {
        mockSql.mockResolvedValueOnce([projectFixtureAlpha])

        await editProject(
          formDataFromObject({
            ...newProjectFixtureAlpha,
            isPublished: 'on',
            'contactInfo[]': '',
            'contactInfo[0].title': 'Bookings',
            'contactInfo[0].contact': 'bookings@example.com',
            'contactInfo[1].contact': 'press@example.com'
          })
        )

        // last INSERT param (before current_timestamp) is contact_info
        expect(mockSql.mock.calls[0]?.[15]).toEqual([
          '{"title":"Bookings","contact":"bookings@example.com"}',
          '{"contact":"press@example.com"}'
        ])
      })

      it('drops fully blank contact rows so empty editor rows never persist', async () => {
        mockSql.mockResolvedValueOnce([projectFixtureAlpha])

        await editProject(
          formDataFromObject({
            ...newProjectFixtureAlpha,
            isPublished: 'on',
            'contactInfo[]': '',
            'contactInfo[0].title': 'Bookings',
            'contactInfo[0].contact': 'bookings@example.com',
            'contactInfo[1].title': ' ',
            'contactInfo[1].contact': '   '
          })
        )

        expect(mockSql.mock.calls[0]?.[15]).toEqual([
          '{"title":"Bookings","contact":"bookings@example.com"}'
        ])
      })

      it('rejects a labelled row whose contact is whitespace-only', async () => {
        const res = await editProject(
          formDataFromObject({
            ...newProjectFixtureAlpha,
            isPublished: 'on',
            'contactInfo[]': '',
            'contactInfo[0].title': 'Press',
            'contactInfo[0].contact': '   '
          })
        )

        expect(res).toEqual({
          ok: false,
          message:
            'Failed to save project: Contact "Press" needs an email, phone, or link.'
        })
        expect(mockSql).not.toHaveBeenCalled()
      })

      const existingContacts = [
        { title: 'Bookings', contact: 'bookings@example.com' }
      ]

      it('preserves existing contacts when a partial update omits the editor', async () => {
        mockSql
          .mockResolvedValueOnce([
            { ...projectFixtureAlpha, contactInfo: existingContacts }
          ]) // fetchProjectById
          .mockResolvedValueOnce([projectFixtureAlpha]) // UPDATE

        const res = await editProject(
          formDataFromObject({
            ...requiredFields,
            title: 'Updated Title'
          }),
          projectFixtureAlpha.id
        )

        expect(res?.ok).toBe(true)
        // last UPDATE SET param (before the WHERE id) is contact_info
        expect(mockSql.mock.calls[1]?.[14]).toEqual([
          '{"title":"Bookings","contact":"bookings@example.com"}'
        ])
      })

      it('clears existing contacts when the emptied editor submits only its marker', async () => {
        mockSql
          .mockResolvedValueOnce([
            { ...projectFixtureAlpha, contactInfo: existingContacts }
          ]) // fetchProjectById
          .mockResolvedValueOnce([projectFixtureAlpha]) // UPDATE

        const res = await editProject(
          formDataFromObject({
            ...requiredFields,
            title: 'Updated Title',
            'contactInfo[]': ''
          }),
          projectFixtureAlpha.id
        )

        expect(res?.ok).toBe(true)
        expect(mockSql.mock.calls[1]?.[14]).toBeNull()
      })
    })
  })
})
