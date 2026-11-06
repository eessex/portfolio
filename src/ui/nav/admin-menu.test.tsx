import { render, screen } from '@testing-library/react'

import { auth } from '@/auth'
import { IsAdminSync } from '@/ui/is-admin-sync'
import { AdminMenu } from '@/ui/nav/admin-menu'
import { fetchNavItemStatus } from '@/ui/nav/nav-status'

jest.mock('next/server', () => ({ connection: jest.fn() }))
jest.mock('@/ui/is-admin-sync', () => ({
  IsAdminSync: jest.fn(() => null)
}))
jest.mock('@/ui/nav/admin-menu-disclosure', () => ({
  AdminMenuDisclosure: ({
    children
  }: {
    children: React.ReactNode
  }) => children
}))
jest.mock('@/ui/nav/nav-status', () => ({
  fetchNavItemStatus: jest.fn()
}))
jest.mock('@/ui/buttons/logout-button', () => ({
  LogoutButton: () => null
}))

const mockAuth = auth as unknown as jest.Mock
const mockStatus = jest.mocked(fetchNavItemStatus)

function hrefOf(name: string | RegExp) {
  return screen.getByRole('link', { name }).getAttribute('href')
}

describe('AdminMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders for an admin and syncs isAdmin true', async () => {
    render(await AdminMenu({ hiddenNavPaths: [] }))

    expect(hrefOf('Site settings')).toBe('/dashboard')
    expect(hrefOf('Users')).toBe('/dashboard/users')
    expect(hrefOf('Images')).toBe('/dashboard/images')
    expect(hrefOf('Embed Codes')).toBe('/dashboard/embed_codes')
    expect(
      screen.queryByRole('group', { name: 'Hidden pages' })
    ).not.toBeInTheDocument()
    expect(jest.mocked(IsAdminSync).mock.calls[0]?.[0]).toEqual({
      isAdmin: true
    })
  })

  it('renders nothing visible for a visitor and syncs isAdmin false', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const { container } = render(
      await AdminMenu({ hiddenNavPaths: ['projects'] })
    )

    expect(container).toBeEmptyDOMElement()
    expect(jest.mocked(IsAdminSync).mock.calls[0]?.[0]).toEqual({
      isAdmin: false
    })
  })

  it('links hidden pages, or their create form when empty', async () => {
    mockStatus.mockImplementation(async (navPath) =>
      navPath === 'projects'
        ? 'published'
        : navPath === 'about'
          ? 'empty'
          : undefined
    )

    render(
      await AdminMenu({
        hiddenNavPaths: ['projects', 'about', 'releases']
      })
    )

    const group = screen.getByRole('group', { name: 'Hidden pages' })
    expect(group).toHaveTextContent('Projects')
    expect(group).not.toHaveTextContent('Releases')
    expect(hrefOf('Projects')).toBe('/projects')
    expect(hrefOf('About: create the page')).toBe('/about/edit')
  })

  it('marks a hidden page that has only drafts', async () => {
    mockStatus.mockImplementation(async (navPath) =>
      navPath === 'releases' ? 'drafts' : 'published'
    )

    render(
      await AdminMenu({ hiddenNavPaths: ['projects', 'releases'] })
    )

    const group = screen.getByRole('group', { name: 'Hidden pages' })
    const releases = screen.getByRole('link', { name: 'Releases' })
    expect(releases.closest('li')).toHaveTextContent('Draft')
    expect(
      screen.getByRole('link', { name: 'Projects' }).closest('li')
    ).not.toHaveTextContent('Draft')
    expect(group).toContainElement(releases)
  })
})
