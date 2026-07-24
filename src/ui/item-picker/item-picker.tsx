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
  /** Server-seeded first page; omit to fetch on mount */
  initialResults?: ResultsResponse<TEmbeddedItem, TPage, S>
  /** Params forwarded to every API fetch, e.g. `{ isPress: true }` */
  searchParams?: SearchParams
  isRequired?: boolean
  itemType: EmbeddedItemType | PagePath
  /**
   * Form field name for the hidden id input. Defaults to
   * `${singular(itemType)}Id` (e.g. `releaseId`); pass explicitly for
   * specific-purpose relations (e.g. `coverImageId` for an `images` item).
   */
  name?: string
  formatResult: (item: TEmbeddedItem | TPage) => React.ReactNode
  renderEditItemForm?: (query?: string) => React.ReactNode
}

/**
 * Search for or create a new embedded item, or select an existing page
 * item (event, project, release). Use inside other forms, e.g. adding a
 * venue to an event, or attaching a release to a published edition.
 *
 * `TEmbeddedItem` (or `TPage`/`S`) must be given explicitly at the call
 * site since they can't be inferred from the runtime `itemType` string
 * alone, e.g. `<ItemPicker<never, ReleaseClient, FetchReleasesResult> itemType='releases' .../>`
 * or `<ItemPicker<Venue> itemType='venues' .../>`.
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
  name,
  formatResult,
  renderEditItemForm
}: ItemPickerProps<TEmbeddedItem, TPage, S>) {
  const [existing, setExisting] = useState<
    TEmbeddedItem | TPage | null
  >(existingItem ?? null)
  const [mode, setMode] = useState<'search' | 'new'>('search')
  const [query, setQuery] = useState<string | null>(null)

  const existingLabel = itemTypeToLabel(itemType, true)
  const newLabel = `Add New ${itemTypeToLabel(itemType, true, true)}`

  return (
    <>
      {existing ? (
        <div>
          <h2>{existingLabel}</h2>
          <SelectedResult
            itemType={itemType}
            name={name}
            onClick={() => setExisting(null)}
            item={existing}
            isRequired={isRequired}
          >
            {formatResult(existing)}
          </SelectedResult>
        </div>
      ) : mode === 'search' ? (
        <Combobox<TEmbeddedItem, TPage, S>
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
