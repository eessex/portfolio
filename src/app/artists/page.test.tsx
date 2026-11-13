import ProjectsPage from '@/app/(item-pages)/projects/page'
import ArtistsPage from '@/app/artists/page'
import { siteIdentity } from '@/lib/projects/site-identity'

jest.mock('@/lib/projects/site-identity', () => ({
  siteIdentity: jest.fn()
}))
jest.mock('@/lib/projects/cached', () => ({
  fetchCachedProjectsFirstPage: jest.fn()
}))
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`redirect:${url}`)
  })
}))

const mockSiteIdentity = jest.mocked(siteIdentity)

describe('/artists', () => {
  it('redirects to /projects outside a label site', async () => {
    mockSiteIdentity.mockResolvedValueOnce({ kind: 'music' })

    await expect(ArtistsPage()).rejects.toThrow('redirect:/projects')
  })

  it('renders on a label site', async () => {
    mockSiteIdentity.mockResolvedValueOnce({ kind: 'label' })

    await expect(ArtistsPage()).resolves.toBeTruthy()
  })
})

describe('/projects', () => {
  it('redirects to /artists on a label site', async () => {
    mockSiteIdentity.mockResolvedValueOnce({ kind: 'label' })

    await expect(ProjectsPage()).rejects.toThrow('redirect:/artists')
  })

  it('renders outside a label site', async () => {
    mockSiteIdentity.mockResolvedValueOnce({ kind: 'music' })

    await expect(ProjectsPage()).resolves.toBeTruthy()
  })
})

describe('the roster list', () => {
  it('fetches artist types by name, and forwards the same to the API', async () => {
    const { fetchCachedProjectsFirstPage } = jest.requireMock(
      '@/lib/projects/cached'
    )
    fetchCachedProjectsFirstPage.mockResolvedValueOnce({
      res: { allProjects: [] },
      nextCursor: null,
      totalCount: 0
    })
    mockSiteIdentity.mockResolvedValueOnce({ kind: 'label' })

    const page = await ArtistsPage()
    const list = page.props.children
    const table = await list.type()

    expect(fetchCachedProjectsFirstPage).toHaveBeenCalledWith(false, {
      isDefaultExcluded: true,
      types: ['band', 'solo', 'collaborative'],
      orderBy: 'name'
    })
    expect(table.props.isDateHidden).toBe(true)
    expect(table.props.searchParams).toEqual({
      isDefaultExcluded: true,
      types: 'band,solo,collaborative',
      orderBy: 'name'
    })
  })
})
