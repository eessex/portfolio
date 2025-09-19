'use client'

import type { EventClient } from '@/lib/events/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PageDataResponse, PageItemClient, PagePathType } from '@/lib/types'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button/expand-collapse-button'
import { FiltersContainer } from '@/ui/filters/filters'
import { SortButton } from '@/ui/filters/sort-button'
import { Select } from '@/ui/form/select'
import { ItemsTableRow } from '@/ui/items-table/items-table-row'
import styles from '@/ui/items-table/items-table.module.scss'
import { itemSortDate } from '@/ui/items/item-date'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import { SearchInput } from '@/ui/search-input/search-input'
import { camelToSentence, snakeToCamel } from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'
import { clsx } from 'clsx'
import React, { useId, useState } from 'react'

export function ItemsTable ({
  items,
  path,
  isExpandedOnLoad
}: {
  items: PageDataResponse[],
  path: PagePathType,
  isExpandedOnLoad?: boolean
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
      const typeLabel = camelToSentence(category)
      if (searchTerm.length > 0) {
        return `${typeLabel} matching "${searchTerm}" (${itemCount})`
      } else {
        return typeLabel
      }
    }
  }

  const isFilterable = allItems().length > 20

  const isPathTypeVisible = (() => {
    const seen = new Set<string>()
    for (const item of flatItems(displayedItems())) {
      if (seen.has(item.path)) continue
      seen.add(item.path)
      if (seen.size > 1) return true
    }
    return false
  })()

  const colSpan = isExpanded ? (isPathTypeVisible ? 5 : 4) : (isPathTypeVisible ? 4 : 3)
  const tableId = useId()

  return (
    <>
      <FiltersContainer itemType={path} controlsId={tableId}>
        <ExpandCollapseButton
          ariaControls={tableId}
          isExpanded={!!isExpanded}
          onExpand={setIsExpanded}
          openLabel='Show me the art'
          closeLabel='Hide the art'
        />
        {isFilterable && setSortDirection && (
          <SortButton
            isAsc={sortDirection === 'asc'}
            onClick={() => {
              if (setSortDirection) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }
            }}
          />
        )}
        {isFilterable && activeCategories && (
          <Select
            ariaControls={tableId}
            options={activeCategories}
            onChange={setFilterType}
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
      </FiltersContainer>

      <table
        id={tableId}
        role='region'
        aria-live='polite'
      >
        <thead className='visually-hidden'>
          <tr>
            {isExpanded && <th aria-hidden='true'>Image</th>}
            {isPathTypeVisible && <th>Type</th>}
            <th>Date</th>
            <th>Title</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody className={clsx(styles['table-body'], isExpanded && styles['table-body--expanded'])}>
          {!flatItems(displayedItems()).length && (
            <>
              <tr className={styles['table-rowgroup-heading']}>
                <th
                  scope='rowgroup'
                  colSpan={colSpan}
                >
                  Search results for "{searchTerm}"
                </th>
              </tr>
              <tr className={styles['no-results']}>
                <td
                  role='region'
                  aria-live='polite'
                  colSpan={colSpan}
                >
                  No results found.
                </td>
              </tr>
            </>
          )}

          {displayedItems().map((category, index) => Object.entries(category).map(([key, value]) => value.length > 0 && (
            <React.Fragment key={`${index}-${key}`}>
              <tr className={styles['table-rowgroup-heading']}>
                <th scope='rowgroup' colSpan={isPathTypeVisible ? 5 : 4}>{tableSectionTitle(key, value.length)}</th>
              </tr>
              {value.map((item, index) => (
                <ItemsTableItem
                  item={item}
                  index={index}
                  key={`${item.id}-${index}`}
                  isExpanded={!!isExpanded}
                />
              ))}
            </React.Fragment>
          )))}
        </tbody>
      </table>
    </>
  )
}

function ItemsTableItem ({
  item,
  index,
  isExpanded
}: {
  item: PageItemClient
  index: number
  isExpanded: boolean
}) {
  switch (item.path) {
    case 'events':
      return (
        <ItemsTableRow item={item} index={index} isExpanded={isExpanded}>
          {(item as EventClient).venue && (
            <VenueInline venue={(item as EventClient).venue!} format='sm' />
          )}
        </ItemsTableRow>
      )
    case 'releases':
      return (
        <ItemsTableRow item={item} index={index} isExpanded={isExpanded}>
          {(item as ReleaseClient).publishedEditions && (
            <PublishedEditionsCombined publishedEditions={(item as ReleaseClient).publishedEditions} format='sm' />
          )}
        </ItemsTableRow>
      )
    default:
      return <ItemsTableRow item={item} index={index} isExpanded={isExpanded} />
  }
}
