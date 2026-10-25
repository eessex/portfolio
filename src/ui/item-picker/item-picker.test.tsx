import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { z } from 'zod'

import { linkFixture, pressLinkFixture } from '@/lib/links/fixtures'
import { createLinkSchema, type Link } from '@/lib/links/schemas/db'
import {
  compareLinksByDefaultOrder,
  linkOrderGroup
} from '@/lib/links/util'
import { ReleaseTypes } from '@/lib/releases/schemas'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import {
  venueFixtureAlpha,
  venueFixtureBeta
} from '@/lib/venues/fixtures'
import type { Venue } from '@/lib/venues/schemas/db'
import {
  ItemPicker,
  type ItemPickerProps,
  type RenderEditItemFormArgs
} from '@/ui/item-picker/item-picker'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'
import { ItemResultLabel } from '@/ui/item-result-label'
import { useResultsList } from '@/ui/use-results-list'

jest.mock('@/ui/use-results-list')

/**
 * An entry's edit form reads its namespace from context, so these stand
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

    function renderMultiPicker(props = {}) {
      return renderComponent({
        isSearchFirst: true,
        isMulti: true,
        name: 'venueIds',
        ...props
      })
    }

    beforeEach(() => {
      jest.clearAllMocks()
      const actual = jest.requireActual('@/ui/use-results-list')
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

    describe('create-only (isSearchHidden)', () => {
      function renderCreateOnly(props = {}) {
        return renderComponent({
          itemType: 'publishedEditions',
          isMulti: true,
          isSearchHidden: true,
          name: 'editions',
          label: 'Editions',
          renderEditItemForm: () => (
            <PrefixedInput field='format' aria-label='Format' />
          ),
          ...props
        })
      }

      it('renders no search box', () => {
        renderCreateOnly()

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(screen.getByText('Editions')).toBeInTheDocument()
      })

      it('opens a blank editor when the list is empty', () => {
        renderCreateOnly()

        expect(screen.getByLabelText('Format')).toHaveAttribute(
          'name',
          'editions[0].format'
        )
        expect(
          screen.queryByRole('button', {
            name: /new published edition/i
          })
        ).not.toBeInTheDocument()
      })

      it('opens no editor when items exist, just the New button', () => {
        renderCreateOnly({ existingItems: [venueFixtureAlpha] })

        expect(
          screen.queryByLabelText('Format')
        ).not.toBeInTheDocument()
        expect(
          screen.getByRole('button', {
            name: /new published edition/i
          })
        ).toBeInTheDocument()
      })

      it('offers no Cancel on a new draft', () => {
        renderCreateOnly()

        expect(
          screen.queryByRole('button', { name: /^cancel$/i })
        ).not.toBeInTheDocument()
      })

      it('collapses a saved draft instead of opening another', async () => {
        renderCreateOnly()

        fireEvent.change(screen.getByLabelText('Format'), {
          target: { value: 'LP' }
        })
        fireEvent.click(
          screen.getByRole('button', {
            name: /save published edition/i
          })
        )

        await waitFor(() =>
          expect(screen.getByLabelText('Format')).not.toBeVisible()
        )
        expect(screen.getAllByLabelText('Format')).toHaveLength(1)
        expect(
          screen.getByRole('button', {
            name: /new published edition/i
          })
        ).toBeInTheDocument()
      })

      it('opens a new editor from the New button', () => {
        renderCreateOnly({ existingItems: [venueFixtureAlpha] })

        fireEvent.click(
          screen.getByRole('button', {
            name: /new published edition/i
          })
        )

        // new entries join the top of a multi list
        expect(screen.getByLabelText('Format')).toHaveAttribute(
          'name',
          'editions[0].format'
        )
      })
    })

    describe('maxItems', () => {
      function renderCapped(props = {}) {
        return renderComponent({
          itemType: 'publishedEditions',
          isMulti: true,
          isSearchHidden: true,
          maxItems: 2,
          name: 'editions',
          renderEditItemForm: () => (
            <PrefixedInput field='format' aria-label='Format' />
          ),
          ...props
        })
      }

      it('hides New at the cap and shows it again after a remove', () => {
        renderCapped({
          existingItems: [venueFixtureAlpha, venueFixtureBeta]
        })

        expect(
          screen.queryByRole('button', {
            name: /new published edition/i
          })
        ).not.toBeInTheDocument()

        fireEvent.click(
          screen.getAllByRole('button', {
            name: /remove published edition/i
          })[0]!
        )

        expect(
          screen.getByRole('button', {
            name: /new published edition/i
          })
        ).toBeInTheDocument()
      })

      it('shows an "N of max" hint once any item is listed', () => {
        renderCapped({
          existingItems: [venueFixtureAlpha, venueFixtureBeta]
        })

        const hint = () =>
          screen
            .getAllByRole('status')
            .find((el) => el.classList.contains('max-items-hint'))
        expect(hint()).toHaveTextContent('2 of 2, the most allowed')

        fireEvent.click(
          screen.getAllByRole('button', {
            name: /remove published edition/i
          })[0]!
        )

        expect(hint()).toHaveTextContent(/^1 of 2$/)

        fireEvent.click(
          screen.getByRole('button', {
            name: /remove published edition/i
          })
        )

        expect(hint()).toBeEmptyDOMElement()
      })

      it("doesn't count an open blank draft", () => {
        renderCapped({ existingItems: [venueFixtureAlpha] })

        fireEvent.click(
          screen.getByRole('button', {
            name: /new published edition/i
          })
        )

        expect(
          screen
            .getAllByRole('status')
            .find((el) => el.classList.contains('max-items-hint'))
        ).toHaveTextContent(/^1 of 2$/)
      })

      it('shows no hint for a cap of 1', () => {
        renderCapped({
          maxItems: 1,
          existingItems: [venueFixtureAlpha]
        })

        expect(
          screen
            .queryAllByRole('status')
            .find((el) => el.classList.contains('max-items-hint'))
        ).toBeUndefined()
      })

      it('shows New below the cap', () => {
        renderCapped({ existingItems: [venueFixtureAlpha] })

        expect(
          screen.getByRole('button', {
            name: /new published edition/i
          })
        ).toBeInTheDocument()
      })
    })

    describe('isCreateFormAlwaysOpen', () => {
      function renderAlwaysOpen(props = {}) {
        return renderComponent({
          itemType: 'publishedEditions',
          isMulti: true,
          isSearchHidden: true,
          isCreateFormAlwaysOpen: true,
          maxItems: 2,
          name: 'editions',
          renderEditItemForm: () => (
            <PrefixedInput field='format' aria-label='Format' />
          ),
          ...props
        })
      }

      it('drops a cleared form to edit an existing item', () => {
        renderAlwaysOpen({ existingItems: [venueFixtureAlpha] })

        const format = screen.getByLabelText('Format')
        fireEvent.change(format, { target: { value: 'x' } })
        fireEvent.change(format, { target: { value: '' } })
        fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

        expect(
          screen.queryByRole('button', { name: 'Edit' })
        ).not.toBeInTheDocument()
        expect(screen.getAllByLabelText('Format')).toHaveLength(1)
      })

      it('lets a parent submit past a cleared form', () => {
        const onSubmit = jest.fn()
        render(
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            <ItemPicker<Venue>
              {...defaultProps}
              itemType='publishedEditions'
              isMulti
              isSearchHidden
              isCreateFormAlwaysOpen
              maxItems={2}
              name='editions'
              defaultOrder={{ compare: () => 0, resetLabel: 'Sort' }}
              renderEditItemForm={() => (
                <PrefixedInput field='format' aria-label='Format' />
              )}
            />
          </form>
        )

        const format = screen.getByLabelText('Format')
        fireEvent.change(format, { target: { value: 'x' } })
        fireEvent.change(format, { target: { value: '' } })
        fireEvent.submit(format.closest('form')!)

        expect(onSubmit).toHaveBeenCalled()
      })

      it('opens a blank form below the cap, with no New button', () => {
        renderAlwaysOpen({ existingItems: [venueFixtureAlpha] })

        expect(screen.getByLabelText('Format')).toBeVisible()
        expect(
          screen.queryByRole('button', {
            name: /new published edition/i
          })
        ).not.toBeInTheDocument()
      })

      it('opens no form at the cap, and reopens it after a remove', () => {
        renderAlwaysOpen({
          existingItems: [venueFixtureAlpha, venueFixtureBeta]
        })

        expect(
          screen.queryByLabelText('Format')
        ).not.toBeInTheDocument()

        fireEvent.click(
          screen.getAllByRole('button', {
            name: /remove published edition/i
          })[0]!
        )

        expect(screen.getByLabelText('Format')).toBeVisible()
      })

      it('reopens a blank form after a save below the cap', async () => {
        renderAlwaysOpen()

        fireEvent.change(screen.getByLabelText('Format'), {
          target: { value: 'LP' }
        })
        fireEvent.click(
          screen.getByRole('button', {
            name: /save published edition/i
          })
        )

        await waitFor(() =>
          expect(screen.getAllByLabelText('Format')).toHaveLength(2)
        )
        // fieldsets render in creation order: the saved one first
        expect(screen.getAllByLabelText('Format')[1]).toBeVisible()
      })

      it('reopens a blank form after an existing match, never showing New', () => {
        renderAlwaysOpen({
          renderEditItemForm: ({
            onExistingMatch
          }: RenderEditItemFormArgs<Venue, never>) => (
            <>
              <PrefixedInput field='format' aria-label='Format' />
              <button
                type='button'
                onClick={() => onExistingMatch?.(venueFixtureBeta)}
              >
                Match
              </button>
            </>
          )
        })

        fireEvent.click(screen.getByRole('button', { name: 'Match' }))

        expect(
          screen.getByText(venueFixtureBeta.name!)
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Format')).toBeVisible()
        expect(
          screen.queryByRole('button', {
            name: /new published edition/i
          })
        ).not.toBeInTheDocument()
      })

      it('closes the form once a save reaches the cap', async () => {
        renderAlwaysOpen({ existingItems: [venueFixtureAlpha] })

        fireEvent.change(screen.getByLabelText('Format'), {
          target: { value: 'LP' }
        })
        fireEvent.click(
          screen.getByRole('button', {
            name: /save published edition/i
          })
        )

        await waitFor(() =>
          expect(screen.getByLabelText('Format')).not.toBeVisible()
        )
        expect(screen.getAllByLabelText('Format')).toHaveLength(1)
      })
    })

    describe('onExistingMatch', () => {
      function renderMatching(
        match: Venue,
        props: Partial<ItemPickerProps<Venue>> = {}
      ) {
        return renderComponent({
          isMulti: true,
          isSearchHidden: true,
          name: 'venues',
          renderEditItemForm: ({
            onExistingMatch
          }: RenderEditItemFormArgs<Venue, never>) => (
            <>
              <PrefixedInput field='name' aria-label='Name' />
              {onExistingMatch ? (
                <button
                  type='button'
                  onClick={() => onExistingMatch(match)}
                >
                  Match
                </button>
              ) : (
                <span>No match offered</span>
              )}
            </>
          ),
          ...props
        })
      }

      it('replaces a new draft with the existing item and focuses its Edit', async () => {
        renderMatching(venueFixtureBeta)

        fireEvent.click(screen.getByRole('button', { name: 'Match' }))

        await waitFor(() =>
          expect(
            screen.getByRole('button', { name: 'Edit' })
          ).toHaveFocus()
        )
        expect(
          screen.getByText(venueFixtureBeta.name!)
        ).toBeInTheDocument()
        expect(
          screen.queryByLabelText('Name')
        ).not.toBeInTheDocument()
        expect(
          document.querySelector('input[name="venues[0].id"]')
        ).toHaveValue(venueFixtureBeta.id)
      })

      it('keeps the draft position among existing chips', () => {
        renderMatching(venueFixtureBeta, {
          existingItems: [venueFixtureAlpha]
        })

        fireEvent.click(
          screen.getByRole('button', { name: /new venue/i })
        )
        fireEvent.click(screen.getByRole('button', { name: 'Match' }))

        // new entries join the top of a multi list
        expect(
          document.querySelector('input[name="venues[0].id"]')
        ).toHaveValue(venueFixtureBeta.id)
        expect(
          document.querySelector('input[name="venues[1].id"]')
        ).toHaveValue(venueFixtureAlpha.id)
      })

      it('just drops the draft when the item is already listed', () => {
        renderMatching(venueFixtureAlpha, {
          existingItems: [venueFixtureAlpha]
        })

        fireEvent.click(
          screen.getByRole('button', { name: /new venue/i })
        )
        fireEvent.click(screen.getByRole('button', { name: 'Match' }))

        expect(
          screen.getAllByText(venueFixtureAlpha.name!)
        ).toHaveLength(1)
        expect(
          screen.queryByLabelText('Name')
        ).not.toBeInTheDocument()
      })

      it('is not offered when editing an existing item', () => {
        renderMatching(venueFixtureBeta, {
          existingItems: [venueFixtureAlpha]
        })

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

        expect(
          screen.getByText('No match offered')
        ).toBeInTheDocument()
      })
    })

    describe('create from query (isCreatedFromQuery)', () => {
      function renderCreateFromQuery(props = {}) {
        return renderComponent({
          isSearchFirst: true,
          isCreatedFromQuery: true,
          schema: z.object({ name: z.string().min(1) }),
          renderEditItemForm: ({
            query
          }: RenderEditItemFormArgs<Venue, never>) => (
            <PrefixedInput
              field='name'
              aria-label='Name'
              defaultValue={query}
            />
          ),
          ...props
        })
      }

      function typeAndCreate(query: string) {
        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)
        fireEvent.change(combobox, { target: { value: query } })
        fireEvent.mouseDown(
          screen.getByRole('option', { name: `Create “${query}”` })
        )
      }

      it('replaces the New button with a Create option', () => {
        renderCreateFromQuery()

        expect(
          screen.queryByRole('button', { name: /new venue/i })
        ).not.toBeInTheDocument()
      })

      it('collapses straight to a chip holding the query', async () => {
        const { container } = renderCreateFromQuery()

        typeAndCreate('Soap Library')

        await waitFor(() =>
          expect(screen.getByLabelText('Name')).not.toBeVisible()
        )
        expect(
          container.querySelector('input[name="venue.name"]')
        ).toHaveValue('Soap Library')
        expect(
          screen.getByRole('button', { name: 'Edit' })
        ).toHaveFocus()
      })

      it('stays open when the draft fails validation', async () => {
        renderCreateFromQuery({
          schema: z.object({
            name: z.string().min(1),
            city: z.string().min(1)
          })
        })

        typeAndCreate('Soap Library')

        await waitFor(() =>
          expect(screen.getByLabelText('Name')).toHaveFocus()
        )
        expect(screen.getByLabelText('Name')).toBeVisible()
      })
    })

    describe('fixed order (sortBy)', () => {
      const byName = (
        a: Record<string, unknown>,
        b: Record<string, unknown>
      ) => String(a.name).localeCompare(String(b.name))

      function renderSorted(props = {}) {
        return renderComponent({
          itemType: 'publishedEditions',
          isMulti: true,
          isSearchHidden: true,
          name: 'editions',
          sortBy: byName,
          // alpha is "…Texas", beta "…New York": out of order
          existingItems: [venueFixtureAlpha, venueFixtureBeta],
          renderEditItemForm: () => (
            <PrefixedInput field='name' aria-label='Name' />
          ),
          ...props
        })
      }

      it('sorts existing items on load, with no drag controls', () => {
        renderSorted()

        expect(
          screen.queryByRole('button', { name: 'Drag to reorder' })
        ).not.toBeInTheDocument()
        expect(
          screen.getByDisplayValue(venueFixtureBeta.id)
        ).toHaveAttribute('name', 'editions[0].id')
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'editions[1].id')
      })

      it('sorts a saved new item into place', async () => {
        renderSorted()

        fireEvent.click(
          screen.getByRole('button', {
            name: /new published edition/i
          })
        )
        fireEvent.change(screen.getByLabelText('Name'), {
          target: { value: 'Test Venue Boston' }
        })
        fireEvent.click(
          screen.getByRole('button', {
            name: /save published edition/i
          })
        )

        await waitFor(() =>
          expect(screen.getByLabelText('Name')).toHaveAttribute(
            'name',
            'editions[0].name'
          )
        )
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'editions[2].id')
      })
    })

    describe('single id field', () => {
      function idInputs(container: HTMLElement) {
        return container.querySelectorAll<HTMLInputElement>(
          'input[name="venueId"]'
        )
      }

      it('submits an empty id when nothing is selected', () => {
        const { container } = renderComponent()

        const inputs = idInputs(container)
        expect(inputs).toHaveLength(1)
        expect(inputs[0]).toHaveAttribute('type', 'hidden')
        expect(inputs[0]).toHaveValue('')
      })

      it("submits only the selected item's id", () => {
        const { container } = renderComponent({
          existingItem: venueFixtureAlpha
        })

        const inputs = idInputs(container)
        expect(inputs).toHaveLength(1)
        expect(inputs[0]).toHaveValue(venueFixtureAlpha.id)
      })

      it('submits an empty id once the selection is removed', () => {
        const { container } = renderComponent({
          existingItem: venueFixtureAlpha
        })

        fireEvent.click(
          screen.getByRole('button', { name: /remove venue/i })
        )

        const inputs = idInputs(container)
        expect(inputs).toHaveLength(1)
        expect(inputs[0]).toHaveValue('')
      })

      it('submits an empty id alongside a new draft', () => {
        const { container } = renderComponent({
          renderEditItemForm: () => (
            <PrefixedInput field='name' aria-label='Venue name' />
          )
        })

        expect(
          screen.getByLabelText('Venue name')
        ).toBeInTheDocument()
        const inputs = idInputs(container)
        expect(inputs).toHaveLength(1)
        expect(inputs[0]).toHaveValue('')
      })

      it("submits only the item's id while editing it inline", () => {
        const { container } = renderComponent({
          existingItem: venueFixtureAlpha
        })

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

        const inputs = idInputs(container)
        expect(inputs).toHaveLength(1)
        expect(inputs[0]).toHaveValue(venueFixtureAlpha.id)
      })
    })

    describe('required single picker', () => {
      it('flags its empty search box as invalid', () => {
        renderComponent({ isRequired: true, isSearchFirst: true })

        const search = screen.getByRole('combobox')
        expect(search).toBeInvalid()
        expect((search as HTMLInputElement).validationMessage).toBe(
          'Select a venue.'
        )
      })

      it('flags the search box again once the item is removed', () => {
        renderComponent({
          isRequired: true,
          isSearchFirst: true,
          existingItem: venueFixtureAlpha
        })

        fireEvent.click(
          screen.getByRole('button', { name: /remove venue/i })
        )

        expect(screen.getByRole('combobox')).toBeInvalid()
      })

      it('leaves an optional picker valid', () => {
        renderComponent({ isSearchFirst: true })

        expect(screen.getByRole('combobox')).toBeValid()
      })

      it('stays invalid nested in a create-only multi picker', () => {
        renderComponent({
          itemType: 'publishedEditions',
          isMulti: true,
          isSearchHidden: true,
          name: 'editions',
          renderEditItemForm: () => (
            <ItemPicker<Venue>
              {...defaultProps}
              isRequired
              isSearchFirst
            />
          )
        })

        expect(screen.getByRole('combobox')).toBeInvalid()
      })
    })

    describe('isItemEditable', () => {
      it('offers no Edit for an item it rejects', () => {
        renderComponent({
          existingItem: venueFixtureAlpha,
          isItemEditable: () => false
        })

        expect(
          screen.queryByRole('button', { name: 'Edit' })
        ).not.toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /remove venue/i })
        ).toBeInTheDocument()
      })

      it('offers Edit by default', () => {
        renderComponent({ existingItem: venueFixtureAlpha })

        expect(
          screen.getByRole('button', { name: 'Edit' })
        ).toBeInTheDocument()
      })
    })

    describe('nested pickers', () => {
      it("prefixes a nested picker's fields with its parent entry", () => {
        renderComponent({
          itemType: 'publishedEditions',
          isMulti: true,
          isSearchHidden: true,
          name: 'editions',
          renderEditItemForm: () => (
            <ItemPicker<Venue>
              {...defaultProps}
              isSearchFirst
              renderEditItemForm={() => (
                <PrefixedInput field='name' aria-label='Venue name' />
              )}
            />
          )
        })

        fireEvent.click(
          screen.getByRole('button', { name: /new venue/i })
        )

        expect(screen.getByLabelText('Venue name')).toHaveAttribute(
          'name',
          'editions[0].venue.name'
        )
      })

      it('submits a nested selection under the parent entry', () => {
        const { container } = renderComponent({
          itemType: 'publishedEditions',
          isMulti: true,
          isSearchHidden: true,
          name: 'editions',
          renderEditItemForm: () => (
            <ItemPicker<Venue>
              {...defaultProps}
              existingItem={venueFixtureAlpha}
            />
          )
        })

        expect(
          container.querySelector('input[name="editions[0].venueId"]')
        ).toHaveValue(venueFixtureAlpha.id)
      })

      it('keeps an edit that only changes a nested selection', async () => {
        const user = userEvent.setup()
        const { container } = renderComponent({
          itemType: 'publishedEditions',
          isMulti: true,
          isSearchHidden: true,
          name: 'editions',
          existingItems: [venueFixtureAlpha, venueFixtureBeta],
          renderEditItemForm: () => (
            <ItemPicker<Venue>
              {...defaultProps}
              itemType='publishers'
              isSearchFirst
              existingItem={venueFixtureAlpha}
              initialResults={{
                res: [venueFixtureBeta],
                nextCursor: null,
                totalCount: 1
              }}
            />
          )
        })

        await user.click(
          screen.getAllByRole('button', { name: 'Edit' })[0]
        )
        await user.click(
          screen.getByRole('button', { name: /remove publisher/i })
        )
        // no typing: that alone fires the outer fieldset's onChange
        await user.click(screen.getByRole('combobox'))
        await user.click(
          screen.getByRole('option', { name: /new york/i })
        )
        // opening the other entry closes this one
        await user.click(
          screen.getAllByRole('button', { name: 'Edit' }).at(-1)!
        )

        expect(
          container.querySelector('input[name="editions[0].venueId"]')
        ).toHaveValue(venueFixtureBeta.id)
      })
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

      it('opens in search mode when isSearchFirst', () => {
        renderComponent({ isSearchFirst: true })

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
          isSearchFirst: true,
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
        renderMultiPicker({
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
        renderMultiPicker({
          name: undefined
        })

        expect(
          screen.getByRole('combobox', { name: /^Venues/ })
        ).toBeInTheDocument()
      })

      it('renders existing items as indexed chips and keeps the combobox visible', () => {
        renderMultiPicker({
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
        renderMultiPicker()

        const marker = document.querySelector(
          'input[name="venueIds[]"]'
        )
        expect(marker).toHaveAttribute('type', 'hidden')
        expect(marker).toHaveValue('')
      })

      it('prepends a search selection instead of replacing or appending', async () => {
        const user = userEvent.setup()
        renderMultiPicker({
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
        renderMultiPicker({
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
        renderMultiPicker({
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
        renderMultiPicker({
          existingItems: [venueFixtureAlpha]
        })

        expect(
          screen.queryByRole('button', { name: 'Drag to reorder' })
        ).not.toBeInTheDocument()
      })

      it('is reorderable once there are 2+ items, updating indexed names', async () => {
        const user = userEvent.setup()
        renderMultiPicker({
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

      it('excludes an in-progress new entry from the sortable drag set, keeping existing items reorderable', async () => {
        const user = userEvent.setup()
        renderMultiPicker({
          existingItems: [venueFixtureAlpha, venueFixtureBeta]
        })

        const input = screen.getByRole('combobox')
        await user.type(input, 'New Venue')
        await user.click(screen.getByText(/new venue/i))

        expect(screen.getByText('New Venue Form')).toBeInTheDocument()
        // Only the two existing items are drag-reorderable — the
        // new, unsaved entry has no drag handle of its own.
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

    describe('links with a default order', () => {
      const olderPress: Link = {
        ...pressLinkFixture,
        id: 'press-older',
        publishDate: new Date('2020-01-01')
      }
      const newerPress: Link = {
        ...pressLinkFixture,
        id: 'press-newer',
        publishDate: new Date('2024-01-01')
      }

      function renderInForm(
        existingItems: Link[],
        onSubmit = jest.fn()
      ) {
        render(
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit(new FormData(event.currentTarget))
            }}
          >
            <ItemPicker<Link>
              initialResults={{
                res: [],
                nextCursor: null,
                totalCount: 0
              }}
              itemType='links'
              isMulti
              name='links'
              existingItems={existingItems}
              defaultOrder={{
                compare: compareLinksByDefaultOrder,
                group: linkOrderGroup,
                resetLabel: 'Sort press links by date'
              }}
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
              renderEditItemForm={({ existingItem }) => (
                <>
                  <PrefixedInput
                    field='url'
                    aria-label='Link url'
                    defaultValue={existingItem?.url ?? ''}
                    required
                  />
                  <PrefixedInput
                    field='publishDate'
                    aria-label='Publish date'
                    defaultValue={
                      existingItem?.publishDate
                        ?.toISOString()
                        .slice(0, 10) ?? ''
                    }
                  />
                </>
              )}
            />
            <button type='submit'>Save project</button>
          </form>
        )
        return onSubmit
      }

      const submitted = (onSubmit: jest.Mock) =>
        onSubmit.mock.calls[0][0] as FormData

      const related: Link = { ...linkFixture, id: 'related' }
      const dragHandles = () =>
        screen.queryAllByRole('button', { name: 'Drag to reorder' })

      it('hides drag controls when no chip shares its group', () => {
        renderInForm([newerPress, related])

        expect(dragHandles()).toHaveLength(0)
        expect(
          screen.queryByRole('button', { name: 'Move up' })
        ).not.toBeInTheDocument()
        expect(screen.getByDisplayValue('related')).toHaveAttribute(
          'name',
          'links[2].id'
        )
      })

      it('shows drag controls only on chips with a group-mate', () => {
        renderInForm([newerPress, olderPress, related])

        expect(dragHandles()).toHaveLength(2)
      })

      it('disables move buttons at a group boundary', () => {
        const otherRelated: Link = {
          ...linkFixture,
          id: 'other-related'
        }
        renderInForm([newerPress, olderPress, related, otherRelated])

        const moveUp = screen.getAllByRole('button', {
          name: 'Move up'
        })
        const moveDown = screen.getAllByRole('button', {
          name: 'Move down'
        })
        // last press link can't move down; first related can't move up
        expect(moveDown[1]).toBeDisabled()
        expect(moveUp[2]).toBeDisabled()
        expect(moveDown[0]).not.toBeDisabled()
        expect(moveUp[3]).not.toBeDisabled()
      })

      it('sorts a filled-in new related link after press links', async () => {
        const user = userEvent.setup()
        const onSubmit = renderInForm([newerPress])

        fireEvent.change(screen.getByLabelText('Link url'), {
          target: { value: 'https://related.com' }
        })
        await user.click(
          screen.getByRole('button', { name: 'Save project' })
        )

        const formData = submitted(onSubmit)
        expect(formData.get('links[0].id')).toBe('press-newer')
        expect(formData.get('links[1].url')).toBe(
          'https://related.com'
        )
      })

      it('re-sorts a press link whose date was edited', async () => {
        const user = userEvent.setup()
        const onSubmit = renderInForm([newerPress, olderPress])

        await user.click(
          screen.getAllByRole('button', { name: /^edit$/i })[1]
        )
        fireEvent.change(
          await screen.findByLabelText('Publish date'),
          {
            target: { value: '2025-01-01' }
          }
        )
        await user.click(
          screen.getByRole('button', { name: 'Save project' })
        )

        const formData = submitted(onSubmit)
        expect(formData.get('links[0].id')).toBe('press-older')
        expect(formData.get('links[0].publishDate')).toBe(
          '2025-01-01'
        )
        expect(formData.get('links[1].id')).toBe('press-newer')
        expect(
          screen.queryByRole('button', {
            name: 'Sort press links by date'
          })
        ).not.toBeInTheDocument()
      })

      it('blocks the submit while the open editor is invalid', () => {
        const onSubmit = renderInForm([newerPress])

        // touched, missing required url
        fireEvent.change(screen.getByLabelText('Publish date'), {
          target: { value: '2025-01-01' }
        })
        fireEvent.submit(
          screen
            .getByRole('button', { name: 'Save project' })
            .closest('form')!
        )

        expect(onSubmit).not.toHaveBeenCalled()
        expect(screen.getByLabelText('Link url')).toBeInTheDocument()
      })
    })

    describe('create-first default (multi)', () => {
      function renderLinksPicker() {
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

      it('keeps search as the default when isSearchFirst', () => {
        renderMultiPicker({
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
        renderMultiPicker(editableProps)

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
        renderMultiPicker(editableProps)

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

      it('keeps a reopened non-first item in its slot on a global submit', async () => {
        const user = userEvent.setup()
        const { container } = render(
          <form>
            <ItemPicker<Venue>
              {...defaultProps}
              {...editableProps}
              isSearchFirst
              isMulti
              name='venueIds'
              existingItems={[venueFixtureAlpha, venueFixtureBeta]}
            />
          </form>
        )

        await user.click(
          screen.getAllByRole('button', { name: /^edit$/i })[1]
        )
        fireEvent.change(await screen.findByLabelText('Venue name'), {
          target: { value: 'Edited Venue' }
        })

        // submitted with editor open
        const formData = new FormData(
          container.querySelector('form')!
        )
        expect(formData.get('venueIds[0].id')).toBe(
          venueFixtureAlpha.id
        )
        expect(formData.get('venueIds[0].name')).toBeNull()
        expect(formData.get('venueIds[1].id')).toBe(
          venueFixtureBeta.id
        )
        expect(formData.get('venueIds[1].name')).toBe('Edited Venue')
      })

      it('back to search saves a changed edit into its chip', async () => {
        const user = userEvent.setup()
        renderMultiPicker(editableProps)

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        fireEvent.change(await screen.findByLabelText('Venue name'), {
          target: { value: 'Edited Venue' }
        })
        await user.click(
          screen.getByRole('button', { name: /search venue/i })
        )

        expect(screen.getByText('Edited Venue')).toBeInTheDocument()
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
        expect(
          screen.getByDisplayValue('Edited Venue')
        ).toHaveAttribute('name', 'venueIds[0].name')
        expect(
          screen.getByRole('button', { name: /^edit$/i })
        ).toHaveFocus()
      })

      it('back to search keeps an invalid edit open', async () => {
        const user = userEvent.setup()
        renderMultiPicker({
          ...editableProps,
          renderEditItemForm: ({
            existingItem
          }: RenderEditItemFormArgs<Venue, never>) => (
            <PrefixedInput
              field='name'
              aria-label='Venue name'
              required
              defaultValue={existingItem?.name ?? ''}
            />
          )
        })

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        fireEvent.change(await screen.findByLabelText('Venue name'), {
          target: { value: '' }
        })
        await user.click(
          screen.getByRole('button', { name: /search venue/i })
        )

        expect(screen.getByLabelText('Venue name')).toBeVisible()
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueIds[0].id')
      })

      it('Cancel reverts to the read-only chip, dropping the id input', async () => {
        const user = userEvent.setup()
        renderMultiPicker(editableProps)

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
        renderMultiPicker(editableProps)

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
        renderMultiPicker(editableProps)

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

    describe('single item: discard / revert', () => {
      const singleProps = {
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

      it('Cancel on an edit reverts to the existing item, keeping its id', async () => {
        const user = userEvent.setup()
        const { container } = renderComponent({
          ...singleProps,
          existingItem: venueFixtureAlpha
        })

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        fireEvent.change(await screen.findByLabelText('Venue name'), {
          target: { value: 'Edited Venue' }
        })
        await user.click(
          screen.getByRole('button', { name: /^cancel$/i })
        )

        expect(
          screen.getByDisplayValue(venueFixtureAlpha.id)
        ).toHaveAttribute('name', 'venueId')
        expect(container.querySelector('[name^="venue."]')).toBeNull()
      })

      it("Cancel on an edit focuses the reverted item's Edit button", async () => {
        const user = userEvent.setup()
        renderComponent({
          ...singleProps,
          existingItem: venueFixtureAlpha
        })

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        await user.click(
          await screen.findByRole('button', { name: /^cancel$/i })
        )

        expect(
          screen.getByRole('button', { name: /^edit$/i })
        ).toHaveFocus()
      })

      it('Cancel on an edit keeps the item after an earlier draft was discarded', async () => {
        const user = userEvent.setup()
        renderComponent({
          ...singleProps,
          isSearchFirst: true,
          initialResults: {
            res: [venueFixtureBeta],
            nextCursor: null,
            totalCount: 1
          }
        })

        // leaves the picker in create mode with no entries
        await user.click(
          screen.getByRole('button', { name: /new venue/i })
        )
        await user.click(
          screen.getByRole('button', { name: /search venue/i })
        )

        await user.type(screen.getByRole('combobox'), 'New York')
        await user.click(screen.getByText('Test Venue New York'))
        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        await user.click(
          await screen.findByRole('button', { name: /^cancel$/i })
        )

        expect(
          screen.getByDisplayValue(venueFixtureBeta.id)
        ).toHaveAttribute('name', 'venueId')
        expect(
          screen.queryByLabelText('Venue name')
        ).not.toBeInTheDocument()
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

      it('collapses a filled-in create form into a chip when an edit opens', async () => {
        const user = userEvent.setup()
        renderEditableLinks()

        fireEvent.change(screen.getByLabelText('Link url'), {
          target: { value: 'https://new-link.com' }
        })
        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )

        // the filled draft stays mounted (hidden) behind its chip
        await waitFor(() =>
          expect(
            screen
              .getAllByLabelText('Link url')
              .filter((input) => input.closest('[hidden]') === null)
              .map((input) => (input as HTMLInputElement).value)
          ).toEqual([linkFixture.url])
        )
        expect(
          screen.getByDisplayValue('https://new-link.com')
        ).not.toBeVisible()
      })

      it('closes an open edit when another item is edited', async () => {
        const user = userEvent.setup()
        render(
          <ItemPicker<Link>
            {...editableLinkProps}
            existingItems={[linkFixture, pressLinkFixture]}
          />
        )

        const [firstEdit] = screen.getAllByRole('button', {
          name: /^edit$/i
        })
        await user.click(firstEdit)
        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )

        await waitFor(() =>
          expect(screen.getByLabelText('Link url')).toHaveValue(
            pressLinkFixture.url!
          )
        )
        expect(screen.getAllByLabelText('Link url')).toHaveLength(1)
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
        return renderMultiPicker({
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

      it('keeps a changed invalid draft open on toggle back', async () => {
        const user = userEvent.setup()
        renderSinglePicker()

        const urlInput = screen.getByLabelText('Link url')
        fireEvent.change(urlInput, { target: { value: 'x' } })
        fireEvent.change(urlInput, { target: { value: '' } })
        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )

        expect(screen.getByLabelText('Link url')).toBeVisible()
        expect(
          screen.queryByRole('button', { name: /^edit$/i })
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
        existingItem,
        onReadyChange
      }: RenderEditItemFormArgs<Link, never>) {
        const [url, setUrl] = useState(existingItem?.url ?? '')
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
            <fieldset className='disclosure-details' hidden={!url}>
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
          document.querySelector(
            'fieldset.disclosure-details:not([hidden])'
          )
        ).not.toBeInTheDocument()
      })

      it('shows the disclosure details beside the actions row once the main field is filled', () => {
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
        const expanded = document.querySelector(
          'fieldset.disclosure-details:not([hidden])'
        )
        expect(expanded).toBeInTheDocument()
        const fieldset = actions?.closest('.new-item-fieldset')
        expect(fieldset).not.toBeNull()
        expect(actions?.parentElement).toBe(fieldset)
        expect(expanded?.parentElement).toBe(fieldset)
      })

      it('hides the actions row once an edited create-first item is cleared', async () => {
        const user = userEvent.setup()
        renderComponent({
          itemType: 'links',
          existingItem: linkFixture,
          renderEditItemForm: (
            args: RenderEditItemFormArgs<Link, never>
          ) => <CreateFirstForm {...args} />
        })

        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )
        fireEvent.change(screen.getByLabelText('Link url'), {
          target: { value: '' }
        })

        const actions = actionsFor(
          screen.getByRole('button', { name: /save link/i })
        )
        expect(actions).not.toHaveClass('create-form-actions-visible')
        expect(
          document.querySelector(
            'fieldset.disclosure-details:not([hidden])'
          )
        ).not.toBeInTheDocument()
      })

      it('shows the actions row for a search-first form (all fields at once)', async () => {
        const user = userEvent.setup()
        renderComponent({ isSearchFirst: true })

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
        renderMultiPicker({
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

      it('blocks Save and shows the Zod error when the entry fails schema validation the browser would not catch', async () => {
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

      it('toggling back to search keeps a changed invalid draft open with its error', async () => {
        const user = userEvent.setup()
        renderLinkPicker()

        const urlInput = document.querySelector(
          'input[name="links[0].url"]'
        ) as HTMLInputElement
        fireEvent.change(urlInput, {
          target: { value: 'not-a-valid-url' }
        })
        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )

        expect(urlInput).toBeVisible()
        expect(urlInput).toHaveValue('not-a-valid-url')
        expect(screen.getByText('Invalid url')).toBeInTheDocument()
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
      })

      it('clears a corrected error when toggling back to search/chip', async () => {
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
        expect(screen.getByText('Invalid url')).toBeInTheDocument()

        // Correcting the value alone doesn't revalidate.
        fireEvent.change(urlInput, {
          target: { value: 'https://example.com' }
        })
        expect(screen.getByText('Invalid url')).toBeInTheDocument()

        await user.click(
          screen.getByRole('button', { name: /search link/i })
        )
        await user.click(
          screen.getByRole('button', { name: /^edit$/i })
        )

        expect(
          document.querySelector('input[name="links[0].url"]')
        ).toHaveValue('https://example.com')
        expect(
          screen.queryByText('Invalid url')
        ).not.toBeInTheDocument()
      })
    })

    describe('entry name prefix', () => {
      function renderPrefixPicker(props = {}) {
        renderComponent({
          isSearchFirst: true,
          renderEditItemForm: () => <PrefixLabel />,
          ...props
        })
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
      const actual = jest.requireActual('@/ui/use-results-list')
      ;(useResultsList as jest.Mock).mockImplementation(
        actual.useResultsList
      )
      // With no seeded `initialResults`, the combobox fetches its first
      // (grouped) page on mount; resolve it so the update lands in act().
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
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

      it('focuses the search input and opens its results after removing the selected item', async () => {
        ;(useResultsList as jest.Mock).mockReturnValue({
          query: '',
          setQuery: jest.fn(),
          items: [releaseFixture],
          isLoading: false,
          nextCursor: null,
          loadMoreRef: jest.fn(),
          ensureFirstPage: jest.fn()
        })
        const user = userEvent.setup()
        renderReleasePicker({
          existingItem: {
            id: 'release-1',
            title: 'Test Release',
            type: ReleaseTypes.album
          } as ReleaseClient
        })

        await user.click(
          screen.getByRole('button', { name: /remove release/i })
        )

        expect(screen.getByRole('combobox')).toHaveFocus()
        expect(screen.getByRole('listbox')).toBeInTheDocument()
        expect(
          screen.getByText('Searched Release')
        ).toBeInTheDocument()
      })
    })
  })
})
