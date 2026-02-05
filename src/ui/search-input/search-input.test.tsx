import {
  fireEvent,
  render,
  screen
} from '@testing-library/react'

import {
  SearchInput,
  type SearchInputProps
} from '@/ui/search-input/search-input'

const onChange = jest.fn()
const onClear = jest.fn()
const onKeyDown = jest.fn()

const defaultProps: SearchInputProps = {
  ariaControls: 'search-results',
  ariaActivedescendant: 'search-result-1',
  beforeInputChildren: <button>Before input</button>,
  onChange,
  onClear,
  onKeyDown,
  value: ''
}

const renderComponent = (props = {}) => {
  return render(
    <SearchInput
      {...defaultProps}
      {...props}
    />
  )
}

describe('SearchInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering and basic structure', () => {
    it('renders a search input with an associated label', () => {
      renderComponent()

      const input = screen.getByRole('searchbox')
      const label = screen.getByText('Search')

      expect(input).toBeInTheDocument()
      expect(label).toBeInTheDocument()
      expect(label).toHaveAttribute('for', input.getAttribute('id'))
    })

    it('renders the label as visually hidden when isLabelHidden is true', () => {
      renderComponent({ isLabelHidden: true })

      const label = screen.getByText('Search')
      expect(label).toHaveClass('visually-hidden')
    })

    it('renders beforeInputChildren when provided', () => {
      renderComponent()

      expect(
        screen.getByRole('button', { name: 'Before input' })
      ).toBeInTheDocument()
    })

    it('renders role when provided', () => {
      renderComponent({ role: 'combobox' })

      expect(
        screen.getByRole('combobox')
      ).toBeInTheDocument()
    })
  })

  describe('value and change handling', () => {
    it('renders the initial value', () => {
      renderComponent({ value: 'Initial search' })

      const input = screen.getByRole('searchbox')
      expect(input).toHaveValue('Initial search')
    })

    it('updates the input value and calls onChange when typing', () => {
      renderComponent()

      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: 'hello' } })

      expect(onChange).toHaveBeenCalledWith('hello')
      expect(input).toHaveValue('hello')
    })
  })

  describe('clear behavior', () => {
    it('shows the clear button when mounted with a value', () => {
      renderComponent({ value: 'Hello' })

      expect(
        screen.getByLabelText('Clear search')
      ).toBeInTheDocument()
    })

    it('does not show the clear button when mounted without a value', () => {
      renderComponent({ value: '' })

      expect(
        screen.queryByLabelText('Clear search')
      ).not.toBeInTheDocument()
    })

    it('clears the input and calls onChange when the clear button is clicked', () => {
      renderComponent({ value: 'Hello' })

      const input = screen.getByRole('searchbox')
      const clearButton = screen.getByLabelText('Clear search')

      fireEvent.click(clearButton)

      expect(onChange).toHaveBeenCalledWith('')
      expect(input).toHaveValue('')
    })

    it('calls onClear when the input is cleared via typing', () => {
      renderComponent({ value: 'Hello' })

      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: '' } })

      expect(onChange).toHaveBeenCalledWith('')
      expect(onClear).toHaveBeenCalledTimes(1)
    })
  })

  describe('keyboard interaction', () => {
    it('forwards keydown events to the onKeyDown handler', () => {
      renderComponent()

      const input = screen.getByRole('searchbox')

      fireEvent.keyDown(input, { key: 'ArrowDown' })

      expect(onKeyDown).toHaveBeenCalledTimes(1)
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'ArrowDown' })
      )
    })
  })

  describe('aria attributes and accessibility', () => {
    it('applies aria-controls and aria-activedescendant when provided', () => {
      renderComponent()

      const input = screen.getByRole('searchbox')

      expect(input).toHaveAttribute('aria-controls', 'search-results')
      expect(input).toHaveAttribute(
        'aria-activedescendant',
        'search-result-1'
      )
    })

    it('uses the provided role when specified', () => {
      renderComponent({ role: 'combobox' })

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('falls back to using the label as a placeholder when the label is hidden', () => {
      renderComponent({
        isLabelHidden: true,
        placeholder: undefined
      })

      const input = screen.getByRole('searchbox')

      expect(input).toHaveAttribute('placeholder', 'Search')
    })
  })
})
