import { fireEvent, render, screen } from '@testing-library/react'

import {
  venueFixtureAlpha,
  venueFixtureBeta
} from '@/lib/venues/fixtures'
import type { Venue } from '@/lib/venues/schemas/db'
import { Combobox, type ComboboxProps } from '@/ui/combobox/combobox'
import { useResultsList } from '@/ui/useResultsList'

jest.mock('@/ui/useResultsList')

const onCreateNewMock = jest.fn()
const onSelectMock = jest.fn()
const scrollIntoViewMock = jest
  .spyOn(Element.prototype, 'scrollIntoView')
  .mockImplementation(() => {})

const defaultProps: ComboboxProps<Venue> = {
  defaultQuery: '',
  initialResults: {
    res: [],
    nextCursor: null,
    totalCount: 0
  },
  itemType: 'venues',
  formatResult: (item) => item.name,
  onCreateNew: onCreateNewMock,
  onSelect: onSelectMock
}

const defaultVenues: Venue[] = [venueFixtureAlpha, venueFixtureBeta]

const initialResults: ComboboxProps<Venue>['initialResults'] = {
  res: defaultVenues,
  nextCursor: null,
  totalCount: defaultVenues.length
}

function renderCombobox(props = {}) {
  return render(
    <Combobox<Venue, never, undefined> {...defaultProps} {...props} />
  )
}

