jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
jest.mock('@/lib/auth/guard', () => ({ isAuthed: jest.fn() }))
jest.mock('@/lib/projects/cached', () => ({
  fetchCachedDefaultProject: jest.fn()
}))
jest.mock('@/lib/about/cached', () => ({
  fetchCachedAboutPage: jest.fn()
}))
jest.mock('@/lib/site-settings/cached', () => ({
  fetchCachedSiteSettings: jest.fn()
}))

import type { ReactElement } from 'react'

import ItemLayout from '@/app/(item-pages)/item-layout'
import AboutPage, { generateMetadata } from '@/app/about/page'
import { fetchCachedAboutPage } from '@/lib/about/cached'
import { isAuthed } from '@/lib/auth/guard'
import { imageFixture } from '@/lib/images/fixtures'
import { fetchCachedDefaultProject } from '@/lib/projects/cached'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import type { ProjectClient } from '@/lib/projects/types'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'

const mockDefault = jest.mocked(fetchCachedDefaultProject)
const mockIsAuthed = jest.mocked(isAuthed)
const mockAbout = jest.mocked(fetchCachedAboutPage)
const mockSettings = jest.mocked(fetchCachedSiteSettings)

type DefaultProject = NonNullable<
  Awaited<ReturnType<typeof fetchCachedDefaultProject>>
>

const defaultProject: DefaultProject = {
  ...projectFixtureBand,
  isDefaultProject: true,
  embedCodes: undefined,
  featuredEmbedCode: undefined
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

  it('falls back to the legacy page, without reading the session, when no default exists', async () => {
    mockDefaults({})

    const el = (await AboutPage()) as ReactElement

    expect(componentName(el)).toBe('LegacyAbout')
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

  it('shows anonymous visitors the legacy page while the default is a draft', async () => {
    mockDefaults({ any: draftDefault })
    mockIsAuthed.mockResolvedValue(false)

    const el = (await AboutPage()) as ReactElement

    expect(componentName(el)).toBe('LegacyAbout')
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
    expect(mockAbout).not.toHaveBeenCalled()
  })

  it('falls back to the site description when the project has none', async () => {
    mockDefaults({
      published: { ...defaultProject, shortDescription: undefined }
    })

    const meta = await generateMetadata()

    expect(meta.description).toBe('Site description')
    expect(meta.openGraph.images).toEqual([])
  })

  it('uses the legacy about row when no default project exists', async () => {
    mockDefaults({})
    mockAbout.mockResolvedValue({
      coverImage: imageFixture
    } as Awaited<ReturnType<typeof fetchCachedAboutPage>>)

    const meta = await generateMetadata()

    expect(meta.description).toBe('Site description')
    expect(meta.openGraph.images).toEqual([
      expect.objectContaining({ url: imageFixture.url })
    ])
  })
})
