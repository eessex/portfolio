import { render, screen } from '@testing-library/react'

import { imageFixture } from '@/lib/images/fixtures'
import { formatImageResult } from '@/ui/images/format-image-result'

describe('formatImageResult', () => {
  it('renders the title and filename', () => {
    render(formatImageResult(imageFixture))

    expect(screen.getByText(imageFixture.title!)).toBeInTheDocument()
    expect(screen.getByText('image.jpg')).toBeInTheDocument()
    expect(
      screen.queryByText(imageFixture.url)
    ).not.toBeInTheDocument()
  })

  it('falls back to the caption when there is no title', () => {
    render(formatImageResult({ ...imageFixture, title: undefined }))

    expect(
      screen.getByText(imageFixture.caption!)
    ).toBeInTheDocument()
  })

  it('renders a cover image thumbnail', () => {
    render(formatImageResult(imageFixture))

    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders a Press badge when type is press', () => {
    render(formatImageResult({ ...imageFixture, type: 'press' }))

    expect(screen.getByText('Press')).toBeInTheDocument()
  })

  it('renders a Documentation badge when type is documentation', () => {
    render(
      formatImageResult({ ...imageFixture, type: 'documentation' })
    )

    expect(screen.getByText('Documentation')).toBeInTheDocument()
  })

  it('renders a Flyer badge when type is flyer', () => {
    render(formatImageResult({ ...imageFixture, type: 'flyer' }))

    expect(screen.getByText('Flyer')).toBeInTheDocument()
  })

  it('renders an Artwork badge when type is artwork', () => {
    render(formatImageResult({ ...imageFixture, type: 'artwork' }))

    expect(screen.getByText('Artwork')).toBeInTheDocument()
  })

  it('does not render a type badge when type is undefined', () => {
    render(formatImageResult({ ...imageFixture, type: undefined }))

    expect(screen.queryByText('Press')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Documentation')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Flyer')).not.toBeInTheDocument()
    expect(screen.queryByText('Artwork')).not.toBeInTheDocument()
  })
})
