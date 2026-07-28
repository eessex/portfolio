import { render, screen } from '@testing-library/react'

import { publisherFixtureAlpha } from '@/lib/publishers/fixtures'
import { formatPublisherResult } from '@/ui/publishers/format-publisher-result'

describe('formatPublisherResult', () => {
  it('renders the name', () => {
    render(formatPublisherResult(publisherFixtureAlpha))

    expect(
      screen.getByText(publisherFixtureAlpha.name)
    ).toBeInTheDocument()
  })

  it('renders a badge for the publisher type', () => {
    render(formatPublisherResult(publisherFixtureAlpha))

    expect(screen.getByText('Record Label')).toBeInTheDocument()
  })
})
