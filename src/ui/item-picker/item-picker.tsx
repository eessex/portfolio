'use client'

import { useState } from 'react'

import {
  type EmbeddedItemType,
  itemTypeToLabel,
  type PagePath
} from '@/lib/schemas'
import type {
  EmbeddedItem,
  PageDataResponse,
  PageItemClient
} from '@/lib/types'
import { Combobox } from '@/ui/combobox/combobox'
import styles from '@/ui/form/form.module.scss'
import { SelectedResult } from '@/ui/selected-results/selected-result'
import type { ResultsResponse } from '@/ui/useResultsList'
import type { SearchParams } from '@/ui/util'

export interface ItemPickerProps<
  TEmbeddedItem extends EmbeddedItem = never,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
> {
  existingItem?: TEmbeddedItem | TPage
  hideCreateNew?: boolean
  /** Server-seeded first page. Omit to fetch on mount. */
  initialResults?: ResultsResponse<TEmbeddedItem, TPage, S>
  label?: string
  searchParams?: SearchParams
  isRequired?: boolean
  itemType: EmbeddedItemType | PagePath
  /**
   * Form field name for the hidden id input. Defaults to
   * `${singular(itemType)}Id`; pass explicitly for specific-purpose
   * relations (e.g. `coverImageId` for an `images` item).
   */
  name?: string
  /**
   * Renders item content for both the `Combobox` dropdown row and
   * the `SelectedResult` chip.
   */
  formatResult: (
    item: TEmbeddedItem | TPage,
    onRemove?: () => void,
    removeLabel?: string
  ) => React.ReactNode
  /**
   * Renders the inline "create new" form. Omit for item types with no
   * such flow (page items like events/projects/releases are created on
   * their own dedicated pages, not inline).
   */
  renderEditItemForm?: (query?: string) => React.ReactNode
}

/**
 * Search for and select an existing item — an embedded item (image,
 * link, venue, etc.) or a page item (event, project, release) — to
 * attach to a form. Embedded items can optionally be created inline via
 * `renderEditItemForm`; page items have their own dedicated create page,
 * so that flow is omitted for them.
 *
 * `TEmbeddedItem`/`TPage`/`S` must be specified explicitly at the call
 * site, since they can't be inferred from the runtime `itemType` string
 * alone, e.g. `<ItemPicker<never, ReleaseClient, FetchReleasesResult>
 * itemType='releases' .../>` or `<ItemPicker<Venue> itemType='venues' .../>`.
 */
export function ItemPicker<
  TEmbeddedItem extends EmbeddedItem = never,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
>({
  existingItem,
  hideCreateNew,
  initialResults,
  searchParams,
  isRequired,
  itemType,
  label,
  name,
  formatResult,
  renderEditItemForm
}: ItemPickerProps<TEmbeddedItem, TPage, S>) {
  const [existing, setExisting] = useState<
    TEmbeddedItem | TPage | null
  >(existingItem ?? null)
  const [mode, setMode] = useState<'search' | 'new'>('search')
  const [query, setQuery] = useState<string | null>(null)

  const existingLabel = label || itemTypeToLabel(itemType, true)
  const newLabel = `Add New ${itemTypeToLabel(itemType, true, true)}`

  return (
    <>
      {existing ? (
        <div>
          <h2>{existingLabel}</h2>
          <SelectedResult
            itemType={itemType}
            name={name}
            id={existing.id}
            isRequired={isRequired}
          >
            {formatResult(
              existing,
              () => setExisting(null),
              `Remove ${itemTypeToLabel(itemType, true, true)}`
            )}
          </SelectedResult>
        </div>
      ) : mode === 'search' ? (
        <Combobox<TEmbeddedItem, TPage, S>
          label={label}
          initialResults={initialResults}
          searchParams={searchParams}
          itemType={itemType}
          formatResult={formatResult}
          onCreateNew={
            renderEditItemForm && !hideCreateNew
              ? (q) => {
                  setQuery(q || null)
                  setMode('new')
                }
              : undefined
          }
          onSelect={setExisting}
          defaultQuery={query || undefined}
        />
      ) : (
        <fieldset>
          <legend>{newLabel}</legend>
          {renderEditItemForm?.(query || undefined)}
          <button
            type='button'
            className={`${styles['cancel']} button-sm`}
            onClick={() => setMode('search')}
          >
            Cancel
          </button>
        </fieldset>
      )}
    </>
  )
}
