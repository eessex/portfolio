jest.mock('@/lib/auth/guard', () => ({ isAuthed: jest.fn() }))
jest.mock('@/lib/slug/data', () => ({ resolveSlug: jest.fn() }))
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('notFound')
  }),
  redirect: jest.fn((url: string) => {
    throw new Error(`redirect:${url}`)
  })
}))

import {
  fetchPublishedFirst,
  resolveEditItemId,
  resolvePageItem
} from '@/app/(item-pages)/resolve-page-item'
import { isAuthed } from '@/lib/auth/guard'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'

const mockIsAuthed = jest.mocked(isAuthed)
const mockResolveSlug = jest.mocked(resolveSlug)

const published = { id: 'a', isPublished: true }
const draft = { id: 'a', isPublished: false }

/** Mirrors the real query: drafts only when unpublished rows are included. */
function fetchOnly(item: typeof draft) {
  return jest.fn(async (...args: unknown[]) => {
    const isIncludingUnpublished = args[args.length - 1]
    return item.isPublished || isIncludingUnpublished
      ? item
      : undefined
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('fetchPublishedFirst', () => {
  it('returns a published item without reading the session', async () => {
    const res = await fetchPublishedFirst(fetchOnly(published))

    expect(res).toEqual({ item: published, isAuthed: false })
    expect(mockIsAuthed).not.toHaveBeenCalled()
  })

  it('returns a draft for an authed visitor', async () => {
    mockIsAuthed.mockResolvedValue(true)

    const res = await fetchPublishedFirst(fetchOnly(draft))

    expect(res).toEqual({ item: draft, isAuthed: true })
  })

  it('hides a draft from a logged-out visitor', async () => {
    mockIsAuthed.mockResolvedValue(false)

    expect(
      await fetchPublishedFirst(fetchOnly(draft))
    ).toBeUndefined()
  })

  it('reads no session when nothing exists', async () => {
    const res = await fetchPublishedFirst(async () => undefined)

    expect(res).toBeUndefined()
    expect(mockIsAuthed).not.toHaveBeenCalled()
  })
})

describe('resolvePageItem', () => {
  it('redirects a missing slug to the index', async () => {
    mockResolveSlug.mockResolvedValue(null)

    await expect(
      resolvePageItem(PagePaths.events, 'x', jest.fn())
    ).rejects.toThrow('redirect:/events')
  })

  it('redirects an old slug to the current one', async () => {
    mockResolveSlug.mockResolvedValue({
      id: 'a',
      slug: 'new',
      isRedirect: true
    })

    await expect(
      resolvePageItem(PagePaths.events, 'old', jest.fn())
    ).rejects.toThrow('redirect:/events/new')
  })

  it('redirects a draft to the index for a logged-out visitor', async () => {
    mockResolveSlug.mockResolvedValue({
      id: 'a',
      slug: 's',
      isRedirect: false
    })
    mockIsAuthed.mockResolvedValue(false)

    await expect(
      resolvePageItem(PagePaths.releases, 's', fetchOnly(draft))
    ).rejects.toThrow('redirect:/releases')
  })

  it('fetches by the resolved id', async () => {
    mockResolveSlug.mockResolvedValue({
      id: 'a',
      slug: 's',
      isRedirect: false
    })
    const fetchById = fetchOnly(published)

    const res = await resolvePageItem(
      PagePaths.projects,
      's',
      fetchById
    )

    expect(res.item).toBe(published)
    expect(fetchById).toHaveBeenCalledWith('a', false)
  })
})

describe('resolveEditItemId', () => {
  it('404s a missing slug', async () => {
    mockResolveSlug.mockResolvedValue(null)

    await expect(
      resolveEditItemId(PagePaths.events, 'x')
    ).rejects.toThrow('notFound')
  })

  it('redirects an old slug to the current edit page', async () => {
    mockResolveSlug.mockResolvedValue({
      id: 'a',
      slug: 'new',
      isRedirect: true
    })

    await expect(
      resolveEditItemId(PagePaths.events, 'old')
    ).rejects.toThrow('redirect:/events/new/edit')
  })

  it('returns the current slug id', async () => {
    mockResolveSlug.mockResolvedValue({
      id: 'a',
      slug: 's',
      isRedirect: false
    })

    expect(await resolveEditItemId(PagePaths.events, 's')).toBe('a')
  })
})
