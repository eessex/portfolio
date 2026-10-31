import { render, screen } from '@testing-library/react'

import { imageFixture } from '@/lib/images/fixtures'
import { releaseFixtureAlbum } from '@/lib/releases/fixtures'
import { formattedItemTitle } from '@/ui/format/items'
import { formatReleaseResult } from '@/ui/releases/format-release-result'

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

  it('does not render an image when the release has no cover image', () => {
    render(formatReleaseResult(releaseFixtureAlbum))

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders a cover image thumbnail when the release has one', () => {
    render(
      formatReleaseResult({
        ...releaseFixtureAlbum,
        coverImage: { ...imageFixture, alt: 'Cover alt text' }
      })
    )

    expect(
      screen.getByRole('img', { name: 'Cover alt text' })
    ).toBeInTheDocument()
  })
})
