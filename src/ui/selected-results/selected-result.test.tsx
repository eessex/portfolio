import { render, screen } from '@testing-library/react'

import { venueFixtureAlpha } from '@/lib/venues/fixtures'
import {
  SelectedResult,
  type SelectedResultProps
} from '@/ui/selected-results/selected-result'

const onClick = jest.fn()

const defaultProps: SelectedResultProps = {
  itemId: venueFixtureAlpha.id,
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

  it('renders an Input with the correct label and value', () => {
    renderSelectedResult()
    const expectedLabel = 'Venue ID'
    const input = screen.getByLabelText(
      expectedLabel
    ) as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe(defaultProps.itemId)
  })

  it('Input has readOnly and hidden attributes', () => {
    renderSelectedResult()
    const input = screen.getByLabelText(
      'Venue ID'
    ) as HTMLInputElement
    expect(input).toHaveAttribute('readOnly')
    expect(input).toHaveAttribute('hidden')
    expect(input).not.toBeRequired()
  })

  it('Input is required when isRequired is true', () => {
    renderSelectedResult({ isRequired: true })
    const input = screen.getByLabelText(
      'Venue ID'
    ) as HTMLInputElement
    expect(input).toBeRequired()
  })
})
