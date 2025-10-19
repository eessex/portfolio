'use client'

import { clsx } from 'clsx'
import React, {
  useId,
  useState
} from 'react'

import type { EventClient } from '@/lib/events/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type {
  PageDataResponse,
  PageItemClient,
  PagePathType
} from '@/lib/types'
import { ExpandCollapseButton } from '@/ui/filters/expand-collapse-button'
import { FiltersWrapper } from '@/ui/filters/filters'
import { SortButton } from '@/ui/filters/sort-button'
import { Select } from '@/ui/form/select'
import { itemSortDate } from '@/ui/items/item-date'
import styles from '@/ui/items/items-table/items-table.module.scss'
import { ItemsTableRow } from '@/ui/items/items-table/items-table-row'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import { SearchInput } from '@/ui/search-input/search-input'
import {
  formattedItemType,
  snakeToCamel
} from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'

export function ItemsTable ({
  items,
  path = 'items',
  isCategoryVisible,
  isExpandedOnLoad,
  isPathTypeVisible
}: {
  items: PageDataResponse[]
  path?: PagePathType | 'items'
  isCategoryVisible?: boolean
  isExpandedOnLoad?: boolean
  isPathTypeVisible?: boolean
}) {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [isExpanded, setIsExpanded] = useState(!!isExpandedOnLoad)
  const [filterType, setFilterType] = useState<string | undefined>(undefined)

  const activeCategories: string[] = items.length
    ? items.map(item =>
      Object.entries(item)
        .map(([k, v]) => v.length > 0 ? snakeToCamel(k) : null)
        .filter(Boolean) as string[]
    ).flat()
    : []

  function allItems () {
    const allItems: PageItemClient[][] = []
    if (items.length) {
      items.map(item =>
        Object.entries(item)
          .filter(([_k, v]) => v.length > 0 && allItems.push(v))
      )
    }
    return allItems.flat()
  }

  function flatItems (_items: ReturnType<typeof displayedItems>) {
    const allItems: PageItemClient[][] = []
    if (_items.length) {
      _items.map(item =>
        Object.entries(item)
          .filter(([_k, v]) => v.length > 0 && allItems.push(v))
      )
    }
    return allItems.flat()
  }

  function displayedItems () {
    if (searchTerm.length > 0) {
      return searchResults()
    } else if (filterType) {
      return filteredItems()
    } else {
      return sortedItems()
    }
  }

  function filteredItems () {
    if (!filterType) return sortedItems()

    const filteredItems: { [key: string]: PageItemClient[] } = {}

    sortedItems().forEach(i => Object.entries(i).forEach(e => {
      if (e[0] === filterType) {
        filteredItems[e[0]] = e[1]
      }
    }))
    return filteredItems ? [filteredItems] : []
  }

  function searchResults () {
    if (filterType) {
      return searchFilteredNestedArrays(filteredItems())
    } else if (activeCategories.length > 1) {
      return searchFilteredNestedArrays(sortedItems())
    } else {
      const searchResults = sortedItemArray(searchResultMatches(allItems()))
      return [{ searchResults }]
    }
  }

  function searchResultMatches (items: PageItemClient[]) {
    const lowerSearch = searchTerm.toLowerCase()
    return items.filter(item => {
      return Object.values(item).some(val =>
        typeof val === 'string' &&
        val.toLowerCase().includes(lowerSearch)
      )
    })
  }

  function searchFilteredNestedArrays (data: { [key: string]: PageItemClient[] }[]) {
    return data.map(entry => {
      const filteredEntry: Record<string, PageItemClient[]> = {}

      for (const key in entry) {
        const value = entry[key]
        filteredEntry[key] = searchResultMatches(value)
      }
      return filteredEntry
    })
  }

  function sortedItems () {
    return items.map(entry => {
      const reversedEntry = { ...entry }
      Object.entries(entry).forEach(([key, value]) => {
        if (Array.isArray(value) && sortDirection === 'asc') {
          // @ts-expect-error FIXME
          (reversedEntry as PageDataResponse)[key] = [...value].reverse()
        }
      })
      return reversedEntry
    })
  }

  function sortedItemArray (itemArray: PageItemClient[]) {
    const isDefaultDatePreferred = items.length > 0

    const sortedArray = itemArray.sort((a, b) => {
      const dateA = itemSortDate(a, isDefaultDatePreferred) ? new Date(itemSortDate(a, isDefaultDatePreferred)).getTime() : 0
      const dateB = itemSortDate(b, isDefaultDatePreferred) ? new Date(itemSortDate(b, isDefaultDatePreferred)).getTime() : 0
      return dateB - dateA
    })

    if (sortDirection === 'asc') {
      return [...sortedArray].reverse()
    }
    return sortedArray
  }

  function tableSectionTitle (category?: string, itemCount?: number) {
    if (category) {
      const typeLabel = formattedItemType(category, false, true)
      if (searchTerm.length > 0) {
        return `${typeLabel} matching "${searchTerm}" (${itemCount})`
      } else {
        return typeLabel
      }
    }
  }

  const isFilterable = allItems().length > 20

  const isDetailColumnVisible = ['events', 'releases', 'items'].includes(path)

  function tableColspan () {
    let cols = 2
    /** subtype: i.e. soloRelease, featuredOn */
    if (isCategoryVisible) cols += 1
    /** item has type-specific children, venue, publishedEditions */
    if (isDetailColumnVisible) cols += 1
    /** is grid view: image visible */
    if (isExpanded) cols += 1
    /** multiple item types present: path/type column visible (i.e. events, releases) */
    if (isPathTypeVisible) cols += 1
    return cols
  }

  const colSpan = tableColspan()
  const tableId = useId()
  const tbodyId = useId()

  if (allItems().length === 0) return null

  return (
    <div className={styles['items-table']}>
      <FiltersWrapper
        itemType={path}
        controlsId={tableId}
      >
        <ExpandCollapseButton
          ariaControls={tableId}
          isExpanded={!!isExpanded}
          onExpand={setIsExpanded}
          openLabel='Show me the art'
          closeLabel='Hide the art'
        />
        {isFilterable && setSortDirection && (
          <SortButton
            ariaControls={tableId}
            isAsc={sortDirection === 'asc'}
            onClick={() => {
              if (setSortDirection) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }
            }}
          />
        )}
        {isFilterable && activeCategories.length > 1 && (
          <Select
            ariaControls={tableId}
            options={activeCategories}
            onChange={setFilterType}
            placeholder='No filters'
            label={`Filter ${path}`}
            value={filterType}
          />
        )}
        {isFilterable && (
          <SearchInput
            ariaControls={tableId}
            value={searchTerm}
            onChange={setSearchTerm}
            label={`Search ${path}`}
          />
        )}
      </FiltersWrapper>

      <table
        id={tableId}
        role='region'
        aria-live='polite'
      >
        <thead className='visually-hidden'>
          <tr>
            {isExpanded && (
              <th
                aria-hidden='true'
                scope='col'
              >
                Image
              </th>
            )}
            {isPathTypeVisible && <th scope='col'>Type</th>}
            <th scope='col'>Date</th>
            <th scope='col'>Title</th>
            {isDetailColumnVisible && <th scope='col'>Details</th>}
            {isCategoryVisible && <th scope='col'>Category</th>}
          </tr>
        </thead>

        {!flatItems(displayedItems()).length && (
          <tbody
            className={clsx(styles['table-body'], isExpanded && styles['table-body--expanded'])}
            aria-labelledby={`${tbodyId}-search`}
          >
            <tr className={styles['table-rowgroup-heading'] + ' heading'}>
              <td
                id={`${tbodyId}-search`}
                colSpan={colSpan}
              >
                Search results for "{searchTerm}"
              </td>
            </tr>
            <tr className={styles['no-results']}>
              <td colSpan={colSpan}>
                No results found.
              </td>
            </tr>
          </tbody>
        )}

        {displayedItems().map((category, index) => Object.entries(category).map(([key, value]) => value.length > 0 && (
          <tbody
            key={`${index}-${key}`}
            aria-labelledby={`${tbodyId}-${key}`}
            className={clsx(styles['table-body'], isExpanded && styles['table-body--expanded'])}
          >
            <tr className={styles['table-rowgroup-heading'] + ' heading'}>
              <td
                id={`${tbodyId}-${key}`}
                colSpan={colSpan}
              >
                {tableSectionTitle(key, value.length)}
              </td>
            </tr>
            {value.map((item, index) => (
              <ItemsTableItem
                item={item}
                index={index}
                key={`${item.id}-${index}`}
                isExpanded={!!isExpanded}
                isCategoryVisible={!!isCategoryVisible}
                isPathTypeVisible={!!isPathTypeVisible}
              />
            ))}
          </tbody>
        )))}
      </table>
    </div>
  )
}

