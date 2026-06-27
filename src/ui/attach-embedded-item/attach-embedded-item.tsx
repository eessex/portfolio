'use client'

import { useState } from 'react'

import type { EmbeddedItem, EmbeddedItemType } from '@/lib/types'
import type { ResponseWithCursor } from '@/lib/util'
import { Combobox } from '@/ui/combobox/combobox'
import styles from '@/ui/form/form.module.scss'
import { SelectedResult } from '@/ui/selected-results/selected-result'
import { itemTypeToLabel } from '@/ui/util'

export interface AttachEmbeddedItemProps<T extends EmbeddedItem> {
  existingItem?: T
  initialResults: ResponseWithCursor<T>
  isRequired?: boolean
  itemType: EmbeddedItemType
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
  initialResults,
  isRequired,
  itemType,
  formatResult,
  renderEditItemForm
}: AttachEmbeddedItemProps<T>) {
  const [existing, setExisting] = useState<T | null>(
    existingItem || null
  )
  const [mode, setMode] = useState<'search' | 'new'>('search')
  const [query, setQuery] = useState<string | null>(null)

  const existingLabel = itemTypeToLabel(itemType, true)
  const newLabel = `Create New ${itemTypeToLabel(itemType, true, true)}`

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
            onClick={() => setExisting(null)}
            itemId={existing.id}
            isRequired={isRequired}
          >
            {formatResult(existing)}
          </SelectedResult>
        </div>
      ) : mode === 'search' ? (
        <Combobox<T>
          initialResults={initialResults}
          itemType={itemType}
          formatResult={formatResult}
          onCreateNew={(q) => {
            setQuery(q || null)
            setMode('new')
          }}
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
