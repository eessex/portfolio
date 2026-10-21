import { render, screen } from '@testing-library/react'

import { linkFixture } from '@/lib/links/fixtures'
import type { Link } from '@/lib/links/schemas/db'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { Footer } from '@/ui/footer/footer'

jest.mock('@/lib/site-settings/cached', () => ({
  fetchCachedSiteSettings: jest.fn()
}))
jest.mock('@/ui/email-subscribe/email-subscribe', () => ({
  EmailSubscribe: () => null
}))
const mockFetchSettings = jest.mocked(fetchCachedSiteSettings)

function settingsWith(socialLinks: Link[]) {
  return { id: 'settings-1', socialLinks } as Awaited<
    ReturnType<typeof fetchCachedSiteSettings>
  >
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
    mockFetchSettings.mockResolvedValue(settingsWith([]))
    render(await Footer())

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('renders no nav before site settings exist', async () => {
    mockFetchSettings.mockResolvedValue(undefined)
    render(await Footer())

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