describe('Combobox', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial state', () => {
    beforeEach(() => {
      const actual = jest.requireActual('@/ui/useResultsList')

      ;(useResultsList as jest.Mock).mockImplementation(
        actual.useResultsList
      )
    })

    describe('rendering and basic wiring', () => {
      it('renders the combobox input and does not show results until opened', () => {
        renderCombobox()

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.getByLabelText('Venue')).toBeInTheDocument()
        expect(
          screen.getByPlaceholderText('Search venues')
        ).toBeInTheDocument()
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })

      it('renders results using formatResult when opened', () => {
        renderCombobox({ initialResults })
        fireEvent.focus(screen.getByRole('combobox'))

        expect(screen.getByRole('listbox')).toBeInTheDocument()
        expect(
          screen.getByText(venueFixtureAlpha.name!)
        ).toBeInTheDocument()
        expect(
          screen.getByText(venueFixtureBeta.name!)
        ).toBeInTheDocument()
      })

      it('uses provided label and placeholder', () => {
        renderCombobox({
          label: 'Custom Venue Label',
          placeholder: 'Custom Venue Placeholder'
        })

        expect(
          screen.getByLabelText('Custom Venue Label')
        ).toBeInTheDocument()
        expect(
          screen.getByPlaceholderText('Custom Venue Placeholder')
        ).toBeInTheDocument()
      })
    })

    describe('getCoverImage', () => {
      it('renders a cover image thumbnail for each result when provided', () => {
        renderCombobox({
          initialResults,
          getCoverImage: () => ({
            url: 'https://example.com/cover.jpg',
            aspect: 1.5,
            alt: 'Cover alt text'
          })
        })
        fireEvent.focus(screen.getByRole('combobox'))

        expect(
          screen.getAllByRole('img', { name: 'Cover alt text' })
        ).toHaveLength(defaultVenues.length)
      })

      it('does not render a thumbnail when getCoverImage is not provided', () => {
        renderCombobox({ initialResults })
        fireEvent.focus(screen.getByRole('combobox'))

        expect(screen.queryByRole('img')).not.toBeInTheDocument()
      })
    })

    describe('opening and closing behavior', () => {
      it('opens and closes the listbox on focus/focus', () => {
        renderCombobox({ initialResults })
        const combobox = screen.getByRole('combobox')

        fireEvent.focus(combobox)
        expect(screen.getByRole('listbox')).toBeInTheDocument()

        fireEvent.blur(combobox, { relatedTarget: document.body })
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })

      it('opens and closes the listbox on click in/out', () => {
        renderCombobox({ initialResults })
        const combobox = screen.getByRole('combobox')

        fireEvent.focus(combobox)
        expect(screen.getByRole('listbox')).toBeInTheDocument()

        fireEvent.mouseDown(document.body)
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })

      it('resets the highlighted index when the listbox closes', () => {
        renderCombobox({ initialResults })
        const combobox = screen.getByRole('combobox')

        fireEvent.focus(combobox)
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })

        const firstOption = screen.getAllByRole('option')[0]

        expect(combobox).toHaveAttribute(
          'aria-activedescendant',
          firstOption.getAttribute('id')
        )
        expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)

        fireEvent.blur(combobox, { relatedTarget: document.body })
        expect(combobox).not.toHaveAttribute('aria-activedescendant')
      })
    })

    describe('keyboard navigation and selection', () => {
      it('supports arrow navigation, wraparound, escape, and enter selection', () => {
        renderCombobox({ initialResults })

        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)
        const options = () => screen.getAllByRole('option')

        // ArrowDown highlights first option
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        expect(combobox).toHaveAttribute(
          'aria-activedescendant',
          options()[0].id
        )

        // ArrowDown moves highlight to second option
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        expect(combobox).toHaveAttribute(
          'aria-activedescendant',
          options()[1].id
        )

        // ArrowUp wraps from first to last
        fireEvent.keyDown(combobox, { key: 'ArrowUp' })
        fireEvent.keyDown(combobox, { key: 'ArrowUp' })
        expect(combobox).toHaveAttribute(
          'aria-activedescendant',
          options()[1].id
        )

        // Escape clears highlight
        fireEvent.keyDown(combobox, { key: 'Escape' })
        expect(combobox).not.toHaveAttribute('aria-activedescendant')

        // ArrowDown again then Enter selects the highlighted item
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        fireEvent.keyDown(combobox, { key: 'Enter' })

        expect(onSelectMock).toHaveBeenCalledWith(defaultVenues[0])
      })

      it('ignores keyboard interaction when there are no items', () => {
        renderCombobox()

        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)

        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        fireEvent.keyDown(combobox, { key: 'ArrowUp' })
        fireEvent.keyDown(combobox, { key: 'Enter' })
        fireEvent.keyDown(combobox, { key: 'Escape' })

        expect(defaultProps.onSelect).not.toHaveBeenCalled()
      })
    })

    describe('mouse selection', () => {
      it('selects an item on mouse down without blurring the input', () => {
        renderCombobox({ initialResults })

        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)

        const firstOption = screen.getAllByRole('option')[0]
        fireEvent.mouseDown(firstOption)

        expect(onSelectMock).toHaveBeenCalledWith(defaultVenues[0])
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    describe('aria attributes', () => {
      it('keeps aria attributes in sync with highlighted state', () => {
        renderCombobox({ initialResults })

        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)
        const listbox = screen.getByRole('listbox')
        expect(combobox).toHaveAttribute('aria-controls', listbox.id)

        const options = screen.getAllByRole('option')
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        expect(combobox).toHaveAttribute(
          'aria-activedescendant',
          options[0].id
        )
        expect(options[0]).toHaveAttribute('aria-selected', 'true')

        fireEvent.keyDown(combobox, { key: 'Escape' })
        expect(combobox).not.toHaveAttribute('aria-activedescendant')
      })
    })
  })

  describe('loading and pagination', () => {
    it('renders the load-more sentinel and loading indicator when nextCursor is present', () => {
      ;(useResultsList as jest.Mock).mockReturnValue({
        query: '',
        setQuery: jest.fn(),
        items: defaultVenues,
        isLoading: true,
        nextCursor: 'cursor-1',
        loadMoreRef: { current: null }
      })

      renderCombobox({ initialResults })
      fireEvent.focus(screen.getByRole('combobox'))

      expect(
        screen.getByTestId('load-more-sentinel')
      ).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders a loading indicator on the initial fetch before results arrive', () => {
      ;(useResultsList as jest.Mock).mockReturnValue({
        query: '',
        setQuery: jest.fn(),
        items: [],
        isLoading: true,
        nextCursor: null,
        loadMoreRef: { current: null }
      })

      renderCombobox()
      fireEvent.focus(screen.getByRole('combobox'))

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      // it's the initial-load loader, not the pagination one
      expect(
        screen.queryByTestId('load-more-sentinel')
      ).not.toBeInTheDocument()
    })

    it('hides the initial loading indicator once results are present', () => {
      ;(useResultsList as jest.Mock).mockReturnValue({
        query: '',
        setQuery: jest.fn(),
        items: defaultVenues,
        isLoading: true,
        nextCursor: null,
        loadMoreRef: { current: null }
      })

      renderCombobox({ initialResults })
      fireEvent.focus(screen.getByRole('combobox'))

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('does not render pagination elements when nextCursor is null', () => {
      ;(useResultsList as jest.Mock).mockReturnValue({
        query: '',
        setQuery: jest.fn(),
        items: defaultVenues,
        isLoading: false,
        nextCursor: null,
        loadMoreRef: { current: null }
      })

      renderCombobox({ initialResults })

      fireEvent.focus(screen.getByRole('combobox'))

      expect(
        screen.queryByTestId('load-more-sentinel')
      ).not.toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })
})
