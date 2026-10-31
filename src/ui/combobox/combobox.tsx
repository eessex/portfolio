'use client'

import {
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useEffect, useId, useRef, useState } from 'react'

import {
  type EmbeddedItemType,
  itemTypeToLabel,
  type PagePath
} from '@/lib/schemas'
import { isEmbeddedItemType } from '@/lib/schemas'
import { camelToSnake } from '@/lib/strings'
import type {
  EmbeddedItem,
  PageDataResponse,
  PageItemClient
} from '@/lib/types'
import { type SearchParams } from '@/ui/api-url'
import { CreateItemButton } from '@/ui/buttons/create-item-button'
import styles from '@/ui/combobox/combobox.module.scss'
import { Loading } from '@/ui/loading'
import { SearchInput } from '@/ui/search-input/search-input'
import {
  type ResultsResponse,
  useResultsList
} from '@/ui/use-results-list'

export interface ComboboxProps<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
> {
  defaultQuery?: string
  description?: string
  /** Server-seeded first page; omit to fetch on mount */
  initialResults?: ResultsResponse<TEmbeddedItem, TPage, S>
  /** Params forwarded to every API fetch */
  searchParams?: SearchParams
  itemType: EmbeddedItemType | PagePath
  isRequired?: boolean
  label?: string
  placeholder?: string
  /**
   * The "Search {items}" toggle's text, and the default placeholder;
   * distinguishes two pickers of one item type.
   */
  searchLabel?: string
  /** The "New {item}" button's text. */
  newLabel?: string
  /**
   * Multi pickers keep the combobox mounted while an inline-create
   * editor is open, but hide the search body and swap the "New {item}"
   * button for a "Search {item}" toggle so the two modes are never
   * shown at once.
   */
  isCreating?: boolean
  onBackToSearch?: () => void
  renderExistingResult: (
    item: TEmbeddedItem | TPage
  ) => React.ReactNode
  onCreateNew?: (query?: string) => void
  /**
   * Offers a "Create …" option for the typed query at the end of the
   * results (unless one matches it exactly), replacing the "New {item}"
   * button.
   */
  createOptionLabel?: (query: string) => string
  onSelect: (item: TEmbeddedItem | TPage) => void
}

