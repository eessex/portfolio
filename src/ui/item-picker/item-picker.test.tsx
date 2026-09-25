import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { linkFixture, pressLinkFixture } from '@/lib/links/fixtures'
import { createLinkSchema, type Link } from '@/lib/links/schemas/db'
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
  type ItemPickerProps,
  type RenderEditItemFormArgs
} from '@/ui/item-picker/item-picker'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'
import { ItemResultLabel } from '@/ui/item-result-label'
import { useResultsList } from '@/ui/useResultsList'

jest.mock('@/ui/useResultsList')

/**
 * A slot's edit form reads its namespace from context, so these stand
 * in for the real domain forms (hooks can't run in the
 * `renderEditItemForm` callback itself — only in what it renders).
 */
function PrefixedInput({
  field,
  ...attributes
}: { field: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const namePrefix = useNamePrefix()
  return <input name={`${namePrefix}${field}`} {...attributes} />
}

function PrefixLabel() {
  return <>{useNamePrefix()}</>
}

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
      renderExistingResult: (
        item,
        onRemove,
        removeLabel,
        extraActions
      ) => (
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
      it('opens picker in create mode by default', () => {
        renderComponent({
          itemType: 'links',
          renderEditItemForm: () => <div>New Link Form</div>
        })

        expect(screen.getByText('New Link Form')).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /search link/i })
        ).toBeInTheDocument()
      })

      it('opens a search-first itemType in search mode', () => {
        renderComponent()

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
          screen.queryByText('New Venue Form')
        ).not.toBeInTheDocument()
      })

      it('renders an existing item when provided', () => {
        const { getByText, queryByText } = renderComponent({
          existingItem: venueFixtureAlpha
        })

        expect(getByText('Test Venue Texas')).toBeInTheDocument()
        expect(queryByText('New Venue Form')).not.toBeInTheDocument()
      })

      it('passes the description through to the combobox when searching', () => {
        renderComponent({
          description: 'Pick a venue for this event'
        })

        expect(
          screen.getByText('Pick a venue for this event')
        ).toBeInTheDocument()
      })

      it('renders the description alongside the selected item', () => {
        renderComponent({
          existingItem: venueFixtureAlpha,
          description: 'Pick a venue for this event'
        })

        expect(
          screen.getByText('Pick a venue for this event')
        ).toBeInTheDocument()
      })

      it('renders no description when none is provided', () => {
        renderComponent({ existingItem: venueFixtureAlpha })

        expect(document.querySelector('p')).not.toBeInTheDocument()
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
          },
          renderEditItemForm: () => (
            <input
              aria-label='Venue name'
              defaultValue=''
              onChange={() => {}}
              required
            />
          )
        })
        // `venues` is search-first, so the combobox is shown on load.
        const input = screen.getByRole('combobox')
        await user.type(input, 'Test')
        await user.click(screen.getByText('Test Venue Texas'))

        expect(
          screen.getByText('Test Venue Texas')
        ).toBeInTheDocument()
      })

      it('returns to the edit item form after toggling to search and back', async () => {
        const user = userEvent.setup()
        renderComponent({
          itemType: 'links',
          renderEditItemForm: () => (
            <div>
              New Link Form
              <input
                aria-label='Link title'
                defaultValue=''
                onChange={() => {}}
                required
              />
            </div>
          )
        })

        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )
        const input = screen.getByRole('combobox')
        await user.type(input, 'New Link')
        await user.click(
          screen.getByRole('button', { name: /new link/i })
        )

        expect(screen.getByText('New Link Form')).toBeInTheDocument()
      })
    })

    describe('no renderEditItemForm', () => {
      it('does not render the create-new button', async () => {
        const user = userEvent.setup()
        renderComponent({ renderEditItemForm: undefined })

        const input = screen.getByRole('combobox')
        await user.type(input, 'New Venue')

        expect(screen.queryByText(/new/i)).not.toBeInTheDocument()
      })
    })

    describe('create-new mode', () => {
      it('renders the edit item form by default', () => {
        renderComponent({
          itemType: 'links',
          renderEditItemForm: () => <div>New Link Form</div>
        })

        expect(screen.getByText('New Link Form')).toBeInTheDocument()
      })

      it('passes the search query to the edit item form', async () => {
        const user = userEvent.setup()
        renderComponent({
          itemType: 'links',
          renderEditItemForm: ({
            query
          }: RenderEditItemFormArgs<Link, never>) => (
            <div>
              Query: {query}
              <input
                aria-label='Link title'
                defaultValue=''
                onChange={() => {}}
                required
              />
            </div>
          )
        })

        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )
        const input = screen.getByRole('combobox')
        await user.type(input, 'Alpha')
        await user.click(
          screen.getByRole('button', { name: /new link/i })
        )

        expect(screen.getByText('Query: Alpha')).toBeInTheDocument()
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
      it('defaults the list field name to itemType', () => {
        renderComponent({
          isMulti: true,
          name: undefined,
          existingItems: [venueFixtureAlpha]
        })

        expect(screen.getByDisplayValue(/b3b8c8e2/)).toHaveAttribute(
          'name',
          'venues[0].id'
        )
        expect(
          document.querySelector('input[name="venues[]"]')
        ).toBeInTheDocument()
      })

      it('defaults the label to the plural item type', () => {
        renderComponent({ isMulti: true, name: undefined })

        expect(
          screen.getByRole('combobox', { name: /^Venues/ })
        ).toBeInTheDocument()
      })

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
          renderEditItemForm: ({
            query
          }: RenderEditItemFormArgs<Venue, never>) => (
            <div>
              New form at <PrefixLabel />, query: {query}
            </div>
          )
        })

        const input = screen.getByRole('combobox')
        await user.type(input, 'New Venue')
        await user.click(screen.getByText(/new/i))

        expect(
          screen.getByText(
            'New form at venueIds[0]., query: New Venue'
          )
        ).toBeInTheDocument()
        // the existing item remains, unaffected
        expect(
          screen.getByText('Test Venue Texas')
        ).toBeInTheDocument()
        // creating hides the search field (never both at once) and
        // offers a toggle back to it
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /search venue/i })
        ).toBeInTheDocument()
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

      it('excludes an in-progress new slot from the sortable drag set, keeping existing items reorderable', async () => {
        const user = userEvent.setup()
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha, venueFixtureBeta]
        })

        const input = screen.getByRole('combobox')
        await user.type(input, 'New Venue')
        await user.click(screen.getByText(/new venue/i))

        expect(screen.getByText('New Venue Form')).toBeInTheDocument()
        // Only the two existing items are drag-reorderable — the
        // new, unsaved slot has no drag handle of its own.
        expect(
          screen.getAllByRole('button', { name: 'Drag to reorder' })
        ).toHaveLength(2)

        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[1].id')
        expect(
          screen.getByDisplayValue(venueFixtureBeta.id)
        ).toHaveAttribute('name', 'venueIds[2].id')

        const moveDownButtons = screen.getAllByRole('button', {
          name: 'Move down'
        })
        await user.click(moveDownButtons[0])

        expect(
          screen.getByDisplayValue(venueFixtureBeta.id)
        ).toHaveAttribute('name', 'venueIds[1].id')
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[2].id')
      })
    })

    describe('create-first default (multi)', () => {
      function renderLinksPicker(featured?: {
        isInitiallyFeatured: boolean
        label?: string
      }) {
        return render(
          <ItemPicker<Link>
            initialResults={{
              res: [],
              nextCursor: null,
              totalCount: 0
            }}
            itemType='links'
            isMulti
            name='links'
            existingItems={[linkFixture, pressLinkFixture]}
            renderExistingResult={(
              item,
              onRemove,
              removeLabel,
              extraActions
            ) => (
              <ItemResultLabel
                title={item.title ?? item.url}
                onRemove={onRemove}
                removeLabel={removeLabel}
                extraActions={extraActions}
              />
            )}
            renderEditItemForm={() => <div>New Link Form</div>}
            featured={featured}
          />
        )
      }

      it('opens with a blank create form above the existing chips, search hidden', () => {
        renderLinksPicker()

        expect(screen.getByText('New Link Form')).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /search link/i })
        ).toBeInTheDocument()
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

        // Existing items still render, below the blank form — which
        // claims index 0, shifting them to links[1], links[2].
        expect(screen.getByText('Test Link')).toBeInTheDocument()
        expect(
          screen.getByText('Test Press Link')
        ).toBeInTheDocument()
        expect(
          screen.getByDisplayValue(linkFixture.id)
        ).toHaveAttribute('name', 'links[1].id')
        expect(
          screen.getByDisplayValue(pressLinkFixture.id)
        ).toHaveAttribute('name', 'links[2].id')
      })

      it('toggling to search drops the blank form and re-indexes from 0', async () => {
        const user = userEvent.setup()
        renderLinksPicker()

        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
          screen.queryByText('New Link Form')
        ).not.toBeInTheDocument()
        expect(
          screen.getByDisplayValue(linkFixture.id)
        ).toHaveAttribute('name', 'links[0].id')
        expect(
          screen.getByDisplayValue(pressLinkFixture.id)
        ).toHaveAttribute('name', 'links[1].id')
      })

      it('pins an initially-featured item as the closed head, with the blank form after it', () => {
        renderLinksPicker({
          isInitiallyFeatured: true,
          label: 'Featured'
        })

        expect(
          screen.getByDisplayValue(linkFixture.id)
        ).toHaveAttribute('name', 'links[0].id')
        expect(
          document.querySelector('input[name="linksFeatured"]')
        ).toHaveValue('true')

        expect(screen.getByText('New Link Form')).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Unset Featured' })
        ).toBeInTheDocument()
        expect(
          screen.getAllByRole('button', { name: 'Set as Featured' })
        ).toHaveLength(1)
      })

      it('keeps search as the default for search-first types (venues, publishers)', () => {
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha]
        })

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
          screen.queryByText('New Venue Form')
        ).not.toBeInTheDocument()
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
      })
    })

    describe('editing an existing item', () => {
      const editableProps = {
        isMulti: true as const,
        name: 'venueIds',
        existingItems: [venueFixtureAlpha],
        renderEditItemForm: ({
          existingItem
        }: RenderEditItemFormArgs<Venue, never>) => (
          <PrefixedInput
            field='name'
            aria-label='Venue name'
            defaultValue={existingItem?.name ?? ''}
          />
        )
      }

      it('opens the edit form seeded with the existing item on Edit', async () => {
        const user = userEvent.setup()
        renderComponent(editableProps)

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )

        await waitFor(() =>
          expect(screen.getByLabelText('Venue name')).toHaveValue(
            venueFixtureAlpha.name
          )
        )
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
      })

      it('submits the id alongside the edited fields after Save', async () => {
        const user = userEvent.setup()
        renderComponent(editableProps)

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        const nameInput = await screen.findByLabelText('Venue name')
        fireEvent.change(nameInput, {
          target: { value: 'Edited Venue' }
        })
        await user.click(
          screen.getByRole('button', { name: /save venue/i })
        )

        expect(screen.getByText('Edited Venue')).toBeInTheDocument()
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
        expect(
          screen.getByDisplayValue('Edited Venue')
        ).toHaveAttribute('name', 'venueIds[0].name')
      })

      it('Cancel reverts to the read-only chip, dropping the id input', async () => {
        const user = userEvent.setup()
        renderComponent(editableProps)

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        await screen.findByLabelText('Venue name')
        await user.click(
          screen.getByRole('button', { name: /^cancel$/i })
        )

        expect(
          screen.queryByLabelText('Venue name')
        ).not.toBeInTheDocument()
        expect(
          screen.getByText('Test Venue Texas')
        ).toBeInTheDocument()
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
      })

      it('hides the search input while editing, restoring it on Save', async () => {
        const user = userEvent.setup()
        renderComponent(editableProps)

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )

        await screen.findByLabelText('Venue name')
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

        fireEvent.change(screen.getByLabelText('Venue name'), {
          target: { value: 'Edited Venue' }
        })
        await user.click(
          screen.getByRole('button', { name: /save venue/i })
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      it('restores the search input on Cancel from an edit', async () => {
        const user = userEvent.setup()
        renderComponent(editableProps)

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        await screen.findByLabelText('Venue name')
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

        await user.click(
          screen.getByRole('button', { name: /^cancel$/i })
        )
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })
    })

    describe('editing returns to create mode (create-first)', () => {
      const editableLinkProps: ItemPickerProps<Link> = {
        initialResults: {
          res: [],
          nextCursor: null,
          totalCount: 0
        },
        itemType: 'links',
        isMulti: true,
        name: 'links',
        existingItems: [linkFixture],
        renderExistingResult: (
          item,
          onRemove,
          removeLabel,
          extraActions
        ) => (
          <ItemResultLabel
            title={item.title ?? item.url}
            onRemove={onRemove}
            removeLabel={removeLabel}
            extraActions={extraActions}
          />
        ),
        renderEditItemForm: ({ existingItem }) => (
          <PrefixedInput
            field='url'
            aria-label='Link url'
            defaultValue={existingItem?.url ?? ''}
          />
        )
      }

      function renderEditableLinks() {
        return render(<ItemPicker<Link> {...editableLinkProps} />)
      }

      it('drops the resting blank create form when an edit opens', async () => {
        const user = userEvent.setup()
        renderEditableLinks()

        expect(screen.getByLabelText('Link url')).toHaveValue('')

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )

        // the blank is gone: the only editor is the seeded edit, so a
        // single 'Link url' input remains, now carrying the item value
        await waitFor(() =>
          expect(screen.getByLabelText('Link url')).toHaveValue(
            linkFixture.url!
          )
        )
      })

      it('re-seeds a blank create form after saving an edit', async () => {
        const user = userEvent.setup()
        renderEditableLinks()

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        const input = await screen.findByLabelText('Link url')
        fireEvent.change(input, {
          target: { value: 'https://edited-link.com' }
        })
        await user.click(
          screen.getByRole('button', { name: /save link/i })
        )

        expect(screen.getByText('Test Link')).toBeInTheDocument()
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /save link/i })
        ).toBeInTheDocument()
      })

      it('re-seeds a blank create form after cancelling an edit', async () => {
        const user = userEvent.setup()
        renderEditableLinks()

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        await screen.findByLabelText('Link url')
        await user.click(
          screen.getByRole('button', { name: /^cancel$/i })
        )

        expect(screen.getByText('Test Link')).toBeInTheDocument()
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /save link/i })
        ).toBeInTheDocument()
      })
    })

    describe('slim mode (search/create never coexist)', () => {
      function renderVenuePicker(props = {}) {
        return renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha],
          renderEditItemForm: () => (
            <div>
              <PrefixedInput
                field='name'
                defaultValue=''
                onChange={() => {}}
                aria-label='Venue name'
                required
              />
            </div>
          ),
          ...props
        })
      }

      it('shows search by default and hides it once a create editor opens', async () => {
        const user = userEvent.setup()
        renderVenuePicker()

        expect(screen.getByRole('combobox')).toBeInTheDocument()

        await user.click(
          screen.getByRole('button', { name: /new venue/i })
        )

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(
          screen.getByLabelText('Venue name')
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /search venue/i })
        ).toBeInTheDocument()
      })

      it('focuses the create editor on open and the search input on toggle back', async () => {
        const user = userEvent.setup()
        renderVenuePicker()

        await user.click(
          screen.getByRole('button', { name: /new venue/i })
        )
        expect(screen.getByLabelText('Venue name')).toHaveFocus()

        await user.click(
          screen.getByRole('button', { name: /search venue/i })
        )
        expect(screen.getByRole('combobox')).toHaveFocus()
      })

      it('toggling back to search discards an empty draft', async () => {
        const user = userEvent.setup()
        renderVenuePicker()

        await user.click(
          screen.getByRole('button', { name: /new venue/i })
        )
        await user.click(
          screen.getByRole('button', { name: /search venue/i })
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
          screen.queryByLabelText('Venue name')
        ).not.toBeInTheDocument()
        expect(
          screen.getByText('Test Venue Texas')
        ).toBeInTheDocument()
      })

      it('toggling back to search collapses a completed draft into a chip', async () => {
        const user = userEvent.setup()
        renderVenuePicker()

        await user.click(
          screen.getByRole('button', { name: /new venue/i })
        )
        fireEvent.change(screen.getByLabelText('Venue name'), {
          target: { value: 'A New Venue' }
        })
        await user.click(
          screen.getByRole('button', { name: /search venue/i })
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
          screen.getAllByRole('button', { name: /^edit$/i })
        ).toHaveLength(2)
      })
    })

    describe('slim mode (single item)', () => {
      function renderSinglePicker(props = {}) {
        return renderComponent({
          itemType: 'links',
          renderEditItemForm: () => (
            <div>
              <input
                name='url'
                defaultValue=''
                onChange={() => {}}
                aria-label='Link url'
                required
              />
            </div>
          ),
          ...props
        })
      }

      it('opens in create mode with a Search toggle, and swaps to search', async () => {
        const user = userEvent.setup()
        renderSinglePicker()

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(screen.getByLabelText('Link url')).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /search link/i })
        ).toBeInTheDocument()

        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      it('focuses the create editor on open and the search input on toggle back', async () => {
        const user = userEvent.setup()
        renderSinglePicker()

        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )
        await user.click(
          screen.getByRole('button', { name: /new link/i })
        )
        expect(screen.getByLabelText('Link url')).toHaveFocus()

        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )
        expect(screen.getByRole('combobox')).toHaveFocus()
      })

      it('toggling back to search discards an empty draft', async () => {
        const user = userEvent.setup()
        renderSinglePicker()

        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
          screen.queryByLabelText('Link url')
        ).not.toBeInTheDocument()
      })

      it('collapses a completed draft into a chip', async () => {
        const user = userEvent.setup()
        renderSinglePicker()

        fireEvent.change(screen.getByLabelText('Link url'), {
          target: { value: 'https://a-new-link.com' }
        })
        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /^edit$/i })
        ).toBeInTheDocument()
      })

      it('moves focus to the chip Edit control when a completed draft collapses', async () => {
        const user = userEvent.setup()
        renderSinglePicker()

        fireEvent.change(screen.getByLabelText('Link url'), {
          target: { value: 'https://a-new-link.com' }
        })
        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )

        expect(
          screen.getByRole('button', { name: /^edit$/i })
        ).toHaveFocus()
      })
    })

    describe('main field readiness (single item)', () => {
      function renderReadinessPicker(props = {}) {
        return renderComponent({
          itemType: 'links',
          renderEditItemForm: ({
            onReadyChange
          }: RenderEditItemFormArgs<Link, never>) => (
            <div>
              <input
                aria-label='Link url'
                defaultValue=''
                onChange={(e) =>
                  onReadyChange?.(e.target.value.trim() !== '')
                }
              />
            </div>
          ),
          ...props
        })
      }

      it('shows the Search toggle while the main field is empty', () => {
        renderReadinessPicker()

        expect(
          screen.getByRole('button', { name: /search link/i })
        ).toBeInTheDocument()
      })

      it('hides the Search toggle once the main field becomes present and valid', () => {
        renderReadinessPicker()

        fireEvent.change(screen.getByLabelText('Link url'), {
          target: { value: 'https://a-new-link.com' }
        })

        expect(
          screen.queryByRole('button', { name: /search link/i })
        ).not.toBeInTheDocument()
      })

      it('re-shows the Search toggle once the main field is cleared again', () => {
        renderReadinessPicker()
        const input = screen.getByLabelText('Link url')

        fireEvent.change(input, { target: { value: 'A New Link' } })
        fireEvent.change(input, { target: { value: '' } })

        expect(
          screen.getByRole('button', { name: /search link/i })
        ).toBeInTheDocument()
      })

      it('does not pass a readiness callback for multi pickers', () => {
        const renderEditItemForm = jest.fn(
          ({
            onReadyChange
          }: RenderEditItemFormArgs<Link, never>) => {
            void onReadyChange
            return <div>New Link Form</div>
          }
        )
        renderComponent({
          itemType: 'links',
          isMulti: true,
          name: 'links',
          renderEditItemForm
        })

        expect(
          renderEditItemForm.mock.calls[0][0].onReadyChange
        ).toBeUndefined()
      })
    })

    describe('create-form-actions visibility', () => {
      function CreateFirstForm({
        onReadyChange
      }: RenderEditItemFormArgs<Link, never>) {
        const [url, setUrl] = useState('')
        return (
          <>
            <input
              aria-label='Link url'
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                onReadyChange?.(e.target.value.trim() !== '')
              }}
            />
            <fieldset
              className={url ? 'expanded' : undefined}
              hidden={!url}
            >
              <input aria-label='Link title' />
            </fieldset>
          </>
        )
      }

      function actionsFor(button: HTMLElement) {
        return button.closest('.create-form-actions')
      }

      it('hides the actions row for a create-first form showing only its main field', () => {
        renderComponent({
          itemType: 'links',
          renderEditItemForm: (
            args: RenderEditItemFormArgs<Link, never>
          ) => <CreateFirstForm {...args} />
        })

        const actions = actionsFor(
          screen.getByRole('button', { name: /save link/i })
        )
        expect(actions).not.toHaveClass('create-form-actions-visible')
        expect(
          document.querySelector('fieldset.expanded')
        ).not.toBeInTheDocument()
      })

      it('exposes the .expanded hook beside the actions row once the main field is filled', () => {
        renderComponent({
          itemType: 'links',
          renderEditItemForm: (
            args: RenderEditItemFormArgs<Link, never>
          ) => <CreateFirstForm {...args} />
        })

        fireEvent.change(screen.getByLabelText('Link url'), {
          target: { value: 'https://a-new-link.com' }
        })

        const actions = actionsFor(
          screen.getByRole('button', { name: /save link/i })
        )
        const expanded = document.querySelector('fieldset.expanded')
        expect(expanded).toBeInTheDocument()
        const fieldset = actions?.closest('.new-item-fieldset')
        expect(fieldset).not.toBeNull()
        expect(actions?.parentElement).toBe(fieldset)
        expect(expanded?.parentElement).toBe(fieldset)
      })

      it('shows the actions row for a search-first form (all fields at once)', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
          screen.getByRole('button', { name: /new venue/i })
        )

        const actions = actionsFor(
          screen.getByRole('button', { name: /save venue/i })
        )
        expect(actions).toHaveClass('create-form-actions-visible')
      })

      it('shows the actions row, with Cancel, when editing an existing item', async () => {
        const user = userEvent.setup()
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha],
          renderEditItemForm: ({
            existingItem
          }: RenderEditItemFormArgs<Venue, never>) => (
            <PrefixedInput
              field='name'
              aria-label='Venue name'
              defaultValue={existingItem?.name ?? ''}
            />
          )
        })

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        await screen.findByLabelText('Venue name')

        const actions = actionsFor(
          screen.getByRole('button', { name: /save venue/i })
        )
        expect(actions).toHaveClass('create-form-actions-visible')
        expect(
          within(actions as HTMLElement).getByRole('button', {
            name: /^cancel$/i
          })
        ).toBeInTheDocument()
      })
    })

    describe('schema validation', () => {
      function renderLinkPicker(props = {}) {
        return renderComponent({
          itemType: 'links',
          isMulti: true,
          name: 'links',
          schema: createLinkSchema,
          renderEditItemForm: ({
            errors
          }: RenderEditItemFormArgs<Link, never>) => (
            <div>
              <PrefixedInput
                field='url'
                defaultValue=''
                onChange={() => {}}
              />
              {errors?.url && <p>{errors.url.join(', ')}</p>}
            </div>
          ),
          ...props
        })
      }

      it('blocks Save and shows the Zod error when the slot fails schema validation the browser would not catch', async () => {
        const user = userEvent.setup()
        renderLinkPicker()

        const urlInput = document.querySelector(
          'input[name="links[0].url"]'
        ) as HTMLInputElement
        fireEvent.change(urlInput, {
          target: { value: 'not-a-valid-url' }
        })

        await user.click(
          screen.getByRole('button', { name: /save link/i })
        )

        expect(
          document.querySelectorAll('input[name$=".url"]')
        ).toHaveLength(1)
        expect(screen.getByText('Invalid url')).toBeInTheDocument()
      })

      it('opens a fresh create editor after Save so the next item can be added', async () => {
        const user = userEvent.setup()
        renderLinkPicker()

        const urlInput = document.querySelector(
          'input[name="links[0].url"]'
        ) as HTMLInputElement
        fireEvent.change(urlInput, {
          target: { value: 'https://example.com' }
        })

        await user.click(
          screen.getByRole('button', { name: /save link/i })
        )

        expect(
          document.querySelectorAll('input[name$=".url"]')
        ).toHaveLength(2)
      })

      it('moves focus to the reopened create editor after Save', async () => {
        const user = userEvent.setup()
        renderLinkPicker()

        const urlInput = document.querySelector(
          'input[name="links[0].url"]'
        ) as HTMLInputElement
        fireEvent.change(urlInput, {
          target: { value: 'https://example.com' }
        })

        await user.click(
          screen.getByRole('button', { name: /save link/i })
        )

        const inputs = document.querySelectorAll<HTMLInputElement>(
          'input[name$=".url"]'
        )
        const reopened = Array.from(inputs).find(
          (i) => i.value === ''
        )
        expect(reopened).toHaveFocus()
      })
    })

    describe('slot name prefix', () => {
      function renderPrefixPicker(props = {}) {
        renderComponent({
          renderEditItemForm: () => <PrefixLabel />,
          ...props
        })
        // Venues are search-first, so the form only mounts on New.
        fireEvent.click(
          screen.getByRole('button', { name: /new venue/i })
        )
      }

      it("namespaces a single item under its type's singular", () => {
        renderPrefixPicker()

        expect(screen.getByText('venue.')).toBeInTheDocument()
      })

      it('derives it from the id field name when one is given', () => {
        renderPrefixPicker({ name: 'coverImageId' })

        expect(screen.getByText('coverImage.')).toBeInTheDocument()
      })

      it('indexes under the array name when isMulti', () => {
        renderPrefixPicker({ isMulti: true, name: 'venueIds' })

        expect(screen.getByText('venueIds[0].')).toBeInTheDocument()
      })

      it('leaves an edit form outside a picker unprefixed', () => {
        render(<PrefixedInput field='city' aria-label='City' />)

        expect(screen.getByLabelText('City')).toHaveAttribute(
          'name',
          'city'
        )
      })
    })

    describe('schema validation (single item, blur-triggered)', () => {
      function renderLinkPicker(props = {}) {
        return renderComponent({
          itemType: 'links',
          name: 'linkId',
          schema: createLinkSchema,
          renderEditItemForm: ({
            errors
          }: RenderEditItemFormArgs<Link, never>) => (
            <div>
              <PrefixedInput
                field='url'
                defaultValue=''
                onChange={() => {}}
              />
              {errors?.url && <p>{errors.url.join(', ')}</p>}
            </div>
          ),
          ...props
        })
      }

      it('shows the Zod error once focus leaves the fieldset with invalid data', async () => {
        renderLinkPicker()

        const urlInput = document.querySelector(
          'input[name="link.url"]'
        ) as HTMLInputElement
        fireEvent.change(urlInput, {
          target: { value: 'not-a-valid-url' }
        })
        fireEvent.blur(urlInput)

        expect(screen.getByText('Invalid url')).toBeInTheDocument()
      })

      it('does not validate while focus moves to another element within the fieldset', async () => {
        renderLinkPicker()

        const urlInput = document.querySelector(
          'input[name="link.url"]'
        ) as HTMLInputElement
        const saveButton = screen.getByRole('button', {
          name: /save link/i
        })
        fireEvent.change(urlInput, {
          target: { value: 'not-a-valid-url' }
        })
        fireEvent.blur(urlInput, { relatedTarget: saveButton })

        expect(
          screen.queryByText('Invalid url')
        ).not.toBeInTheDocument()
      })

      it('clears the error once the field becomes valid and loses focus again', async () => {
        renderLinkPicker()

        const urlInput = document.querySelector(
          'input[name="link.url"]'
        ) as HTMLInputElement
        fireEvent.change(urlInput, {
          target: { value: 'not-a-valid-url' }
        })
        fireEvent.blur(urlInput)
        expect(screen.getByText('Invalid url')).toBeInTheDocument()

        fireEvent.change(urlInput, {
          target: { value: 'https://example.com' }
        })
        fireEvent.blur(urlInput)

        expect(
          screen.queryByText('Invalid url')
        ).not.toBeInTheDocument()
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

      it('keeps the create form open (search hidden) when an existing chip is set featured', async () => {
        const user = userEvent.setup()
        renderComponent({
          isMulti: true,
          name: 'venueIds',
          existingItems: [venueFixtureAlpha],
          featured: { isInitiallyFeatured: false, label: 'Featured' }
        })

        await user.click(
          screen.getByRole('button', { name: /new venue/i })
        )
        expect(screen.getByText('New Venue Form')).toBeInTheDocument()
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

        const setFeaturedButtons = screen.getAllByRole('button', {
          name: 'Set as Featured'
        })
        await user.click(setFeaturedButtons[0])

        expect(screen.getByText('New Venue Form')).toBeInTheDocument()
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
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
          renderExistingResult={(
            { title },
            onRemove,
            removeLabel
          ) => (
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
