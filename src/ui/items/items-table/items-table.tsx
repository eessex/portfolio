'use client'

import { clsx } from 'clsx'
import { useId } from 'react'

import type { EmbedCode } from '@/lib/embed-codes/schemas/db'
import type { EventClient } from '@/lib/events/types'
import type { Link } from '@/lib/links/schemas/db'
import type { DashboardPublishedEdition } from '@/lib/published-editions/schemas/client'
import type { Publisher } from '@/lib/publishers/schemas/db'
import type { ReleaseClient } from '@/lib/releases/types'
import {
  type EmbeddedItemType,
  EmbeddedItemTypes,
  itemTypeToLabel,
  type PagePath,
  PagePaths
} from '@/lib/schemas'
import { camelToSnake, capitalizeFirstLetter } from '@/lib/strings'
import type {
  EmbeddedItem,
  PageDataResponse,
  PageItemClient
} from '@/lib/types'
import { DEFAULT_PAGE_SIZE } from '@/lib/util'
import type { Venue } from '@/lib/venues/schemas/db'
import { EmbedCodeDetails } from '@/ui/embed-codes/embed-code-details'
import { FiltersWrapper } from '@/ui/filters/filters'
import { ItemsList } from '@/ui/items/items-list'
import styles from '@/ui/items/items-table/items-table.module.scss'
import { ItemsTableRow } from '@/ui/items/items-table/items-table-row'
import { LinkDetails } from '@/ui/links/link-details'
import { Loading } from '@/ui/loading'
import { PublishedEditionDetails } from '@/ui/published-editions/published-edition-details'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'
import { PublisherDetails } from '@/ui/publishers/publisher-details'
import { SearchInput } from '@/ui/search-input/search-input'
import { useIsAdmin } from '@/ui/useIsAdmin'
import type { ResultsResponse } from '@/ui/useResultsList'
import { useResultsList } from '@/ui/useResultsList'
import {
  formattedItemType,
  formatVenueInline,
  isEmbeddedDetailColumnVisible,
  isEmbeddedItemType,
  isImageColumnVisible
} from '@/ui/util'
import { VenueDetails } from '@/ui/venues/venue-details'

export function ItemsTable<
  T extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined,
  TEmbeddedItem extends EmbeddedItem = never
