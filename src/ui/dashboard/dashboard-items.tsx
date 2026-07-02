'use client'

import NextLink from 'next/link'
import { useCallback, useId, useState } from 'react'

import type { DashboardEmbedCode } from '@/lib/embed-codes/schemas/client'
import type { EmbedCode } from '@/lib/embed-codes/schemas/db'
import {
  EmbedCodeHosts,
  EmbedCodeTypes,
  embedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import type { DashboardImage, Image } from '@/lib/images/types'
import { linkTypes } from '@/lib/links/schemas'
import type { DashboardLink, Link } from '@/lib/links/types'
import {
  type EmbeddedItemType,
  EmbeddedItemTypes
} from '@/lib/schemas'
import type { FormResponse } from '@/lib/types'
import type { ResponseWithCursor } from '@/lib/util'
import type { DashboardVenue, Venue } from '@/lib/venues/types'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { itemBadges } from '@/ui/badges'
import type { CreateItemDetail } from '@/ui/buttons/create-item-button'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { ExpandCollapseButton } from '@/ui/filters/expand-collapse-button'
import { FiltersWrapper } from '@/ui/filters/filters'
import { SortButton } from '@/ui/filters/sort-button'
import { EditItemNav } from '@/ui/form/edit-item-nav'
import { Select } from '@/ui/form/select'
import { ImageFigure } from '@/ui/images/image-figure'
import itemsStyles from '@/ui/items/items.module.scss'
import { LinkItem } from '@/ui/links/link-item'
import { Loading } from '@/ui/loading'
import { SearchInput } from '@/ui/search-input/search-input'
import { useToast } from '@/ui/toast/toast-context'
import { useResultsList } from '@/ui/useResultsList'
import {
  capitalizeFirstLetter,
  formattedItemType,
  formatVenueInline,
  singularizePath,
  usedOnPages
} from '@/ui/util'

declare global {
  interface DocumentEventMap {
    openNewItemForm: CustomEvent<CreateItemDetail>
  }
}

export type DashboardItem =
  | DashboardEmbedCode
  | DashboardImage
  | DashboardLink
  | DashboardVenue

const DashboardSuccessMessages = {
  SavedSuccessfully: 'Item saved successfully.',
  DeletedSuccessfully: 'Item deleted successfully.'
} as const

export const DashboardErrrorMessages = {
  DuplicateEntry:
    'An item with the same unique field already exists.',
  FailedToDelete: 'Attempt to delete the item failed, try again.',
  FailedToSave: 'Failed to save changes, try again.',
  FetchExistingFailed:
    'Failed to fetch existing item for duplicate check.',
  OperationCancelled: 'Operation was cancelled by the user.'
} as const

interface DashboardProps<T extends DashboardItem> {
  apiEndpoint: string
  itemType: EmbeddedItemType
  res: ResponseWithCursor<T>
  deleteItem: (
    item: T
  ) => Promise<FormResponse<Partial<T>> | undefined>
}

export function DashboardItems<T extends DashboardItem>({
  apiEndpoint,
  itemType,
  res,
  deleteItem
}: DashboardProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filterType, setFilterType] = useState<string | undefined>(
    undefined
  )

  const { addErrorMessage, addSuccessMessage } = useToast()

  const {
    isLoading,
    items,
    loadMoreRef,
    query,
    setQuery,
    sortDirection,
    setSortDirection,
    nextCursor,
    onRemoveItem,
    totalCount
  } = useResultsList<T>(apiEndpoint, res)

  // TODO: move to useResultsList
  function filteredItems() {
    const savedItems = items.filter((item) => !!item.id)

    const typeFilteredItems = filterType
      ? savedItems.filter(
          (item) => (item as Link | EmbedCode).type === filterType
        )
      : savedItems

    if (!query && sortDirection === 'desc') return typeFilteredItems

    return typeFilteredItems
  }

  const onDelete = useCallback(
    async (item: T) => {
      const confirmed = confirm(
        `Are you sure you want to delete this ${singularizePath(itemType)}? This action cannot be undone.`
      )
      if (!confirmed) return
      try {
        const res = await deleteItem(item)
        if (res && res.ok) {
          addSuccessMessage(
            DashboardSuccessMessages.DeletedSuccessfully
          )
          onRemoveItem(item.id)
        } else {
          console.debug(res?.message, item.id)
          addErrorMessage(
            res?.message || DashboardErrrorMessages.FailedToDelete
          )
        }
      } catch (error) {
        console.debug(error, item.id)
        addErrorMessage(
          (error as Error)?.message ||
            DashboardErrrorMessages.FailedToDelete
        )
      }
    },
    [
      itemType,
      deleteItem,
      addSuccessMessage,
      onRemoveItem,
      addErrorMessage
    ]
  )

  function formatItemType() {
    return formattedItemType(itemType, false, true)
  }

  function headingTitle() {
    const count = filteredItems().length
    const typeLabel = formatItemType()

    if (query && filterType) {
      return `${typeLabel} of type "${filterType}" matching "${query}" (${count})`
    }

    if (query) {
      return `${typeLabel} matching "${query}" (${count})`
    }

    if (filterType) {
      return `${typeLabel} of type "${filterType}" (${count})`
    }

    return `All ${typeLabel} (${totalCount})`
  }

  function filterTypes() {
    switch (itemType) {
      case EmbeddedItemTypes.links:
        return [...linkTypes]
      case EmbeddedItemTypes.embedCodes:
        return [...embedCodeTypes]
      default:
        return undefined
    }
  }

  const headingId = useId()
  const tableId = useId()
  const loadMoreId = useId()

  return (
    <div>
      <FiltersWrapper itemType={itemType} controlsId={tableId}>
        <ExpandCollapseButton
          ariaControls={tableId}
          isExpanded={!!isExpanded}
          onExpand={setIsExpanded}
          openLabel='Show me the art'
          closeLabel='Hide the art'
        />
        <SortButton
          ariaControls={tableId}
          isAsc={sortDirection === 'asc'}
          onClick={() => {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
          }}
        />
        {(filterTypes() || []).length > 1 && (
          <Select
            ariaControls={tableId}
            options={filterTypes()}
            onChange={setFilterType}
            placeholder='No filters'
            label={`Filter ${itemType}`}
            value={filterType}
            isLabelHidden
          />
        )}
        <SearchInput
          ariaControls={tableId}
          value={query}
          onChange={setQuery}
          label={`Search ${itemType}`}
          isLabelHidden
        />
      </FiltersWrapper>

      <div className={itemsStyles['items-section']} id={tableId}>
        <section aria-labelledby={headingId}>
          <header className={itemsStyles['items-section-header']}>
            <h2 id={headingId}>{headingTitle()}</h2>
          </header>

          <ul>
            {filteredItems().map((item) => (
              <DashboardListItem
                key={item.id}
                item={item}
                itemType={itemType}
                isExpanded={isExpanded}
                onDelete={() => onDelete(item)}
              />
            ))}
          </ul>
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
        </section>
      </div>
    </div>
  )
}

