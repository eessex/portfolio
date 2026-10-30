import { act, render, screen, waitFor } from '@testing-library/react'

import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItems,
  type NavPath
} from '@/ui/nav/nav-items'
import { resetIsAdminCache, syncIsAdmin } from '@/ui/use-is-admin'

function mockSession(isAuthed: boolean) {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ isAuthed })
  } as Response)
}

function itemsWith(
  hasPublishedItems: Partial<Record<NavPath, boolean>>
): NavItem[] {
  return navItems.flatMap((item) =>
    item.navPath in hasPublishedItems
      ? [
          {
            ...item,
            hasPublishedItems: !!hasPublishedItems[item.navPath]
          }
        ]
      : []
  )
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
          events: true,
          releases: true,
          about: true
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
        items={itemsWith({ events: true, releases: false })}
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
        items={itemsWith({ events: true, releases: false })}
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

  it('omits the navigation landmark with no items', () => {
    render(<NavClient title='My Site' items={[]} />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(linkNames()).toEqual(['My Site'])
  })

  it('omits the navigation landmark when every item is draft-only for an anonymous visitor', async () => {
    mockSession(false)

    render(<NavClient items={itemsWith({ about: false })} />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('shows draft-only sections after login without a reload', async () => {
    mockSession(false)
    render(
      <NavClient
        items={itemsWith({ events: true, releases: false })}
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
        items={itemsWith({ events: true, releases: false })}
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
})