>({
  initialItems,
  itemType,
  apiEndpoint,
  isCategoryVisible,
  isExpandedOnLoad,
  isPathTypeVisible,
  featuredKey,
  projectId
}: {
  initialItems: ResultsResponse<TEmbeddedItem, T, S>
  itemType: PagePath | EmbeddedItemType
  /**
   * Override the default `/api/${snake_case(itemType)}` endpoint for
   * routes that don't follow convention.
   */
  apiEndpoint?: string
  isCategoryVisible?: boolean
  isExpandedOnLoad?: boolean
  isPathTypeVisible?: boolean
  /**
   * Rendered as a featured ItemsList above the table (e.g. upcomingEvents)
   */
  featuredKey?: Extract<keyof S, string>
  /** Scope API fetches to a parent project (e.g. on project pages) */
  projectId?: string
}) {
  const {
    count,
    isLoading,
    items,
    groupedItems,
    loadMoreRef,
    query,
    setQuery,
    nextCursor
  } = useResultsList<TEmbeddedItem, T, S>(
    apiEndpoint ?? `/api/${camelToSnake(itemType)}`,
    initialItems,
    {
      // Pages render published-only data statically; for signed-in
      // admins the table refetches page 1 to reveal unpublished drafts
      // (the API gates them on the session cookie). Anonymous visitors
      // only pay a shared /api/session check, not the refetch.
      // Embedded items have no publish state, so there's nothing to
      // reveal and the refetch is skipped entirely.
      augmentOnMount: !isEmbeddedItemType(itemType),
      searchParams: { projectId }
    }
  )

  // lighter session check (no data refetch) than augmentOnMount,
  // only runs for embedded-item tables to reveal edit buttons.
  const isAdmin = useIsAdmin(isEmbeddedItemType(itemType))

  function displayedItems() {
    if (groupedItems) return groupedItems

    return { [`all${capitalizeFirstLetter(itemType)}`]: items }
  }

  function tableSectionTitle(category?: string, itemCount?: number) {
    if (category) {
      const typeLabel = formattedItemType(category, false, true)
      if (query.length > 0) {
        return `${itemTypeToLabel(itemType)} matching "${query}" (${itemCount})`
      } else {
        return typeLabel
      }
    }
  }

  const isFilterable = initialItems.totalCount >= DEFAULT_PAGE_SIZE

  const isDetailColumnVisible =
    itemType === PagePaths.events ||
    itemType === PagePaths.releases ||
    isEmbeddedDetailColumnVisible(itemType)
  /** embedded items get a standalone edit column; page items are edited on their own page */
  const isEditColumnVisible = isEmbeddedItemType(itemType)

  function tableColspan() {
    let cols = 2
    /** item has type-specific children, venue, publishedEditions */
    if (isDetailColumnVisible) cols += 1
    /** multiple item types present: itemType/type column visible (i.e. events, releases) */
    if (isPathTypeVisible) cols += 1
    if (isEditColumnVisible) cols += 1
    return cols
  }

  const colSpan = tableColspan()
  const tableId = useId()
  const tbodyId = useId()
  const loadMoreId = useId()

  if (initialItems.totalCount === 0 && count === 0) return null

  return (
    <>
      {featuredKey && groupedItems?.[featuredKey] && (
        <ItemsList
          items={groupedItems[featuredKey] as T[]}
          isFeatured
          title={formattedItemType(itemType, true, true)}
        />
      )}
      <div className={styles['items-table']}>
        {isFilterable && (
          <FiltersWrapper itemType={itemType} controlsId={tableId}>
            <SearchInput
              ariaControls={tableId}
              value={query}
              onChange={setQuery}
              label={`Search ${itemTypeToLabel(itemType, false, true)}`}
              isLabelHidden
              // filter search, not a required/optional form field —
              // suppresses the (visually hidden but still
              // screen-reader-announced) "optional" label text
              isRequired
            />
          </FiltersWrapper>
        )}

        <table id={tableId} role='region' aria-live='polite'>
          <thead className='visually-hidden'>
            <tr>
              {isImageColumnVisible(itemType) && (
                <th aria-hidden='true' scope='col'>
                  Image
                </th>
              )}
              {isPathTypeVisible && <th scope='col'>Type</th>}
              <th scope='col'>Title</th>
              <th scope='col'>Date</th>
              {isDetailColumnVisible && <th scope='col'>Details</th>}
              <th scope='col'>Media</th>
              {isEditColumnVisible && <th scope='col'>Edit</th>}
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
              key !== featuredKey &&
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
                      itemType={itemType}
                      isAdmin={isAdmin}
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
    </>
  )
}

function ItemsTableItem({
  item,
  index,
  isExpanded,
  isCategoryVisible,
  isPathTypeVisible,
  itemType,
  isAdmin
}: {
  item: PageItemClient | EmbeddedItem
  index: number
  isExpanded: boolean
  isCategoryVisible?: boolean
  isPathTypeVisible?: boolean
  itemType: PagePath | EmbeddedItemType
  isAdmin: boolean
}) {
  return (
    <ItemsTableRow
      item={item}
      index={index}
      isExpanded={isExpanded}
      isCategoryVisible={isCategoryVisible}
      isPathTypeVisible={isPathTypeVisible}
      itemType={itemType}
      isAdmin={isAdmin}
    >
      {itemType === PagePaths.events &&
        formatVenueInline({
          venue: (item as EventClient).venue!,
          format: 'sm'
        })}
      {itemType === PagePaths.releases && (
        <PublishedEditionsCombined
          publishedEditions={
            (item as ReleaseClient).publishedEditions
          }
          format='sm'
        />
      )}
      {itemType === EmbeddedItemTypes.embedCodes && (
        <EmbedCodeDetails embedCode={item as EmbedCode} />
      )}
      {itemType === EmbeddedItemTypes.publishedEditions && (
        <PublishedEditionDetails
          edition={item as DashboardPublishedEdition}
        />
      )}
      {itemType === EmbeddedItemTypes.venues && (
        <VenueDetails venue={item as Venue} />
      )}
      {itemType === EmbeddedItemTypes.links && (
        <LinkDetails link={item as Link} />
      )}
      {itemType === EmbeddedItemTypes.publishers && (
        <PublisherDetails publisher={item as Publisher} />
      )}
    </ItemsTableRow>
  )
}
