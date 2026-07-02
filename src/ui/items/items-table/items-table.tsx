'use client'

import { clsx } from 'clsx'
import { useId } from 'react'

import type { EventClient } from '@/lib/events/types'
import type { ReleaseClient } from '@/lib/releases/types'
import { type PagePath, PagePaths } from '@/lib/schemas'
import type { PageDataResponse, PageItemClient } from '@/lib/types'
import { DEFAULT_PAGE_SIZE } from '@/lib/util'
import { FiltersWrapper } from '@/ui/filters/filters'
import styles from '@/ui/items/items-table/items-table.module.scss'
import { ItemsTableRow } from '@/ui/items/items-table/items-table-row'
import { Loading } from '@/ui/loading'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import { SearchInput } from '@/ui/search-input/search-input'
import type { ResultsResponse } from '@/ui/useResultsList'
import { useResultsList } from '@/ui/useResultsList'
import {
  capitalizeFirstLetter,
  formattedItemType,
  formatVenueInline,
  itemTypeToLabel
} from '@/ui/util'

export function ItemsTable<
  T extends PageItemClient,
  S extends PageDataResponse
>({
  initialItems,
  path,
  isCategoryVisible,
  isExpandedOnLoad,
  isPathTypeVisible,
  omitKeys
}: {
  initialItems: ResultsResponse<never, T, S>
  path: PagePath
  isCategoryVisible?: boolean
  isExpandedOnLoad?: boolean
  isPathTypeVisible?: boolean
  omitKeys?: Array<keyof S>
}) {
  const {
    isLoading,
    items,
    groupedItems,
    loadMoreRef,
    query,
    setQuery,
    nextCursor
  } = useResultsList<never, T, S>(`/api/${path}`, initialItems)

  function displayedItems() {
    if (groupedItems) return groupedItems

    return { [`all${capitalizeFirstLetter(path)}`]: items }
  }

  function tableSectionTitle(category?: string, itemCount?: number) {
    if (category) {
      const typeLabel = formattedItemType(category, false, true)
      if (query.length > 0) {
        return `${itemTypeToLabel(path)} matching "${query}" (${itemCount})`
      } else {
        return typeLabel
      }
    }
  }

  const isFilterable = initialItems.totalCount >= DEFAULT_PAGE_SIZE

  const isDetailColumnVisible = [
    PagePaths.events,
    PagePaths.releases,
    'items'
  ].includes(path)

  function tableColspan() {
    let cols = 2
    /** item has type-specific children, venue, publishedEditions */
    if (isDetailColumnVisible) cols += 1
    /** multiple item types present: path/type column visible (i.e. events, releases) */
    if (isPathTypeVisible) cols += 1
    return cols
  }

  const colSpan = tableColspan()
  const tableId = useId()
  const tbodyId = useId()
  const loadMoreId = useId()
  if (initialItems.totalCount === 0) return null

  return (
    <div className={styles['items-table']}>
      {isFilterable && (
        <FiltersWrapper itemType={path} controlsId={tableId}>
          <SearchInput
            ariaControls={tableId}
            value={query}
            onChange={setQuery}
            label={`Search ${path}`}
            isLabelHidden
          />
        </FiltersWrapper>
      )}

      <table id={tableId} role='region' aria-live='polite'>
        <thead className='visually-hidden'>
          <tr>
            <th aria-hidden='true' scope='col'>
              Image
            </th>
            {isPathTypeVisible && <th scope='col'>Type</th>}
            <th scope='col'>Title</th>
            <th scope='col'>Date</th>
            {isDetailColumnVisible && <th scope='col'>Details</th>}
            <th scope='col'>Media</th>
          </tr>
        </thead>

        {!Object.values(displayedItems()).flat().length && (
          <tbody
            className={clsx(
              styles['table-body'],
              isExpandedOnLoad && styles['table-body--expanded']
            )}
            aria-labelledby={`${tbodyId}-search`}
          >
            <tr
              className={
                styles['table-rowgroup-heading'] + ' heading'
              }
            >
              <td id={`${tbodyId}-search`} colSpan={colSpan}>
                Search results for “{query}”
              </td>
            </tr>
            <tr className={styles['no-results']}>
              <td colSpan={colSpan}>No results found.</td>
            </tr>
          </tbody>
        )}

        {Object.entries(displayedItems()).map(
          ([key, value], index) =>
            !omitKeys?.includes(key as keyof S) &&
            value.length > 0 && (
              <tbody
                className={clsx(
                  styles['table-body'],
                  isExpandedOnLoad && styles['table-body--expanded']
                )}
                key={`${index}-${key}`}
              >
                <tr
                  className={
                    styles['table-rowgroup-heading'] + ' heading'
                  }
                >
                  <td id={`${tbodyId}-${key}`} colSpan={colSpan}>
                    {tableSectionTitle(key, value.length)}
                  </td>
                </tr>
                {value.map((item, idx) => (
                  <ItemsTableItem
                    key={`${item.id}-${idx}`}
                    item={item}
                    index={idx}
                    isExpanded={!!isExpandedOnLoad}
                    isCategoryVisible={
                      !!(isCategoryVisible || query.length > 0)
                    }
                    isPathTypeVisible={!!isPathTypeVisible}
                  />
                ))}
              </tbody>
            )
        )}
      </table>
      {nextCursor && (
        <>
          <li
            id={loadMoreId}
            style={{ height: 1 }}
            tabIndex={-1}
            aria-hidden='true'
            ref={loadMoreRef}
          />
          {isLoading && <Loading />}
        </>
      )}
    </div>
  )
}

function ItemsTableItem({
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
  return (
    <ItemsTableRow
      item={item}
      index={index}
      isExpanded={isExpanded}
      isCategoryVisible={isCategoryVisible}
      isPathTypeVisible={isPathTypeVisible}
    >
      {(item as EventClient).venue &&
        formatVenueInline({
          venue: (item as EventClient).venue!,
          format: 'sm'
        })}
      {(item as ReleaseClient).publishedEditions && (
        <PublishedEditionsCombined
          publishedEditions={
            (item as ReleaseClient).publishedEditions
          }
          format='sm'
        />
      )}
    </ItemsTableRow>
  )
}
