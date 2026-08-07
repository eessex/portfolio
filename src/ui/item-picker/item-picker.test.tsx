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
import {
  venueFixtureAlpha,
  venueFixtureBeta,
  venueFixtureGamma
} from '@/lib/venues/fixtures'
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
      formatResult: (item, onRemove, removeLabel, extraActions) => (
        <ItemResultLabel
          title={item.name}
          onRemove={onRemove}
          removeLabel={removeLabel}
          extraActions={extraActions}
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

    describe('isMulti', () => {
      it('renders existing items as indexed chips and keeps the combobox visible', () => {
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha, venueFixtureBeta]
        })

        expect(
          screen.getByText('Test Venue Texas')
        ).toBeInTheDocument()
        expect(
          screen.getByText('Test Venue New York')
        ).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()

        const inputs = screen.getAllByDisplayValue(
          /b3b8c8e2|c4c9d9f3/
        ) as HTMLInputElement[]
        expect(inputs[0]).toHaveAttribute('name', 'venueIds[0].id')
        expect(inputs[1]).toHaveAttribute('name', 'venueIds[1].id')
      })

      it('renders an always-present empty marker input', () => {
        renderComponent({ isMulti: true, name: 'venueIds' })

        const marker = document.querySelector(
          'input[name="venueIds[]"]'
        )
        expect(marker).toHaveAttribute('type', 'hidden')
        expect(marker).toHaveValue('')
      })

      it('prepends a search selection instead of replacing or appending', async () => {
        const user = userEvent.setup()
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha],
          initialResults: {
            res: [venueFixtureBeta],
            nextCursor: null,
            totalCount: 1
          }
        })

        const input = screen.getByRole('combobox')
        await user.type(input, 'New York')
        await user.click(screen.getByText('Test Venue New York'))

        expect(
          screen.getByText('Test Venue Texas')
        ).toBeInTheDocument()
        expect(
          screen.getByDisplayValue(venueFixtureBeta.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[1].id')
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      it('removes only the targeted item, keeping the rest and their indices', async () => {
        const user = userEvent.setup()
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha, venueFixtureBeta]
        })

        await user.click(
          screen.getAllByRole('button', { name: /remove venue/i })[0]
        )

        expect(
          screen.queryByText('Test Venue Texas')
        ).not.toBeInTheDocument()
        expect(
          screen.getByText('Test Venue New York')
        ).toBeInTheDocument()
        const input = screen.getByDisplayValue(
          venueFixtureBeta.id
        ) as HTMLInputElement
        expect(input).toHaveAttribute('name', 'venueIds[0].id')
      })

      it('renders the create-new form inline at the front without submitting', async () => {
        const user = userEvent.setup()
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha],
          renderEditItemForm: (
            query: string | undefined,
            index: number | undefined
          ) => (
            <div>
              New form at index {index}, query: {query}
            </div>
          )
        })

        const input = screen.getByRole('combobox')
        await user.type(input, 'New Venue')
        await user.click(screen.getByText(/create/i))

        expect(
          screen.getByText('New form at index 0, query: New Venue')
        ).toBeInTheDocument()
        // the existing item and the combobox both remain, unaffected
        expect(
          screen.getByText('Test Venue Texas')
        ).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      it('does not render drag/move controls with 0 or 1 items', () => {
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha]
        })

        expect(
          screen.queryByRole('button', { name: 'Drag to reorder' })
        ).not.toBeInTheDocument()
      })

      it('is reorderable once there are 2+ items, updating indexed names', async () => {
        const user = userEvent.setup()
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha, venueFixtureBeta]
        })

        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
        expect(
          screen.getByDisplayValue(venueFixtureBeta.id)
        ).toHaveAttribute('name', 'venueIds[1].id')

        const moveDownButtons = screen.getAllByRole('button', {
          name: 'Move down'
        })
        await user.click(moveDownButtons[0])

        expect(
          screen.getByDisplayValue(venueFixtureBeta.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[1].id')
      })
    })

    describe('featured toggle', () => {
      it('renders no featured flag and a "Set as Featured" button on every item when nothing is featured initially', () => {
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha, venueFixtureBeta],
          featured: { isInitiallyFeatured: false, label: 'Featured' }
        })

        expect(
          document.querySelector('input[name="venueIdsFeatured"]')
        ).not.toBeInTheDocument()
        expect(
          screen.getAllByRole('button', { name: 'Set as Featured' })
        ).toHaveLength(2)
      })

      it('pins the initially-featured item first, excludes it from drag, and submits the flag', () => {
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [
            venueFixtureAlpha,
            venueFixtureBeta,
            venueFixtureGamma
          ],
          featured: { isInitiallyFeatured: true, label: 'Featured' }
        })

        const flag = document.querySelector(
          'input[name="venueIdsFeatured"]'
        )
        expect(flag).toHaveAttribute('type', 'hidden')
        expect(flag).toHaveValue('true')

        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
        expect(
          screen.getByRole('button', { name: 'Unset Featured' })
        ).toBeInTheDocument()
        // only the two non-featured items are drag-reorderable
        expect(
          screen.getAllByRole('button', { name: 'Move down' })
        ).toHaveLength(2)
        expect(
          screen.getAllByRole('button', { name: 'Set as Featured' })
        ).toHaveLength(2)
      })

      it('promotes a non-featured item to the pinned front slot', async () => {
        const user = userEvent.setup()
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha, venueFixtureBeta],
          featured: { isInitiallyFeatured: false, label: 'Featured' }
        })

        const setFeaturedButtons = screen.getAllByRole('button', {
          name: 'Set as Featured'
        })
        await user.click(setFeaturedButtons[1])

        expect(
          document.querySelector('input[name="venueIdsFeatured"]')
        ).toHaveValue('true')
        expect(
          screen.getByDisplayValue(venueFixtureBeta.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[1].id')
      })

      it('unsets the featured item without removing it from the list', async () => {
        const user = userEvent.setup()
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha, venueFixtureBeta],
          featured: { isInitiallyFeatured: true, label: 'Featured' }
        })

        await user.click(
          screen.getByRole('button', { name: 'Unset Featured' })
        )

        expect(
          document.querySelector('input[name="venueIdsFeatured"]')
        ).not.toBeInTheDocument()
        expect(
          screen.getByText('Test Venue Texas')
        ).toBeInTheDocument()
        expect(
          screen.getByText('Test Venue New York')
        ).toBeInTheDocument()
        expect(
          screen.getAllByRole('button', { name: 'Set as Featured' })
        ).toHaveLength(2)
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
