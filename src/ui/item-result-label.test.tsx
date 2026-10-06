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

  it('renders a pre-rendered thumbnail when provided', () => {
    render(
      <ItemResultLabel
        title='Test Title'
        // eslint-disable-next-line @next/next/no-img-element
        thumbnail={<img alt='File preview' src='blob:preview' />}
      />
    )

    expect(
      screen.getByRole('img', { name: 'File preview' })
    ).toBeInTheDocument()
  })

  it('prefers the thumbnail over coverImage when both are provided', () => {
    render(
      <ItemResultLabel
        title='Test Title'
        // eslint-disable-next-line @next/next/no-img-element
        thumbnail={<img alt='File preview' src='blob:preview' />}
        coverImage={{ ...imageFixture, alt: 'Cover alt text' }}
      />
    )

    expect(
      screen.getByRole('img', { name: 'File preview' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: 'Cover alt text' })
    ).not.toBeInTheDocument()
  })

  it('does not render a remove button when onRemove is not provided', () => {
    render(<ItemResultLabel title='Test Title' />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders a remove button with the given label when onRemove is provided', () => {
    const onRemove = jest.fn()
    render(
      <ItemResultLabel
        title='Test Title'
        onRemove={onRemove}
        removeLabel='Remove venue'
      />
    )

    const button = screen.getByRole('button', {
      name: 'Remove venue'
    })
    button.click()

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('does not propagate the remove click to a clickable parent', () => {
    const onRemove = jest.fn()
    const onParentClick = jest.fn()
    render(
      <div onClick={onParentClick}>
        <ItemResultLabel title='Test Title' onRemove={onRemove} />
      </div>
    )

    screen.getByRole('button', { name: 'Remove' }).click()

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onParentClick).not.toHaveBeenCalled()
  })
})
