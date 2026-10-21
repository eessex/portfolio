import { render, screen } from '@testing-library/react'

import { linkFixture, pressLinkFixture } from '@/lib/links/fixtures'
import {
  formatLinkResult,
  formatLinkResultWithoutBadge,
  formatNewLinkSummary
} from '@/ui/links/format-link-result'

describe('formatLinkResult', () => {
  it('renders the title and a pretty-printed url', () => {
    render(formatLinkResult(linkFixture))

    expect(screen.getByText(linkFixture.title!)).toBeInTheDocument()
    expect(screen.getByText('testlink.com')).toBeInTheDocument()
  })

  it('falls back to the pretty-printed url when there is no title', () => {
    render(formatLinkResult({ ...linkFixture, title: undefined }))

    expect(screen.getByText('testlink.com')).toBeInTheDocument()
  })

  it('omits the protocol and query params from the url', () => {
    render(
      formatLinkResult({
        ...linkFixture,
        url: 'https://testlink.com/path?utm_source=test'
      })
    )

    expect(screen.getByText('testlink.com/path')).toBeInTheDocument()
  })

  it('renders a Press badge for press links', () => {
    render(formatLinkResult(pressLinkFixture))

    expect(screen.getByText('Press')).toBeInTheDocument()
  })
})

describe('formatLinkResultWithoutBadge', () => {
  it('renders the press link without a Press badge', () => {
    render(formatLinkResultWithoutBadge(pressLinkFixture))

    expect(screen.queryByText('Press')).not.toBeInTheDocument()
    expect(
      screen.getByText(pressLinkFixture.attribution!, {
        exact: false
      })
    ).toBeInTheDocument()
  })
})

describe('formatNewLinkSummary', () => {
  const actions = {
    editButton: <button type='button'>Edit</button>,
    onRemove: jest.fn(),
    removeLabel: 'Remove link'
  }

  it('renders like a saved link, with the pretty-printed url', () => {
    render(
      formatNewLinkSummary(
        { title: 'Spotify', url: 'https://open.spotify.com/album/1' },
        undefined,
        actions
      )
    )

    expect(screen.getByText('Spotify')).toBeInTheDocument()
    expect(
      screen.getByText('open.spotify.com/album/1')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Edit' })
    ).toBeInTheDocument()
  })

  it('falls back to the url when there is no title', () => {
    render(
      formatNewLinkSummary(
        { url: 'https://testlink.com' },
        undefined,
        actions
      )
    )

    expect(screen.getByText('testlink.com')).toBeInTheDocument()
    expect(screen.queryByText('New link')).not.toBeInTheDocument()
  })
})

describe('formatLinkResult press links', () => {
  const lines = () =>
    Array.from(
      document.querySelectorAll('span[class*="title-text"], small')
    ).map((el) => el.textContent)

  it('orders quote, then attribution + date, then url', () => {
    render(
      formatLinkResult({
        ...pressLinkFixture,
        publishDate: new Date('2024-03-15T12:00:00Z')
      })
    )

    const [quote, citation, url] = lines()
    expect(quote).toBe('Test Quotation')
    expect(citation).toMatch(/^— Test Attribution, .*2024/)
    expect(url).toBe('testpresslink.com')
  })

  it('shows the title first, without an em dash, when unquoted', () => {
    render(
      formatLinkResult({ ...pressLinkFixture, quotation: undefined })
    )

    const [title, citation, url] = lines()
    expect(title).toBe('Test Press Link')
    expect(citation).toMatch(/^Test Attribution, /)
    expect(url).toBe('testpresslink.com')
  })

  it('omits the citation for non-press links', () => {
    render(
      formatLinkResult({
        ...linkFixture,
        attribution: 'Someone',
        quotation: 'A quote'
      })
    )

    expect(lines()).toEqual(['Test Link', 'testlink.com'])
  })

  it('omits the date for an unsaved draft without one', () => {
    render(
      formatNewLinkSummary(
        {
          url: 'https://press.com',
          type: 'press',
          attribution: 'Press Outlet'
        },
        undefined,
        {
          editButton: <button type='button'>Edit</button>,
          onRemove: jest.fn(),
          removeLabel: 'Remove link'
        }
      )
    )

    expect(lines()).toEqual(['press.com', 'Press Outlet'])
  })
})
