jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
jest.mock('@/lib/auth/guard', () => ({ isAuthed: jest.fn() }))
jest.mock('@/lib/projects/cached', () => ({
  fetchCachedDefaultProject: jest.fn(),
  fetchCachedProjectsFirstPage: jest.fn()
}))
jest.mock('next/navigation', () => ({ notFound: jest.fn() }))
jest.mock('@/lib/site-settings/cached', () => ({
  fetchCachedSiteSettings: jest.fn()
}))

import { notFound } from 'next/navigation'
import type { ReactElement } from 'react'

import ItemLayout from '@/app/(item-pages)/item-layout'
import AboutPage, { generateMetadata } from '@/app/about/page'
import { isAuthed } from '@/lib/auth/guard'
import { imageFixture } from '@/lib/images/fixtures'
import {
  fetchCachedDefaultProject,
  fetchCachedProjectsFirstPage
} from '@/lib/projects/cached'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import type { ProjectClient } from '@/lib/projects/types'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { ProjectsCarousel } from '@/ui/projects/projects-carousel'

const mockDefault = jest.mocked(fetchCachedDefaultProject)
const mockProjectsFirstPage = jest.mocked(
  fetchCachedProjectsFirstPage
)
const mockIsAuthed = jest.mocked(isAuthed)
const mockSettings = jest.mocked(fetchCachedSiteSettings)

type DefaultProject = NonNullable<
  Awaited<ReturnType<typeof fetchCachedDefaultProject>>
>

const defaultProject: DefaultProject = {
  ...projectFixtureBand,
  isDefaultProject: true,
  embedCodes: undefined
}
const draftDefault: DefaultProject = {
  ...defaultProject,
  isPublished: false
}

/** Mocks `fetchCachedDefaultProject` by its `isAuthed` arg. */
function mockDefaults({
  published,
  any
}: {
  published?: DefaultProject
  any?: DefaultProject
}) {
  mockDefault.mockImplementation(async (isAuthed) =>
    isAuthed ? any : published
  )
}

function componentName(el: ReactElement) {
  return (el.type as { name: string }).name
}

describe('AboutPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.mocked(notFound).mockImplementation(() => {
      throw new Error('notFound')
    })
  })

  it('renders the published default project without reading the session', async () => {
    mockDefaults({ published: defaultProject, any: defaultProject })

    const el = (await AboutPage()) as ReactElement<{
      item: ProjectClient
    }>

    expect(el.type).toBe(ItemLayout)
    expect(el.props.item).toBe(defaultProject)
    expect(mockIsAuthed).not.toHaveBeenCalled()
  })

  it('lists the other projects in a carousel', async () => {
    mockDefaults({ published: defaultProject })
    const allProjects = [projectFixtureBand]
    const firstPage = {
      res: { allProjects },
      nextCursor: null,
      totalCount: 0
    } as unknown as Awaited<
      ReturnType<typeof fetchCachedProjectsFirstPage>
    >
    mockProjectsFirstPage.mockResolvedValue(firstPage)

    const el = (await AboutPage()) as ReactElement<{
      children: ReactElement<{ children: ReactElement }>
    }>
    const projects = el.props.children.props.children
    const carousel = (await (
      projects.type as () => Promise<ReactElement>
    )()) as ReactElement<Record<string, unknown>>

    expect(componentName(projects)).toBe('AboutProjects')
    expect(mockProjectsFirstPage).toHaveBeenCalledWith(false, true)
    expect(carousel.type).toBe(ProjectsCarousel)
    expect(carousel.props).toEqual({ initialProjects: allProjects })
  })

  it('404s, without reading the session, when no default exists', async () => {
    mockDefaults({})

    await expect(AboutPage()).rejects.toThrow('notFound')
    expect(mockIsAuthed).not.toHaveBeenCalled()
  })

  it('renders an unpublished default project for a signed-in admin', async () => {
    mockDefaults({ any: draftDefault })
    mockIsAuthed.mockResolvedValue(true)

    const el = (await AboutPage()) as ReactElement<{
      item: ProjectClient
    }>

    expect(el.type).toBe(ItemLayout)
    expect(el.props.item).toBe(draftDefault)
  })

  it('404s for anonymous visitors while the default is a draft', async () => {
    mockDefaults({ any: draftDefault })
    mockIsAuthed.mockResolvedValue(false)

    await expect(AboutPage()).rejects.toThrow('notFound')
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockSettings.mockResolvedValue({
      description: 'Site description'
    } as Awaited<ReturnType<typeof fetchCachedSiteSettings>>)
  })

  it("uses the default project's short description and cover image", async () => {
    mockDefaults({
      published: { ...defaultProject, coverImage: imageFixture }
    })

    const meta = await generateMetadata()

    expect(meta.title).toBe('About')
    expect(meta.description).toBe(defaultProject.shortDescription)
    expect(meta.openGraph.images).toEqual([
      expect.objectContaining({
        url: imageFixture.url,
        alt: imageFixture.alt ?? ''
      })
    ])
  })

  it('falls back to the site description when the project has none', async () => {
    mockDefaults({
      published: { ...defaultProject, shortDescription: undefined }
    })

    const meta = await generateMetadata()

    expect(meta.description).toBe('Site description')
    expect(meta.openGraph.images).toEqual([])
  })

  it('uses the site settings when no default project exists', async () => {
    mockDefaults({})
    mockSettings.mockResolvedValue({
      description: 'Site description',
      coverImage: imageFixture
    } as Awaited<ReturnType<typeof fetchCachedSiteSettings>>)

    const meta = await generateMetadata()

    expect(meta.description).toBe('Site description')
    expect(meta.openGraph.images).toEqual([
      expect.objectContaining({ url: imageFixture.url })
    ])
  })
})
