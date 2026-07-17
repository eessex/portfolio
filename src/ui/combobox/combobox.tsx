'use client'

import { useEffect, useId, useRef, useState } from 'react'

import type { EmbeddedItemType, PagePath } from '@/lib/schemas'
import type {
  EmbeddedItem,
  PageDataResponse,
  PageItemClient
} from '@/lib/types'
import { CreateItemButton } from '@/ui/buttons/create-item-button'
import styles from '@/ui/combobox/combobox.module.scss'
import { Loading } from '@/ui/loading'
import { SearchInput } from '@/ui/search-input/search-input'
import {
  type ResultsResponse,
  useResultsList
} from '@/ui/useResultsList'
import { isEmbeddedItemType, itemTypeToLabel } from '@/ui/util'

export interface ComboboxProps<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
> {
  defaultQuery?: string
  initialResults: ResultsResponse<TEmbeddedItem, TPage, S>
  itemType: EmbeddedItemType | PagePath
  label?: string
  placeholder?: string
  formatResult: (item: TEmbeddedItem | TPage) => React.ReactNode
  onCreateNew?: (query?: string) => void
  onSelect: (item: TEmbeddedItem | TPage) => void
}

export function Combobox<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
>({
  defaultQuery,
  initialResults,
  itemType,
  label,
  placeholder,
  formatResult,
  onCreateNew,
  onSelect
}: ComboboxProps<TEmbeddedItem, TPage, S>) {
  const {
    query,
    setQuery,
    items,
    isLoading,
    nextCursor,
    loadMoreRef
  } = useResultsList<TEmbeddedItem, TPage, S>(
    `/api/${itemType}`,
    initialResults,
    defaultQuery
  )

  const listId = useId()
  const loadMoreId = useId()

  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [isOpen, setIsOpen] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const createButtonRef = useRef<HTMLButtonElement>(null)

  function labelText() {
    return label || itemTypeToLabel(itemType, true)
  }

  function placeholderText() {
    return (
      placeholder ||
      `Search ${itemTypeToLabel(itemType, false, true)}`
    )
  }

  function isTargetInsideComponent(target: EventTarget | null) {
    if (!target) return false
    if (target === createButtonRef.current) return false
    return rootRef.current?.contains(target as Node)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!rootRef.current) return
      if (!isTargetInsideComponent(e.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () =>
      document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function optionId(item?: TEmbeddedItem | TPage) {
    return `${listId}-${item?.id || 'new'}`
  }

  function changeHighlightedIndex(index: number) {
    setHighlightedIndex(index)
    const selector = optionId(items[index])
    document
      .getElementById(selector)
      ?.scrollIntoView({ block: 'nearest' })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!items.length) return

    const nextIndex =
      highlightedIndex < items.length - 1 ? highlightedIndex + 1 : 0
    const prevIndex =
      highlightedIndex > 0 ? highlightedIndex - 1 : items.length - 1

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        changeHighlightedIndex(nextIndex)
        break

      case 'ArrowUp':
        e.preventDefault()
        changeHighlightedIndex(prevIndex)
        break

      case 'Enter':
        if (highlightedIndex >= 0) {
          onSelect(items[highlightedIndex])
        }
        break

      case 'Escape':
        changeHighlightedIndex(-1)
        break
    }
  }

  function handleFocus(e: React.FocusEvent) {
    if (!isTargetInsideComponent(e.target)) return
    setIsOpen(true)
  }

  function handleBlur(e: React.FocusEvent) {
    // If focus is moving *outside* the combobox entirely
    if (!isTargetInsideComponent(e.relatedTarget)) {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div
      className={styles['combobox-container']}
      ref={rootRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        label={labelText()}
        placeholder={placeholderText()}
        role='combobox'
        ariaControls={listId}
        ariaActivedescendant={
          highlightedIndex >= 0
            ? optionId(items[highlightedIndex])
            : undefined
        }
        beforeInputChildren={
          onCreateNew &&
          isEmbeddedItemType(itemType) && (
            <CreateItemButton
              className='button-sm'
              ref={createButtonRef}
              itemType={itemType}
              onClick={() => onCreateNew(query || undefined)}
            />
          )
        }
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ul id={listId} role='listbox'>
          {items.map((item, index) => (
            <li
              key={item.id}
              id={optionId(item)}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(item)
              }}
              className={styles['option']}
              role='option'
              aria-selected={index === highlightedIndex}
            >
              {formatResult(item)}
            </li>
          ))}
          {nextCursor && (
            <>
              <li
                id={loadMoreId}
                data-testid='load-more-sentinel'
                style={{ height: 1 }}
                tabIndex={-1}
                aria-hidden='true'
                ref={loadMoreRef}
              />
              {isLoading && <Loading />}
            </>
          )}
        </ul>
      )}
    </div>
  )
}
