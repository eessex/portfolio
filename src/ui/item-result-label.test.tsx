import { render, screen } from '@testing-library/react'

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
})