export function Combobox<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
>({
  defaultQuery,
  description,
  initialResults,
  searchParams,
  itemType,
  isRequired,
  label,
  placeholder,
  searchLabel = `Search ${itemTypeToLabel(itemType, false, true)}`,
  newLabel,
  isCreating,
  onBackToSearch,
  renderExistingResult,
  onCreateNew,
  createOptionLabel,
  onSelect
}: ComboboxProps<TEmbeddedItem, TPage, S>) {
  const {
    query,
    setQuery,
    items,
    isLoading,
    nextCursor,
    loadMoreRef,
    ensureFirstPage
  } = useResultsList<TEmbeddedItem, TPage, S>(
    `/api/${camelToSnake(itemType)}`,
    initialResults,
    { defaultQuery, searchParams }
  )

  const trimmedQuery = query.trim()
  const createQuery =
    createOptionLabel &&
    onCreateNew &&
    trimmedQuery &&
    !items.some((item) => isExactMatch(item, trimmedQuery))
      ? trimmedQuery
      : undefined
  // the create option sits after the results
  const optionCount = items.length + (createQuery ? 1 : 0)

  const listId = useId()
  const loadMoreId = useId()

  // tracked by option id so it follows its option as results change
  const [highlightedId, setHighlightedId] = useState<string>()
  const createOptionId = `${listId}-create`
  const optionIds = [
    ...items.map(optionId),
    ...(createQuery ? [createOptionId] : [])
  ]
  const highlightedIndex = highlightedId
    ? optionIds.indexOf(highlightedId)
    : -1
  const [isOpen, setIsOpen] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const createButtonRef = useRef<HTMLButtonElement>(null)

  function labelText() {
    return label || itemTypeToLabel(itemType, true)
  }

  function placeholderText() {
    return placeholder || searchLabel
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
        setHighlightedId(undefined)
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
    const id = optionIds[index]
    setHighlightedId(id)
    if (id) {
      document
        .getElementById(id)
        ?.scrollIntoView({ block: 'nearest' })
    }
  }

  function handleSelect(item: TEmbeddedItem | TPage) {
    onSelect(item)
    setIsOpen(false)
    setHighlightedId(undefined)
  }

  function handleCreate(newQuery: string) {
    onCreateNew?.(newQuery)
    setIsOpen(false)
    setHighlightedId(undefined)
  }

  function handleQueryChange(newQuery: string) {
    setQuery(newQuery)
    setHighlightedId(undefined)
    setIsOpen(true)
    ensureFirstPage()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setIsOpen(true)
      ensureFirstPage()
      return
    }

    if (!optionCount) return

    const nextIndex =
      highlightedIndex < optionCount - 1 ? highlightedIndex + 1 : 0
    const prevIndex =
      highlightedIndex > 0 ? highlightedIndex - 1 : optionCount - 1

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
        if (highlightedId === createOptionId && createQuery) {
          // don't submit the parent form
          e.preventDefault()
          handleCreate(createQuery)
        } else if (items[highlightedIndex]) {
          handleSelect(items[highlightedIndex])
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
    ensureFirstPage()
  }

  function handleBlur(e: React.FocusEvent) {
    // If focus is moving *outside* the combobox entirely
    if (!isTargetInsideComponent(e.relatedTarget)) {
      setIsOpen(false)
      setHighlightedId(undefined)
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
        onChange={handleQueryChange}
        isRequired={isRequired}
        label={labelText()}
        description={description}
        placeholder={placeholderText()}
        role='combobox'
        ariaControls={listId}
        ariaActivedescendant={
          highlightedIndex >= 0 ? highlightedId : undefined
        }
        isBodyHidden={isCreating}
        beforeInputChildren={
          isCreating
            ? onBackToSearch && (
                <button
                  type='button'
                  className='button-sm'
                  onClick={onBackToSearch}
                >
                  <MagnifyingGlassIcon /> {searchLabel}
                </button>
              )
            : onCreateNew &&
              !createOptionLabel &&
              isEmbeddedItemType(itemType) && (
                <CreateItemButton
                  className='button-sm'
                  ref={createButtonRef}
                  itemType={itemType}
                  label={newLabel}
                  onClick={() => onCreateNew(query || undefined)}
                />
              )
        }
        onKeyDown={handleKeyDown}
      />
      {isOpen && !isCreating && (
        <ul id={listId} role='listbox'>
          {isLoading && items.length === 0 && (
            <li className={styles['loading']}>
              <Loading />
            </li>
          )}
          {items.map((item, index) => (
            <li
              key={item.id}
              id={optionId(item)}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(item)
              }}
              className={styles['option']}
              role='option'
              aria-selected={index === highlightedIndex}
            >
              {renderExistingResult(item)}
            </li>
          ))}
          {createQuery && (
            <li
              id={createOptionId}
              onMouseDown={(e) => {
                e.preventDefault()
                handleCreate(createQuery)
              }}
              className={`${styles['option']} ${styles['create-option']}`}
              role='option'
              aria-selected={highlightedId === createOptionId}
            >
              <PlusIcon /> {createOptionLabel?.(createQuery)}
            </li>
          )}
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
              {isLoading && (
                <li className={styles['loading']}>
                  <Loading />
                </li>
              )}
            </>
          )}
        </ul>
      )}
    </div>
  )
}

/** Case-insensitive match on an item's name (or title). */
function isExactMatch(item: object, query: string) {
  const label =
    'name' in item && typeof item.name === 'string'
      ? item.name
      : 'title' in item && typeof item.title === 'string'
        ? item.title
        : undefined
  return label?.trim().toLowerCase() === query.toLowerCase()
}
