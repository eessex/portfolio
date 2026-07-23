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

  it('renders a Press badge when isPress is true', () => {
    render(formatImageResult({ ...imageFixture, isPress: true }))

    expect(screen.getByText('Press')).toBeInTheDocument()
  })

  it('does not render a Press badge when isPress is false', () => {
    render(formatImageResult({ ...imageFixture, isPress: false }))

    expect(screen.queryByText('Press')).not.toBeInTheDocument()
  })
})
