import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import Cookies from 'js-cookie'
import { usePathname } from 'next/navigation'

import { imageFixture } from '@/lib/images/fixtures'
import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItems,
  type NavItemStatus,
  type NavPath
} from '@/ui/nav/nav-items'
import { resetIsAdminCache, syncIsAdmin } from '@/ui/use-is-admin'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))
const mockUsePathname = jest.mocked(usePathname)

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
    mockUsePathname.mockReturnValue('/')
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

  describe('logo', () => {
    const svgLogo = {
      ...imageFixture,
      url: 'https://bucket.example/images/logo.svg',
      format: 'svg' as const
    }

    function homeLink() {
      return screen.getByRole('link', { name: 'My Site' })
    }

    it('shows a raster logo beside the title in the home link', () => {
      render(
        <NavClient title='My Site' logo={imageFixture} items={[]} />
      )

      const logo = homeLink().querySelector('img')
      expect(logo).toHaveAttribute('alt', '')
      expect(screen.getByText('My Site')).not.toHaveClass(
        'visually-hidden'
      )
    })

    it('draws an inlined SVG logo as a mask in the text color', () => {
      const dataUrl = 'data:image/svg+xml;base64,AA=='
      render(
        <NavClient
          title='My Site'
          logo={svgLogo}
          logoMaskUrl={dataUrl}
          items={[]}
        />
      )

      expect(homeLink().querySelector('[aria-hidden]')).toHaveStyle({
        maskImage: `url("${dataUrl}")`
      })
      expect(homeLink().querySelector('img')).toBeNull()
    })

    // a cross-origin mask would vanish without the host's CORS
    it('shows an SVG logo that was not inlined as an image', () => {
      render(<NavClient title='My Site' logo={svgLogo} items={[]} />)

      expect(homeLink().querySelector('img')).toHaveAttribute(
        'src',
        svgLogo.url
      )
      expect(homeLink().querySelector('[aria-hidden]')).toBeNull()
    })

    it('hides the title text, but keeps the link name, when logo-only', () => {
      render(
        <NavClient
          title='My Site'
          logo={svgLogo}
          isLogoOnly
          items={[]}
        />
      )

      expect(screen.getByText('My Site')).toHaveClass(
        'visually-hidden'
      )
      expect(homeLink()).toHaveAttribute('href', '/')
    })

    it('shows the title when logo-only has no logo', () => {
      render(<NavClient title='My Site' isLogoOnly items={[]} />)

      expect(screen.getByText('My Site')).not.toHaveClass(
        'visually-hidden'
      )
    })
  })

  describe('mobile Menu button', () => {
    function menuButton() {
      return screen.getByRole('button', { name: 'Menu' })
    }

    function sheet() {
      const id = menuButton().getAttribute('aria-controls')
      return document.getElementById(id ?? '')
    }

    it('opens the sheet and moves focus into it', () => {
      render(
        <NavClient
          items={itemsWith({
            events: 'published',
            releases: 'published'
          })}
        />
      )

      expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
      expect(sheet()).not.toHaveClass('open')

      fireEvent.click(menuButton())

      expect(menuButton()).toHaveAttribute('aria-expanded', 'true')
      expect(sheet()).toHaveClass('open')
      expect(
        screen.getByRole('link', { name: 'Events' })
      ).toHaveFocus()
    })

    it('holds the admin menu after the links', () => {
      render(
        <NavClient
          items={itemsWith({ events: 'published' })}
          adminMenu={<a href='/dashboard'>Site settings</a>}
        />
      )

      const links = [...(sheet()?.querySelectorAll('a') ?? [])]
      expect(links.map((link) => link.textContent)).toEqual([
        'Events',
        'Site settings'
      ])
    })

    it('closes on following a link', () => {
      render(
        <NavClient
          items={itemsWith({ events: 'published' })}
          adminMenu={<a href='/dashboard'>Site settings</a>}
        />
      )

      fireEvent.click(menuButton())
      fireEvent.click(
        screen.getByRole('link', { name: 'Site settings' })
      )

      expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
      expect(sheet()).not.toHaveClass('open')
    })

    it('is left out with nothing to show', () => {
      render(<NavClient items={[]} />)

      expect(
        screen.queryByRole('button', { name: 'Menu' })
      ).toBeNull()
    })

    it('closes when the button goes away while open', () => {
      render(<NavClient items={[]} />)
      act(() => syncIsAdmin(true))
      fireEvent.click(menuButton())
      const openSheet = sheet()
      expect(openSheet).toHaveClass('open')

      act(() => syncIsAdmin(false))

      expect(
        screen.queryByRole('button', { name: 'Menu' })
      ).toBeNull()
      expect(openSheet).not.toHaveClass('open')
    })

    it('shows for an admin with no links, for the admin menu', () => {
      render(<NavClient items={[]} />)
      act(() => syncIsAdmin(true))

      expect(menuButton()).toBeInTheDocument()
    })
  })

  describe('tray footer', () => {
    const trayFooter = <a href='https://social.example'>Social</a>

    it('shows visitors the footer content in the tray', () => {
      render(
        <NavClient
          items={itemsWith({ events: 'published' })}
          trayFooter={trayFooter}
        />
      )

      expect(
        screen.getByRole('link', { name: 'Social' })
      ).toBeInTheDocument()
    })

    it('offers the Menu button for it alone', () => {
      render(<NavClient items={[]} trayFooter={trayFooter} />)

      expect(
        screen.getByRole('button', { name: 'Menu' })
      ).toBeInTheDocument()
    })

    describe('with just the subscribe form', () => {
      afterEach(() => {
        Cookies.remove('is_subscribed')
      })

      it('drops it and the Menu button once subscribed', () => {
        Cookies.set('is_subscribed', '1')
        render(
          <NavClient
            items={[]}
            trayFooter={trayFooter}
            isTrayFooterSubscribeOnly
          />
        )

        expect(
          screen.queryByRole('button', { name: 'Menu' })
        ).toBeNull()
        expect(
          screen.queryByRole('link', { name: 'Social' })
        ).toBeNull()
      })

      it('keeps it before subscribing', () => {
        render(
          <NavClient
            items={[]}
            trayFooter={trayFooter}
            isTrayFooterSubscribeOnly
          />
        )

        expect(
          screen.getByRole('button', { name: 'Menu' })
        ).toBeInTheDocument()
      })
    })

    it('leaves it out for admins', () => {
      render(
        <NavClient
          items={itemsWith({ events: 'published' })}
          trayFooter={trayFooter}
        />
      )
      act(() => syncIsAdmin(true))

      expect(
        screen.queryByRole('link', { name: 'Social' })
      ).toBeNull()
    })
  })

  describe('current section', () => {
    const items = itemsWith({
      events: 'published',
      about: 'published'
    })

    it.each(['/events', '/events/spring-tour'])(
      'marks Events current on %s',
      (pathname) => {
        mockUsePathname.mockReturnValue(pathname)
        render(<NavClient items={items} />)

        expect(
          screen.getByRole('link', { name: 'Events' })
        ).toHaveAttribute('aria-current', 'page')
        expect(
          screen.getByRole('link', { name: 'About' })
        ).not.toHaveAttribute('aria-current')
      }
    )

    it('needs a whole path segment to match', () => {
      mockUsePathname.mockReturnValue('/eventsy')
      render(<NavClient items={items} />)

      expect(
        screen.getByRole('link', { name: 'Events' })
      ).not.toHaveAttribute('aria-current')
    })
  })
})
