'use client'

import type { EventClient } from '@/lib/events/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PageDataResponse, PageItemClient, PagePathType } from '@/lib/types'
import { ItemTableRow } from '@/ui/items-table/items-table-row'
import styles from '@/ui/items-table/items-table.module.scss'
import { itemSortDate } from '@/ui/items/item-date'
import { ItemsFilterNav } from '@/ui/items/items-index'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import { camelToSentence, snakeToCamel } from '@/ui/util'
import { VenueInline } from '@/ui/venues/venue'
import { clsx } from 'clsx'
import React, { useState } from 'react'

export function ItemsTable ({
  items,
  path,
  isExpandedOnLoad
}: {
  items: PageDataResponse[],
  path: PagePathType,
  isExpandedOnLoad?: boolean
}) {
  const [sortDirection, _setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [isExpanded, setIsExpanded] = useState(isExpandedOnLoad)
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

  function _headingTitle (category?: string) {
    const count = flatItems(displayedItems()).length
    const subtitle = category?.length ? camelToSentence(category) : path
    const typeLabel = subtitle ?? 'items'

    if (searchTerm && filterType) {
      return `${typeLabel} of type "${filterType}" matching "${searchTerm}" (${count})`
    }

    if (searchTerm) {
      return `${typeLabel} matching "${searchTerm}" (${count})`
    }

    if (filterType) {
      return `${typeLabel} of type "${camelToSentence(filterType)}" (${count})`
    }

    return `${typeLabel} (${count})`
  }

  function tableSectionTitle (category?: string) {
    if (category) {
      const typeLabel = camelToSentence(category)
      if (searchTerm.length > 0) {
        return `${typeLabel} matching "${searchTerm}"`
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

  return (
    <>
      <ItemsFilterNav
        itemType={path}
        filterType={filterType}
        filterTypes={activeCategories.length > 1 && isFilterable ? activeCategories : undefined}
        setFilterType={setFilterType}
        searchTerm={isFilterable ? searchTerm : ''}
        setSearchTerm={isFilterable ? setSearchTerm : undefined}
        // sortDirection={isFilterable ? sortDirection : undefined}
        // setSortDirection={isFilterable ? setSortDirection : undefined}
        isExpanded={!!isExpanded}
        onExpand={() => setIsExpanded(!isExpanded)}
      />

      <table>
        <thead className='visually-hidden'>
          <tr>
            {isExpanded && <th aria-hidden='true'>Image</th>}
            {isPathTypeVisible && <th>Page type</th>}
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
                <th scope='rowgroup' colSpan={isPathTypeVisible ? 5 : 4}>{tableSectionTitle(key)}</th>
              </tr>
              {value.map((item, index) => (
                <ItemListItem
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

function ItemListItem<T extends PageItemClient> ({
  item,
  index,
  isExpanded
}: {
  item: T
  index: number
  isExpanded: boolean
}) {
  switch (item.path) {
    case 'events':
      return (
        <ItemTableRow item={item} index={index} isExpanded={isExpanded}>
          {(item as EventClient).venue && (
            <VenueInline venue={(item as EventClient).venue!} format='sm' />
          )}
        </ItemTableRow>
      )
    case 'releases':
      return (
        <ItemTableRow item={item} index={index} isExpanded={isExpanded}>
          {(item as ReleaseClient).publishedEditions && (
            <PublishedEditionsCombined publishedEditions={(item as ReleaseClient).publishedEditions} format='sm' />
          )}
        </ItemTableRow>
      )
    default:
      return <ItemTableRow item={item} index={index} isExpanded={isExpanded} />
  }
}
