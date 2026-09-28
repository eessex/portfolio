import { render, screen } from '@testing-library/react'

import { linkFixture, pressLinkFixture } from '@/lib/links/fixtures'
import {
  formatLinkResult,
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
