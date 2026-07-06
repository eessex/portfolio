import { render, screen } from '@testing-library/react'

import { venueFixtureAlpha } from '@/lib/venues/fixtures'
import {
  SelectedResult,
  type SelectedResultProps
} from '@/ui/selected-results/selected-result'

const onClick = jest.fn()

const defaultProps: SelectedResultProps = {
  item: { id: venueFixtureAlpha.id },
  itemType: 'venues',
  onClick,
  children: 'Child content'
}

const renderSelectedResult = (props = {}) => {
  return render(<SelectedResult {...defaultProps} {...props} />)
}

describe('SelectedResult', () => {
  beforeEach(() => {
    onClick.mockClear()
  })

  it('renders the component with default "div" element', () => {
    const { container } = renderSelectedResult()
    const wrapper = container.firstChild
    expect(wrapper?.nodeName).toBe('DIV')
    expect(wrapper).toHaveClass('selected-result')
  })

  it('renders the component with "li" element when `as="li"` is passed', () => {
    const { container } = renderSelectedResult({ as: 'li' })
    const wrapper = container.firstChild
    expect(wrapper?.nodeName).toBe('LI')
    expect(wrapper).toHaveClass('selected-result')
  })

  it('renders the default children content', () => {
    const { container } = renderSelectedResult()
    expect(container).toHaveTextContent('Child content')
  })

  it('displays a button with correct aria-label based on itemType', () => {
    renderSelectedResult()
    const expectedLabel = 'Remove venue'
    const button = screen.getByRole('button', { name: expectedLabel })
    expect(button).toBeInTheDocument()
  })

  it('calls the onClick handler when remove button is clicked', () => {
    renderSelectedResult()
    const button = screen.getByRole('button', {
      name: 'Remove venue'
    })
    button.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a hidden input with the correct value', () => {
    renderSelectedResult()
    const input = screen.getByDisplayValue(
      defaultProps.item.id
    ) as HTMLInputElement
    expect(input).toBeInTheDocument()
  })

  it('does not render a visible label for the id field', () => {
    renderSelectedResult()
    expect(screen.queryByText('Venue ID')).not.toBeInTheDocument()
  })

  it('Input has readOnly attribute and type=hidden', () => {
    renderSelectedResult()
    const input = screen.getByDisplayValue(
      defaultProps.item.id
    ) as HTMLInputElement
    expect(input).toHaveAttribute('readOnly')
    expect(input).toHaveAttribute('type', 'hidden')
    expect(input).not.toBeRequired()
  })

  it('Input carries the required attribute when isRequired is true', () => {
    renderSelectedResult({ isRequired: true })
    const input = screen.getByDisplayValue(
      defaultProps.item.id
    ) as HTMLInputElement
    // Not asserted via toBeRequired(): per the HTML spec, `required` has
    // no validation effect on type="hidden" inputs, so jest-dom correctly
    // reports it as not required despite the attribute being present.
    expect(input).toHaveAttribute('required')
  })

  it('derives the name attribute from itemType when name is not passed', () => {
    renderSelectedResult()
    const input = screen.getByDisplayValue(
      defaultProps.item.id
    ) as HTMLInputElement
    expect(input).toHaveAttribute('name', 'venueId')
  })

  it('uses the explicit name prop when passed, overriding the default', () => {
    renderSelectedResult({ name: 'coverImageId' })
    const input = screen.getByDisplayValue(
      defaultProps.item.id
    ) as HTMLInputElement
    expect(input).toHaveAttribute('name', 'coverImageId')
  })

  it('does not render an image when coverImage is not provided', () => {
    renderSelectedResult()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders a cover image when provided', () => {
    renderSelectedResult({
      item: {
        id: venueFixtureAlpha.id,
        coverImage: {
          url: 'https://example.com/cover.jpg',
          aspect: 1.5,
          alt: 'Cover alt text'
        }
      }
    })

    const image = screen.getByRole('img', { name: 'Cover alt text' })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute(
      'src',
      expect.stringContaining('cover.jpg')
    )
  })
})
