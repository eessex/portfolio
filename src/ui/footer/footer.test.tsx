import { render, screen } from '@testing-library/react'

import { linkFixture } from '@/lib/links/fixtures'
import type { Link } from '@/lib/links/schemas/db'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { Footer } from '@/ui/footer/footer'

jest.mock('@/lib/site-settings/cached', () => ({
  fetchCachedSiteSettings: jest.fn()
}))
jest.mock('@/ui/email-subscribe/email-subscribe', () => ({
  EmailSubscribe: () => <form aria-label='Subscribe' />
}))
const mockFetchSettings = jest.mocked(fetchCachedSiteSettings)

function settingsWith(
  socialLinks: Link[],
  isEmailSubscribeEnabled = false
) {
  return {
    id: 'settings-1',
    isEmailSubscribeEnabled,
    socialLinks
  } as Awaited<ReturnType<typeof fetchCachedSiteSettings>>
}

describe('Footer', () => {
  it('renders social links in stored order', async () => {
    mockFetchSettings.mockResolvedValue(
      settingsWith([
        {
          ...linkFixture,
          id: 'b',
          title: 'Zine',
          url: 'https://z.com'
        },
        {
          ...linkFixture,
          id: 'a',
          title: 'Album',
          url: 'https://a.com'
        }
      ])
    )
    render(await Footer())

    const links = screen.getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'Zine',
      'Album'
    ])
    expect(links[0]).toHaveAttribute('href', 'https://z.com')
    expect(links[0]).toHaveAttribute('target', '_blank')
  })

  it('labels an untitled link by its hostname', async () => {
    mockFetchSettings.mockResolvedValue(
      settingsWith([
        {
          ...linkFixture,
          title: undefined,
          url: 'https://www.instagram.com/someone'
        }
      ])
    )
    render(await Footer())

    expect(
      screen.getByRole('link', { name: 'www.instagram.com' })
    ).toBeInTheDocument()
  })

  it('renders no nav without social links', async () => {
    mockFetchSettings.mockResolvedValue(settingsWith([], true))
    render(await Footer())

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('renders no footer without social links or subscribe form', async () => {
    mockFetchSettings.mockResolvedValue(settingsWith([], false))
    render(await Footer())

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('renders no footer before site settings exist', async () => {
    mockFetchSettings.mockResolvedValue(undefined)
    render(await Footer())

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('renders the subscribe form when enabled', async () => {
    mockFetchSettings.mockResolvedValue(settingsWith([], true))
    render(await Footer())

    expect(
      screen.getByRole('form', { name: 'Subscribe' })
    ).toBeInTheDocument()
  })

  it('hides the subscribe form when disabled', async () => {
    mockFetchSettings.mockResolvedValue(
      settingsWith([linkFixture], false)
    )
    render(await Footer())

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(
      screen.queryByRole('form', { name: 'Subscribe' })
    ).not.toBeInTheDocument()
  })
})
