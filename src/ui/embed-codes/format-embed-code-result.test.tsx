import { render, screen } from '@testing-library/react'

import { withCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import { formatEmbedCodeResult } from '@/ui/embed-codes/format-embed-code-result'

const embedCodeWithCoverImage = withCoverImageUrls(embedCodeFixture)

describe('formatEmbedCodeResult', () => {
  it('renders the title and host', () => {
    render(formatEmbedCodeResult(embedCodeWithCoverImage))

    expect(
      screen.getByText(embedCodeFixture.title!)
    ).toBeInTheDocument()
    expect(
      screen.getByText(embedCodeFixture.host)
    ).toBeInTheDocument()
  })

  it('falls back to Untitled when there is no title', () => {
    render(
      formatEmbedCodeResult({
        ...embedCodeWithCoverImage,
        title: undefined
      })
    )

    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('renders a cover image thumbnail when coverImageThumbnailUrl is set', () => {
    render(formatEmbedCodeResult(embedCodeWithCoverImage))

    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('falls back to the full-size cover image when only coverImageUrl is set', () => {
    render(
      formatEmbedCodeResult({
        ...embedCodeWithCoverImage,
        coverImageThumbnailUrl: undefined
      })
    )

    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders no thumbnail when neither cover image field is set', () => {
    render(
      formatEmbedCodeResult({
        ...embedCodeWithCoverImage,
        coverImageThumbnailUrl: undefined,
        coverImageUrl: undefined
      })
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders a Video badge for video embed codes', () => {
    render(formatEmbedCodeResult(embedCodeWithCoverImage))

    expect(screen.getByText('Video')).toBeInTheDocument()
  })
})
