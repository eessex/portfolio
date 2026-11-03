import { fetchCachedEventsFirstPage } from '@/lib/events/cached'
import {
  fetchCachedDefaultProject,
  fetchCachedProjectsFirstPage
} from '@/lib/projects/cached'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { Nav } from '@/ui/nav/nav'
import type { NavItem, NavPath } from '@/ui/nav/nav-items'

jest.mock('@/lib/events/cached', () => ({
  fetchCachedEventsFirstPage: jest.fn()
}))
jest.mock('@/lib/releases/cached', () => ({
  fetchCachedReleasesFirstPage: jest.fn()
}))
jest.mock('@/lib/projects/cached', () => ({
  fetchCachedDefaultProject: jest.fn(),
  fetchCachedProjectsFirstPage: jest.fn()
}))
jest.mock('@/lib/site-settings/cached', () => ({
  fetchCachedSiteSettings: jest.fn()
}))

const mockEvents = jest.mocked(fetchCachedEventsFirstPage)
const mockReleases = jest.mocked(fetchCachedReleasesFirstPage)
const mockDefaultProject = jest.mocked(fetchCachedDefaultProject)
const mockProjects = jest.mocked(fetchCachedProjectsFirstPage)
const mockSettings = jest.mocked(fetchCachedSiteSettings)

type ContentState = 'published' | 'drafts' | 'empty' | 'error'

// whether a fetch with this isAuthed finds content
function findsContent(state: ContentState, isAuthed: boolean) {
  if (state === 'error') throw new Error('DB down')
  return state === 'published' || (state === 'drafts' && isAuthed)
}

function mockContent(states: Partial<Record<NavPath, ContentState>>) {
  const {
    events = 'empty',
    releases = 'empty',
    about = 'empty'
  } = states

  mockEvents.mockImplementation(async (isAuthed) => {
    const totalCount = findsContent(events, isAuthed) ? 1 : 0
    return { totalCount } as Awaited<
      ReturnType<typeof fetchCachedEventsFirstPage>
    >
  })
  mockReleases.mockImplementation(async (isAuthed) => {
    const totalCount = findsContent(releases, isAuthed) ? 1 : 0
    return { totalCount } as Awaited<
      ReturnType<typeof fetchCachedReleasesFirstPage>
    >
  })
  mockDefaultProject.mockImplementation(async (isAuthed = false) =>
    findsContent(about, isAuthed)
      ? ({ id: 'project-1' } as Awaited<
          ReturnType<typeof fetchCachedDefaultProject>
        >)
      : undefined
  )
}

function mockProjectCount(totalCount: number) {
  mockProjects.mockResolvedValue({ totalCount } as Awaited<
    ReturnType<typeof fetchCachedProjectsFirstPage>
  >)
}

async function navProps() {
  const element = await Nav()
  return element.props as { title?: string; items: NavItem[] }
}

describe('Nav', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSettings.mockResolvedValue({
      title: 'My Site'
    } as Awaited<ReturnType<typeof fetchCachedSiteSettings>>)
    mockProjectCount(1)
  })

  it('includes published sections in nav order', async () => {
    mockContent({
      about: 'published',
      events: 'published',
      releases: 'published'
    })

    const { title, items } = await navProps()

    expect(title).toBe('My Site')
    expect(items).toEqual([
      {
        navPath: 'events',
        href: '/events',
        label: 'Events',
        status: 'published'
      },
      {
        navPath: 'releases',
        href: '/releases',
        label: 'Releases',
        status: 'published'
      },
      {
        navPath: 'about',
        href: '/about',
        label: 'About',
        status: 'published'
      }
    ])
  })

  it.each<NavPath>(['events', 'releases', 'about'])(
    'marks %s with drafts only as drafts',
    async (navPath) => {
      mockContent({ [navPath]: 'drafts' })

      const { items } = await navProps()

      expect(items).toContainEqual(
        expect.objectContaining({ navPath, status: 'drafts' })
      )
    }
  )

  it.each<NavPath>(['events', 'releases', 'about'])(
    'marks %s with no content as empty',
    async (navPath) => {
      mockContent({})

      const { items } = await navProps()

      expect(items).toContainEqual(
        expect.objectContaining({ navPath, status: 'empty' })
      )
    }
  )

  it('skips the authed fetch for a published section', async () => {
    mockContent({
      about: 'published',
      events: 'published',
      releases: 'published'
    })

    await navProps()

    expect(mockEvents).toHaveBeenCalledTimes(1)
    expect(mockEvents).toHaveBeenCalledWith(false)
    expect(mockReleases).toHaveBeenCalledTimes(1)
    expect(mockReleases).toHaveBeenCalledWith(false)
    expect(mockDefaultProject).toHaveBeenCalledTimes(1)
    expect(mockDefaultProject).toHaveBeenCalledWith(false)
  })

  it('keeps a section whose fetch throws admin-only', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockContent({ events: 'error', releases: 'empty' })

    const { items } = await navProps()

    expect(
      items.map(({ navPath, status }) => [navPath, status])
    ).toEqual([
      ['events', 'empty'],
      ['releases', 'empty'],
      ['about', 'empty']
    ])
    expect(console.error).toHaveBeenCalled()
  })

  it('renders without a title when site settings throw', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockSettings.mockRejectedValue(new Error('DB down'))
    mockContent({ events: 'published' })

    const { title, items } = await navProps()

    expect(title).toBeUndefined()
    expect(items.map((item) => item.status)).toEqual([
      'published',
      'empty',
      'empty'
    ])
  })

  it('omits empty releases while no project exists', async () => {
    mockContent({})
    mockProjectCount(0)

    const { items } = await navProps()

    expect(items.map((item) => item.navPath)).toEqual([
      'events',
      'about'
    ])
    expect(mockProjects).toHaveBeenCalledWith(true)
  })

  it('skips the project check for releases with content', async () => {
    mockContent({ releases: 'drafts' })
    mockProjectCount(0)

    const { items } = await navProps()

    expect(items).toContainEqual(
      expect.objectContaining({
        navPath: 'releases',
        status: 'drafts'
      })
    )
    expect(mockProjects).not.toHaveBeenCalled()
  })

  it('keeps empty releases as admin-only when the project check throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockContent({})
    mockProjects.mockRejectedValue(new Error('DB down'))

    const { items } = await navProps()

    expect(items).toContainEqual(
      expect.objectContaining({
        navPath: 'releases',
        status: 'empty'
      })
    )
    expect(console.error).toHaveBeenCalled()
  })
})
