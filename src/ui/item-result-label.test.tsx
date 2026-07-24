import { render, screen } from '@testing-library/react'

import { imageFixture } from '@/lib/images/fixtures'
import { ItemResultLabel } from '@/ui/item-result-label'

describe('ItemResultLabel', () => {
  it('renders the title', () => {
    render(<ItemResultLabel title='Test Title' />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders a subtitle line when provided', () => {
    render(<ItemResultLabel title='Test Title' subtitle='test.jpg' />)

    expect(screen.getByText('test.jpg')).toBeInTheDocument()
  })

  it('renders no subtitle line when omitted', () => {
    const { container } = render(
      <ItemResultLabel title='Test Title' />
    )

    expect(container.querySelector('small')).not.toBeInTheDocument()
  })

  it('renders badges when provided', () => {
    render(
      <ItemResultLabel
        title='Test Title'
        badges={[{ text: 'Press' }]}
      />
    )

    expect(screen.getByText('Press')).toBeInTheDocument()
  })

  it('does not render an image when coverImage is not provided', () => {
    render(<ItemResultLabel title='Test Title' />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders a cover image thumbnail when provided', () => {
    render(
      <ItemResultLabel
        title='Test Title'
        coverImage={{
          ...imageFixture,
          alt: 'Cover alt text'
        }}
      />
    )

    const image = screen.getByRole('img', { name: 'Cover alt text' })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent(imageFixture.url))
    )
  })
})
