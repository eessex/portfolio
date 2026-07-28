import { render, screen } from '@testing-library/react'

import { linkFixture, pressLinkFixture } from '@/lib/links/fixtures'
import { formatLinkResult } from '@/ui/links/format-link-result'

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
