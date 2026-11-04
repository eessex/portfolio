import { act, render, screen, waitFor } from '@testing-library/react'

import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItems,
  type NavItemStatus,
  type NavPath
} from '@/ui/nav/nav-items'
import { resetIsAdminCache, syncIsAdmin } from '@/ui/use-is-admin'

function mockSession(isAuthed: boolean) {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ isAuthed })
  } as Response)
}

function itemsWith(
  statuses: Partial<Record<NavPath, NavItemStatus>>
): NavItem[] {
  return navItems.flatMap((item) => {
    const status = statuses[item.navPath]
    return status ? [{ ...item, status }] : []
  })
}

function linkNames() {
  return screen.queryAllByRole('link').map((link) => link.textContent)
}

describe('NavClient', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
    resetIsAdminCache()
  })

  it('renders published sections without checking the session', () => {
    mockSession(true)

    render(
      <NavClient
        title='My Site'
        items={itemsWith({
          events: 'published',
          releases: 'published',
          about: 'published'
        })}
      />
    )

    expect(linkNames()).toEqual([
      'My Site',
      'Events',
      'Releases',
      'About'
    ])
    expect(
      screen.getByRole('link', { name: 'Events' })
    ).toHaveAttribute('href', '/events')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('hides a draft-only section from anonymous visitors', async () => {
    mockSession(false)

    render(
      <NavClient
        items={itemsWith({ events: 'published', releases: 'drafts' })}
      />
    )

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    expect(global.fetch).toHaveBeenCalledWith('/api/session')
    expect(linkNames()).toEqual(['Site Title', 'Events'])
  })

  it('shows a draft-only section to admins', async () => {
    mockSession(true)

    render(
      <NavClient
        items={itemsWith({ events: 'published', releases: 'drafts' })}
      />
    )

    expect(
      screen.queryByRole('link', { name: 'Releases' })
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: 'Releases' })
      ).toBeInTheDocument()
    )
    expect(linkNames()).toEqual(['Site Title', 'Events', 'Releases'])
  })

  it('marks only the draft-only section as a draft for admins', async () => {
    mockSession(true)

    render(
      <NavClient
        items={itemsWith({ events: 'published', releases: 'drafts' })}
      />
    )

    const releases = await screen.findByRole('link', {
      name: 'Releases'
    })
    const badges = screen.getAllByText('Draft')
    expect(badges).toHaveLength(1)
    expect(releases.closest('li')).toContainElement(badges[0])
  })

  it('shows anonymous visitors no draft badge', async () => {
    mockSession(false)

    render(
      <NavClient
        items={itemsWith({ events: 'published', releases: 'drafts' })}
      />
    )

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
  })

  it('omits the navigation landmark with no items', () => {
    render(<NavClient title='My Site' items={[]} />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(linkNames()).toEqual(['My Site'])
  })

  it('omits the navigation landmark when every item is draft-only for an anonymous visitor', async () => {
    mockSession(false)

    render(<NavClient items={itemsWith({ about: 'drafts' })} />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('shows draft-only sections after login without a reload', async () => {
    mockSession(false)
    render(
      <NavClient
        items={itemsWith({ events: 'published', releases: 'drafts' })}
      />
    )
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    expect(linkNames()).toEqual(['Site Title', 'Events'])

    act(() => syncIsAdmin(true))

    expect(linkNames()).toEqual(['Site Title', 'Events', 'Releases'])
  })

  it('hides draft-only sections after logout without a reload', async () => {
    mockSession(true)
    render(
      <NavClient
        items={itemsWith({ events: 'published', releases: 'drafts' })}
      />
    )
    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: 'Releases' })
      ).toBeInTheDocument()
    )

    act(() => syncIsAdmin(false))

    expect(linkNames()).toEqual(['Site Title', 'Events'])
  })

  it('hides an empty section without checking the session', () => {
    render(
      <NavClient
        items={itemsWith({
          events: 'empty',
          releases: 'published',
          about: 'empty'
        })}
      />
    )

    expect(global.fetch).not.toHaveBeenCalled()
    expect(linkNames()).toEqual(['Site Title', 'Releases'])
  })

  it.each<[NavPath, string, string]>([
    ['events', 'Events: create the first event', '/events/new'],
    [
      'releases',
      'Releases: create the first release',
      '/releases/new'
    ],
    ['about', 'About: create the page', '/about/edit']
  ])(
    'shows admins an empty %s as a link to create it',
    (navPath, name, href) => {
      render(<NavClient items={itemsWith({ [navPath]: 'empty' })} />)

      act(() => syncIsAdmin(true))

      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('href', href)
      expect(link).not.toHaveClass('button')
      expect(global.fetch).not.toHaveBeenCalled()
    }
  )

  it('hides ghost links again after logout', () => {
    render(<NavClient items={itemsWith({ events: 'empty' })} />)

    act(() => syncIsAdmin(true))
    act(() => syncIsAdmin(false))

    expect(linkNames()).toEqual(['Site Title'])
  })

  it('keeps nav order with ghost links mixed in', async () => {
    mockSession(true)

    render(
      <NavClient
        items={itemsWith({
          events: 'empty',
          releases: 'drafts',
          about: 'published'
        })}
      />
    )

    await screen.findByRole('link', {
      name: 'Events: create the first event'
    })
    expect(
      screen
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
    ).toEqual(['/', '/events/new', '/releases', '/about'])
  })

  it('renders the admin menu slot beside the nav', () => {
    render(
      <NavClient
        items={itemsWith({ events: 'published' })}
        adminMenu={<button type='button'>Admin menu</button>}
      />
    )

    expect(
      screen.getByRole('button', { name: 'Admin menu' })
    ).toBeInTheDocument()
  })
})
