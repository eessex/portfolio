import {
  render,
  screen
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { venueFixtureAlpha } from '@/lib/venues/fixtures'
import type { Venue } from '@/lib/venues/types'
import {
  AttachEmbeddedItem,
  type AttachEmbeddedItemProps
} from '@/ui/attach-embedded-item/attach-embedded-item'

const defaultProps: AttachEmbeddedItemProps<Venue> = {
  initialResults: {
    res: [],
    nextCursor: null,
    totalCount: 0
  },
  itemType: 'venues',
  formatResult: (item) => item.name,
  renderEditItemForm: () => <div>New Venue Form</div>
}

function renderComponent (props = {}) {
  return render(
    <AttachEmbeddedItem
      {...defaultProps}
      {...props}
    />
  )
}

describe('AttachEmbeddedItem', () => {
  beforeEach(() => {
    fetchMock.resetMocks()

    fetchMock.mockImplementation((_url, _options: RequestInit = {}) => {
      const body = JSON.stringify({
        res: [],
        nextCursor: null,
        totalCount: 0
      })

      return Promise.resolve(
        new Response(body, {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })
  })

  describe('initial render', () => {
    it('renders the combobox when no existing item is provided', () => {
      const { queryByText } = renderComponent()

      expect(queryByText('New Venue Form')).not.toBeInTheDocument()
    })

    it('renders the selected item when an existing item is provided', () => {
      const {
        getByText,
        queryByText
      } = renderComponent({ existingItem: venueFixtureAlpha })

      expect(getByText('Test Venue Texas')).toBeInTheDocument()
      expect(queryByText('New Venue Form')).not.toBeInTheDocument()
    })
  })

  describe('search mode', () => {
    it('allows selecting an item from the combobox', async () => {
      const user = userEvent.setup()
      renderComponent({
        initialResults: {
          res: [venueFixtureAlpha],
          nextCursor: null,
          totalCount: 1
        }
      })
      const input = screen.getByRole('combobox')
      await user.type(input, 'Test')
      await user.click(screen.getByText('Test Venue Texas'))

      expect(screen.getByText('Test Venue Texas')).toBeInTheDocument()
    })

    it('renders the edit item form in create-new mode', async () => {
      renderComponent()

      const input = screen.getByRole('combobox')
      await userEvent.type(input, 'New Venue')
      await userEvent.click(screen.getByText(/create/i))

      expect(screen.getByText('New Venue Form')).toBeInTheDocument()
    })
  })

  describe('create-new mode', () => {
    it('renders the edit item form', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = screen.getByRole('combobox')
      await user.type(input, 'New Venue')
      await user.click(screen.getByText(/create/i))

      expect(screen.getByText('New Venue Form')).toBeInTheDocument()
    })

    it('passes the search query to the edit item form', async () => {
      const user = userEvent.setup()
      renderComponent({ renderEditItemForm: (query: string) => <div>Query: {query}</div> })

      const input = screen.getByRole('combobox')
      await user.type(input, 'Alpha')
      await user.click(screen.getByText(/create/i))

      expect(screen.getByText('Query: Alpha')).toBeInTheDocument()
    })

    it('returns to search mode when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = screen.getByRole('combobox')
      await user.type(input, 'New Venue')
      await user.click(screen.getByText(/create/i))

      expect(screen.getByText('New Venue Form')).toBeInTheDocument()
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

      await user.click(screen.getByText('Cancel'))

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.queryByText('New Venue Form')).not.toBeInTheDocument()
    })
  })

  describe('selected item state', () => {
    it('renders the formatted selected item', () => {
      const { getByText } = renderComponent({ existingItem: venueFixtureAlpha })

      expect(getByText('Test Venue Texas')).toBeInTheDocument()
    })

    it('allows clearing the selected item', async () => {
      const user = userEvent.setup()
      renderComponent({ existingItem: venueFixtureAlpha })

      await user.click(screen.getByRole('button', { name: /remove venue/i }))

      expect(screen.queryByText('Test Venue Texas')).not.toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })
})
