import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ReleaseTypes } from '@/lib/releases/schemas'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import { venueFixtureAlpha } from '@/lib/venues/fixtures'
import type { Venue } from '@/lib/venues/schemas/db'
import {
  ItemPicker,
  type ItemPickerProps
} from '@/ui/item-picker/item-picker'
import { ItemResultLabel } from '@/ui/item-result-label'
import { useResultsList } from '@/ui/useResultsList'

jest.mock('@/ui/useResultsList')

describe('ItemPicker', () => {
  describe('embedded items', () => {
    const defaultProps: ItemPickerProps<Venue> = {
      initialResults: {
        res: [],
        nextCursor: null,
        totalCount: 0
      },
      itemType: 'venues',
      name: 'venueId',
      formatResult: (item, onRemove, removeLabel) => (
        <ItemResultLabel
          title={item.name}
          onRemove={onRemove}
          removeLabel={removeLabel}
        />
      ),
      renderEditItemForm: () => <div>New Venue Form</div>
    }

    function renderComponent(props = {}) {
      return render(
        <ItemPicker<Venue> {...defaultProps} {...props} />
      )
    }

    beforeEach(() => {
      jest.clearAllMocks()
      const actual = jest.requireActual('@/ui/useResultsList')
      ;(useResultsList as jest.Mock).mockImplementation(
        actual.useResultsList
      )

      fetchMock.resetMocks()

      fetchMock.mockImplementation(
        (_url, _options: RequestInit = {}) => {
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
        }
      )
    })

    describe('initial render', () => {
      it('renders the combobox when no existing item is provided', () => {
        const { queryByText } = renderComponent()

        expect(queryByText('New Venue Form')).not.toBeInTheDocument()
      })

      it('renders the selected item when an existing item is provided', () => {
        const { getByText, queryByText } = renderComponent({
          existingItem: venueFixtureAlpha
        })

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

        expect(
          screen.getByText('Test Venue Texas')
        ).toBeInTheDocument()
      })

      it('renders the edit item form in create-new mode', async () => {
        renderComponent()

        const input = screen.getByRole('combobox')
        await userEvent.type(input, 'New Venue')
        await userEvent.click(screen.getByText(/create/i))

        expect(screen.getByText('New Venue Form')).toBeInTheDocument()
      })
    })

    describe('hideCreateNew', () => {
      it('does not render the create-new button when hideCreateNew is true', async () => {
        const user = userEvent.setup()
        renderComponent({ hideCreateNew: true })

        const input = screen.getByRole('combobox')
        await user.type(input, 'New Venue')

        expect(screen.queryByText(/create/i)).not.toBeInTheDocument()
      })
    })

    describe('no renderEditItemForm', () => {
      it('does not render the create-new button', async () => {
        const user = userEvent.setup()
        renderComponent({ renderEditItemForm: undefined })

        const input = screen.getByRole('combobox')
        await user.type(input, 'New Venue')

        expect(screen.queryByText(/create/i)).not.toBeInTheDocument()
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
        renderComponent({
          renderEditItemForm: (query: string) => (
            <div>Query: {query}</div>
          )
        })

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
        expect(
          screen.queryByText('New Venue Form')
        ).not.toBeInTheDocument()
      })
    })

    describe('selected item state', () => {
      it('renders the formatted selected item', () => {
        const { getByText } = renderComponent({
          existingItem: venueFixtureAlpha
        })

        expect(getByText('Test Venue Texas')).toBeInTheDocument()
      })

      it('allows clearing the selected item', async () => {
        const user = userEvent.setup()
        renderComponent({ existingItem: venueFixtureAlpha })

        await user.click(
          screen.getByRole('button', { name: /remove venue/i })
        )

        expect(
          screen.queryByText('Test Venue Texas')
        ).not.toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })
    })
  })

  describe('page items', () => {
    const releaseFixture: ReleaseClient = {
      id: 'release-2',
      title: 'Searched Release',
      path: 'releases',
      slug: 'searched-release',
      type: ReleaseTypes.ep
    } as ReleaseClient

    function renderReleasePicker(props = {}) {
      return render(
        <ItemPicker<never, ReleaseClient, FetchReleasesResult>
          itemType='releases'
          isRequired
          formatResult={({ title }, onRemove, removeLabel) => (
            <ItemResultLabel
              title={title}
              onRemove={onRemove}
              removeLabel={removeLabel}
            />
          )}
          {...props}
        />
      )
    }

    beforeEach(() => {
      jest.clearAllMocks()
      const actual = jest.requireActual('@/ui/useResultsList')
      ;(useResultsList as jest.Mock).mockImplementation(
        actual.useResultsList
      )
      // With no seeded `initialResults`, the combobox fetches its first
      // (grouped) page on mount; resolve it so the update lands in act().
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          res: {},
          nextCursor: null,
          totalCount: 0
        })
      })
    })

    describe('initial render', () => {
      it('shows the combobox search input when no item is selected', async () => {
        renderReleasePicker()

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
          screen.queryByText(/remove release/i)
        ).not.toBeInTheDocument()

        await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      })

      it('shows the currently selected item when existingItem is provided', () => {
        renderReleasePicker({
          existingItem: {
            id: 'release-1',
            title: 'Test Release',
            type: ReleaseTypes.album
          } as ReleaseClient
        })

        expect(screen.getByText('Test Release')).toBeInTheDocument()
        const input = screen.getByDisplayValue(
          'release-1'
        ) as HTMLInputElement
        expect(input).toHaveAttribute('name', 'releaseId')
      })
    })

    describe('search mode', () => {
      it('searches and selects an item from the combobox', () => {
        ;(useResultsList as jest.Mock).mockReturnValue({
          query: 'Searched',
          setQuery: jest.fn(),
          items: [releaseFixture],
          isLoading: false,
          nextCursor: null,
          loadMoreRef: jest.fn(),
          ensureFirstPage: jest.fn()
        })

        renderReleasePicker()
        fireEvent.focus(screen.getByRole('combobox'))

        const option = screen.getByText('Searched Release')
        fireEvent.mouseDown(option)

        const releaseIdInput = screen.getByDisplayValue(
          'release-2'
        ) as HTMLInputElement
        expect(releaseIdInput).toHaveAttribute('name', 'releaseId')
        expect(
          screen.getByText('Searched Release')
        ).toBeInTheDocument()
      })
    })

    describe('selected item state', () => {
      it('allows clearing the selected item, returning to search', async () => {
        renderReleasePicker({
          existingItem: {
            id: 'release-1',
            title: 'Test Release',
            type: ReleaseTypes.album
          } as ReleaseClient
        })

        fireEvent.click(
          screen.getByRole('button', { name: /remove release/i })
        )

        expect(
          screen.queryByText('Test Release')
        ).not.toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()

        await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      })
    })
  })
})
