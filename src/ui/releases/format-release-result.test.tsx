import { render, screen } from '@testing-library/react'

import { releaseFixtureAlbum } from '@/lib/releases/fixtures'
import { formatReleaseResult } from '@/ui/releases/format-release-result'
import { formattedItemTitle } from '@/ui/util'

describe('formatReleaseResult', () => {
  it('renders the (artist-prefixed) title', () => {
    render(formatReleaseResult(releaseFixtureAlbum))

    expect(
      screen.getByText(formattedItemTitle(releaseFixtureAlbum))
    ).toBeInTheDocument()
  })

  it('renders a badge for the release type', () => {
    render(formatReleaseResult(releaseFixtureAlbum))

    expect(screen.getByText('Album')).toBeInTheDocument()
  })
})
