jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
jest.mock('@/lib/auth/guard', () => ({ isAuthed: jest.fn() }))
jest.mock('@/lib/slug/data', () => ({ resolveSlug: jest.fn() }))
jest.mock('@/lib/projects/cached', () => ({
  fetchCachedProjectById: jest.fn()
}))
jest.mock('@/lib/events/cached', () => ({
  fetchCachedEventsFirstPage: jest.fn()
}))
jest.mock('@/lib/releases/cached', () => ({
  fetchCachedReleasesFirstPage: jest.fn()
}))
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`redirect:${url}`)
  })
}))

import ProjectPage from '@/app/(item-pages)/projects/[slug]/page'
import { isAuthed } from '@/lib/auth/guard'
import { fetchCachedProjectById } from '@/lib/projects/cached'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import { resolveSlug } from '@/lib/slug/data'

const mockResolveSlug = jest.mocked(resolveSlug)
const mockFetchById = jest.mocked(fetchCachedProjectById)
const mockIsAuthed = jest.mocked(isAuthed)

const params = Promise.resolve({ slug: projectFixtureBand.slug })
const project = { ...projectFixtureBand, embedCodes: undefined }
const defaultProject = { ...project, isDefaultProject: true }

describe('ProjectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockResolveSlug.mockResolvedValue({
      id: projectFixtureBand.id,
      slug: projectFixtureBand.slug,
      isRedirect: false
    })
  })

  it('redirects the default project to /about', async () => {
    mockFetchById.mockResolvedValue(defaultProject)

    await expect(ProjectPage({ params })).rejects.toThrow(
      'redirect:/about'
    )
  })

  it('redirects an unpublished default project for an authed visitor', async () => {
    mockFetchById
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        ...defaultProject,
        isPublished: false
      })
    mockIsAuthed.mockResolvedValue(true)

    await expect(ProjectPage({ params })).rejects.toThrow(
      'redirect:/about'
    )
  })

  it('renders any other project', async () => {
    mockFetchById.mockResolvedValue(project)

    await expect(ProjectPage({ params })).resolves.toBeTruthy()
  })

  describe('unpublished projects', () => {
    // mirrors the real query: drafts only when unpublished rows are included
    function mockDraft(draft: typeof project) {
      mockFetchById.mockImplementation(
        async (_id, isIncludingUnpublished) =>
          isIncludingUnpublished ? draft : undefined
      )
    }

    const draft = { ...project, isPublished: false }

    it('redirects a logged-out visitor to /projects', async () => {
      mockDraft(draft)
      mockIsAuthed.mockResolvedValue(false)

      await expect(ProjectPage({ params })).rejects.toThrow(
        'redirect:/projects'
      )
    })

    it('redirects a logged-out visitor away from an unpublished default project without revealing /about', async () => {
      mockDraft({ ...defaultProject, isPublished: false })
      mockIsAuthed.mockResolvedValue(false)

      await expect(ProjectPage({ params })).rejects.toThrow(
        'redirect:/projects'
      )
    })

    it('renders the draft for an authed visitor', async () => {
      mockDraft(draft)
      mockIsAuthed.mockResolvedValue(true)

      await expect(ProjectPage({ params })).resolves.toBeTruthy()
      expect(mockFetchById).toHaveBeenLastCalledWith(draft.id, true)
    })
  })
})
