'use client'

import { useState } from 'react'

import { type EmbeddedItemType, itemTypeToLabel } from '@/lib/schemas'
import type { EmbeddedItem } from '@/lib/types'
import type { ResponseWithCursor } from '@/lib/util'
import { Combobox } from '@/ui/combobox/combobox'
import styles from '@/ui/form/form.module.scss'
import { SelectedResult } from '@/ui/selected-results/selected-result'
import type { SearchParams } from '@/ui/util'

export interface AttachEmbeddedItemProps<T extends EmbeddedItem> {
  existingItem?: T
  hideCreateNew?: boolean
  /**
   * Server-seeded first page. Omit to fetch on mount.
   */
  initialResults?: ResponseWithCursor<T>
  /**
   *  Params forwarded to every API fetch, e.g. `{ isPress: true }`
   */
  searchParams?: SearchParams
  isRequired?: boolean
  itemType: EmbeddedItemType
  /**
   * Form field name for the hidden id input. Defaults to
   * `${singular(itemType)}Id`; pass explicitly for specific-purpose
   * relations (e.g. `coverImageId` for an `images` item).
   */
  name?: string
  formatResult: (item: T) => React.ReactNode
  renderEditItemForm: (query?: string) => React.ReactNode
}

/**
 * Search for or create a new embedded item. Use this inside other forms.
 * for example, adding a new or existing venue to an event page.
 *
 * TODO: does search input need to be required?
 */
export function AttachEmbeddedItem<T extends EmbeddedItem>({
  existingItem,
  hideCreateNew,
  initialResults,
  searchParams,
  isRequired,
  itemType,
  name,
  formatResult,
  renderEditItemForm
}: AttachEmbeddedItemProps<T>) {
  const [existing, setExisting] = useState<T | null>(
    existingItem || null
  )
  const [mode, setMode] = useState<'search' | 'new'>('search')
  const [query, setQuery] = useState<string | null>(null)

  const existingLabel = itemTypeToLabel(itemType, true)
  const newLabel = `Add New ${itemTypeToLabel(itemType, true, true)}`

  function onSelectItem(item: T) {
    setExisting(item)
  }

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
        <Combobox<T, never, undefined>
          initialResults={initialResults}
          searchParams={searchParams}
          itemType={itemType}
          formatResult={formatResult}
          onCreateNew={
            hideCreateNew
              ? undefined
              : (q) => {
                  setQuery(q || null)
                  setMode('new')
                }
          }
          onSelect={onSelectItem}
          defaultQuery={query || undefined}
        />
      ) : (
        <fieldset>
          <legend>{newLabel}</legend>
          {renderEditItemForm(query || undefined)}
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