function DashboardListItem<T extends DashboardItem>({
  itemType,
  item,
  isExpanded,
  onDelete
}: {
  itemType: EmbeddedItemType
  item: T
  isExpanded?: boolean
  onDelete: (id: string) => void
}) {
  const usedOn = usedOnPages(item)

  function titleWithCount() {
    const count = usedOn.length > 0 ? ` (${usedOn.length})` : ''
    return title() + count
  }

  function title() {
    switch (itemType) {
      case EmbeddedItemTypes.embedCodes: {
        const castItem = item as EmbedCode
        let formattedPrefix = castItem.host
          ? capitalizeFirstLetter(castItem.host)
          : ''
        if (
          castItem.type === EmbedCodeTypes.video &&
          castItem.host === EmbedCodeHosts.youtube
        ) {
          formattedPrefix = 'YouTube'
        }
        return `${formattedPrefix}: ${castItem.title}` || 'Untitled'
      }
      case EmbeddedItemTypes.links: {
        const castItem = item as Link
        return `${castItem.title}` || 'Untitled'
      }
      case EmbeddedItemTypes.images: {
        const imageItem = item as Image
        const fileName = imageItem.url
          ? decodeURIComponent(imageItem.url).split('/').pop()
          : 'Untitled'
        const imageTitle =
          imageItem.title || imageItem.caption || 'Untitled image'
        return `${imageTitle}${fileName ? `: ${fileName}` : ''}`
      }
      case EmbeddedItemTypes.venues: {
        const venueItem = item as DashboardVenue
        return formatVenueInline({
          venue: venueItem,
          format: 'sm'
        })
      }
    }
  }

  return (
    <li key={item.id} className={styles['dashboard-list-item']}>
      <AccordionDropdown
        badges={itemBadges(item)}
        isExpanded={isExpanded}
        title={titleWithCount()}
        buttonClassname={styles['accordion-button']}
        panelClassname={styles['accordion-panel']}
      >
        <EditItemNav
          id={item.id!}
          itemType={itemType}
          onDelete={onDelete}
        />
        <ItemDisplay
          key={`inner-${item.id}`}
          item={item}
          itemType={itemType}
        />

        {(item as Link | Venue).url && (
          <div>
            <h3>URL:</h3>
            <p>{(item as Link | Venue).url}</p>
          </div>
        )}

        <div>
          <h3>ID:</h3>
          <p>{item.id}</p>
        </div>

        <div>
          <h3>Visible on:</h3>
          <ul>
            {usedOn.length > 0 ? (
              usedOn.map((page) => (
                <li key={page}>
                  <NextLink
                    href={page}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {page}
                  </NextLink>
                </li>
              ))
            ) : (
              <li>No pages yet.</li>
            )}
          </ul>
        </div>
      </AccordionDropdown>
    </li>
  )
}

export function ItemDisplay({
  item,
  itemType
}: {
  item?: DashboardItem
  itemType: EmbeddedItemType
}) {
  switch (itemType) {
    case EmbeddedItemTypes.embedCodes:
      return <EmbedCodeItem embedCode={item as EmbedCode} />
    case EmbeddedItemTypes.images:
      return <ImageFigure image={item as Image} />
    case EmbeddedItemTypes.links:
      if ((item as Link).quotation || (item as Link).attribution) {
        return <LinkItem link={item as Link} />
      }
      break
    case EmbeddedItemTypes.venues:
      return (
        <>
          <div>
            <h3>Address:</h3>
            <p>
              {formatVenueInline({
                venue: item as Omit<Venue, 'id'>,
                isNameHidden: true
              })}
            </p>
          </div>
        </>
      )
    default:
      return <div>Unknown item type: {itemType}</div>
  }
}