function ItemsTableItem ({
  item,
  index,
  isExpanded,
  isCategoryVisible,
  isPathTypeVisible
}: {
  item: PageItemClient
  index: number
  isExpanded: boolean
  isCategoryVisible?: boolean
  isPathTypeVisible?: boolean
}) {
  switch (item.path) {
    case 'events':
      return (
        <ItemsTableRow
          item={item}
          index={index}
          isExpanded={isExpanded}
          isCategoryVisible={isCategoryVisible}
          isPathTypeVisible={isPathTypeVisible}
        >
          {(item as EventClient).venue && (
            <VenueInline
              venue={(item as EventClient).venue!}
              format='sm'
            />
          )}
        </ItemsTableRow>
      )
    case 'releases':
      return (
        <ItemsTableRow
          item={item}
          index={index}
          isExpanded={isExpanded}
          isCategoryVisible={isCategoryVisible}
          isPathTypeVisible={isPathTypeVisible}
        >
          {(item as ReleaseClient).publishedEditions && (
            <PublishedEditionsCombined
              publishedEditions={(item as ReleaseClient).publishedEditions}
              format='sm'
            />
          )}
        </ItemsTableRow>
      )
    default:
      return (
        <ItemsTableRow
          item={item}
          index={index}
          isExpanded={isExpanded}
          isCategoryVisible={isCategoryVisible}
          isPathTypeVisible={isPathTypeVisible}
        />
      )
  }
}
