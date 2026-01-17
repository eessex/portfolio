'use client'

import NextLink from 'next/link'
import {
  useCallback,
  useEffect,
  useId,
  useState
} from 'react'

import { embedCodeTypes } from '@/lib/embed-codes/schemas'
import type {
  DashboardEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/types'
import type {
  DashboardImage,
  Image
} from '@/lib/images/types'
import { linkTypes } from '@/lib/links/schemas'
import type {
  DashboardLink,
  Link
} from '@/lib/links/types'
import type {
  Badge,
  EmbeddedItemType,
  FormResponse
} from '@/lib/types'
import type { ResponseWithCursor } from '@/lib/util'
import type {
  DashboardVenue,
  Venue
} from '@/lib/venues/types'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import type { OpenNewItemFormDetail } from '@/ui/admin-sidebar/add-item-button'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { Dialog } from '@/ui/dialog/dialog'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { ExpandCollapseButton } from '@/ui/filters/expand-collapse-button'
import { FiltersWrapper } from '@/ui/filters/filters'
import { SortButton } from '@/ui/filters/sort-button'
import { EditItemNav } from '@/ui/form/edit-item-nav'
import { Form } from '@/ui/form/form'
import { Select } from '@/ui/form/select'
import { EditImage } from '@/ui/images/edit-image-form'
import { ImageFigure } from '@/ui/images/image-figure'
import itemsStyles from '@/ui/items/items.module.scss'
import { EditLink } from '@/ui/links/edit-link-form'
import { LinkItem } from '@/ui/links/link-item'
import { Loading } from '@/ui/loading'
import { SearchInput } from '@/ui/search-input/search-input'
import { useToast } from '@/ui/toast/toast-context'
import { useResultsList } from '@/ui/useResultsList'
import {
  formattedItemType,
  formatVenueInline,
  singularizePath,
  usedOnPages,
  usedOnSlugKeys
} from '@/ui/util'
import { EditVenue } from '@/ui/venues/edit-venue-form'

declare global {
  interface DocumentEventMap {
    openNewItemForm: CustomEvent<OpenNewItemFormDetail>
  }
}

export type DashboardItem = DashboardEmbedCode | DashboardImage | DashboardLink | DashboardVenue

const DashboardSuccessMessages = {
  SavedSuccessfully: 'Item saved successfully.',
  DeletedSuccessfully: 'Item deleted successfully.'
} as const

export const DashboardErrrorMessages = {
  DuplicateEntry: 'An item with the same unique field already exists.',
  FailedToDelete: 'Attempt to delete the item failed, try again.',
  FailedToSave: 'Failed to save changes, try again.',
  FetchExistingFailed: 'Failed to fetch existing item for duplicate check.',
  OperationCancelled: 'Operation was cancelled by the user.'
} as const

interface DashboardProps <T extends DashboardItem> {
  apiEndpoint: string
  itemType: EmbeddedItemType
  res: ResponseWithCursor<T>
  editItem: (item: FormData) => Promise<FormResponse<T> | undefined>
  deleteItem: (item: T) => Promise<FormResponse<T> | undefined>
  fetchMaybeExistingItem?: (item: Omit<T, 'id'>) => Promise<{ res: T | null, fieldName?: keyof Omit<T, 'id'> } | null>
}

export function DashboardItems<T extends DashboardItem> ({
  apiEndpoint,
  itemType,
  res,
  editItem,
  deleteItem,
  fetchMaybeExistingItem
}: DashboardProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<T | undefined>(undefined)
  const [filterType, setFilterType] = useState<string | undefined>(undefined)

  const {
    addErrorMessage,
    addSuccessMessage
  } = useToast()

  const {
    isLoading,
    items,
    loadMoreRef,
    query,
    setQuery,
    sortDirection,
    setSortDirection,
    nextCursor,
    onAddItem,
    onEditItem,
    onRemoveItem,
    totalCount
  } = useResultsList<T>(apiEndpoint, res)

  // TODO: move to useResultsList
  function filteredItems () {
    const savedItems = items.filter(item => !!item.id)

    const typeFilteredItems = filterType
      ? savedItems.filter(item => (item as Link | EmbedCode).type === filterType)
      : savedItems

    if (!query && sortDirection === 'desc') return typeFilteredItems

    return typeFilteredItems
  }

  async function onBeforeSubmit (formData: FormData) {
    let isConfirmed = false
    console.info('Checking for duplicate before submitting form data:', Object.fromEntries(formData))
    try {
      if (fetchMaybeExistingItem) {
        const maybeExistingItem = await fetchMaybeExistingItem(Object.fromEntries(formData) as Omit<T, 'id'>)
        if (maybeExistingItem?.res) {
          const usedOn = usedOnPages(maybeExistingItem.res)
          const usedOnMessage = usedOn.length > 0
            ? `\n\nThis will also affect the ${usedOn.length} page(s) where this item is used.`
            : ''
          isConfirmed = confirm(`An item already exists with the same ${String(maybeExistingItem.fieldName)}. Do you want to overwrite the existing entry? ${usedOnMessage}`)
        } else {
          isConfirmed = true
        }
      } else {
        isConfirmed = true
      }
      return isConfirmed
    } catch (error) {
      // Fail silently and allow submission, server will catch duplicates
      console.error(DashboardErrrorMessages.FetchExistingFailed, error)
      return true
    }
  }

  async function onSubmit (formData: FormData): Promise<FormResponse<T>> {
    try {
      const isConfirmed = await onBeforeSubmit(formData)
      if (!isConfirmed) {
        return { message: DashboardErrrorMessages.OperationCancelled }
      } else {
        const res = await editItem(formData)
        if (!res || !res.ok) {
          const message = res?.message || DashboardErrrorMessages.FailedToSave
          console.debug(message, itemToEdit?.id)
          addErrorMessage(message)
          return // leave the dialog open for retry
        } else if (res.res) {
          addSuccessMessage(DashboardSuccessMessages.SavedSuccessfully)
          if (itemToEdit?.id) {
            onEditItem(res.res as T, usedOnSlugKeys(itemToEdit as T) ?? {})
          } else {
            onAddItem(res.res as T)
          }
        }
        setIsEditDialogOpen(false)
        setItemToEdit(undefined)
        return res
      }
    } catch (error) {
      console.debug(error, itemToEdit?.id)
      addErrorMessage(DashboardErrrorMessages.FailedToSave)
    }
  }

  const onEdit = useCallback((id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      setItemToEdit(item)
      setIsEditDialogOpen(true)
    }
  }, [items])

  const onDelete = useCallback(async (item: T) => {
    const confirmed = confirm(`Are you sure you want to delete this ${singularizePath(itemType)}? This action cannot be undone.`)
    if (!confirmed) return
    try {
      const res = await deleteItem(item)
      if (res && res.ok) {
        addSuccessMessage(DashboardSuccessMessages.DeletedSuccessfully)
        onRemoveItem(item.id)
      } else {
        console.debug(res?.message, item.id)
        addErrorMessage((res as Error)?.message || DashboardErrrorMessages.FailedToDelete)
      }
    } catch (error) {
      console.debug(error, item.id)
      addErrorMessage((error as Error)?.message || DashboardErrrorMessages.FailedToDelete)
    }
  }, [itemType, deleteItem, addSuccessMessage, onRemoveItem, addErrorMessage])

  // Listen for "Add item" button clicks from DashboardLayout
  useEffect(() => {
    function handleOpenNewItemForm (event: CustomEvent<OpenNewItemFormDetail>) {
      if (event.detail.itemType === itemType) {
        setItemToEdit(undefined)
        setIsEditDialogOpen(true)
      }
    }
    document.addEventListener('openNewItemForm', handleOpenNewItemForm)
    return () => {
      document.removeEventListener('openNewItemForm', handleOpenNewItemForm)
    }
  }, [itemType])

  function formatItemType () {
    return formattedItemType(itemType, false, true)
  }

  function headingTitle () {
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

  function filterTypes () {
    switch (itemType) {
      case 'links':
        return [...linkTypes]
      case 'embedCodes':
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
      <FiltersWrapper
        itemType={itemType}
        controlsId={tableId}
      >
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
        />
      </FiltersWrapper>

      <div
        className={itemsStyles['items-section']}
        id={tableId}
      >
        <section
          aria-labelledby={headingId}
        >
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
                onEdit={onEdit}
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
              {isLoading && (
                <Loading />
              )}
            </>
          )}
        </section>
      </div>

      {isEditDialogOpen && (
        <Dialog
          title={itemToEdit?.id ? `Edit ${singularizePath(itemType)}` : `Add ${singularizePath(itemType)}`}
          onClose={() => setIsEditDialogOpen(false)}
        >
          <Form
            action={onSubmit}
            submitButtonClassName='button-primary'
          >
            <EditItem
              item={itemToEdit}
              itemType={itemType}
            />
          </Form>
        </Dialog>
      )}
    </div>
  )
}

function DashboardListItem<T extends DashboardItem> ({
  itemType,
  item,
  isExpanded,
  onEdit,
  onDelete
}: {
  itemType: EmbeddedItemType
  item: T
  isExpanded?: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const usedOn = usedOnPages(item)

  function titleWithCount () {
    const count = usedOn.length > 0 ? ` (${usedOn.length})` : ''
    return title() + count
  }

  function badges () {
    const badges: Badge[] = []
    const link = item as Link
    const image = item as Image
    const embedCode = item as EmbedCode

    if (link.type === 'press' || image.isPress) {
      badges.push({ text: 'Press' })
    }
    if (link.type === 'social') {
      badges.push({
        text: 'Footer link',
        color: 'blue'
      })
    }
    if (link.type === 'buy_link') {
      badges.push({
        text: 'Buy link',
        color: 'purple'
      })
    }
    if (link.type === 'stream_link') {
      badges.push({
        text: 'Stream link',
        color: 'orange'
      })
    }
    if (embedCode.type === 'audio') {
      badges.push({ text: 'Audio' })
    }
    if (embedCode.type === 'video') {
      badges.push({
        text: 'Video',
        color: 'blue'
      })
    }
    if (usedOn.length === 0 && link.type !== 'social') {
      badges.push({
        text: 'Not used',
        color: 'red'
      })
    }
    return badges
  }

  function title () {
    switch (itemType) {
      case 'embedCodes': {
        const embedItem = item as EmbedCode
        return embedItem.title || 'Untitled'
      }
      case 'images': {
        const imageItem = item as Image
        const fileName = imageItem.url ? decodeURIComponent(imageItem.url).split('/').pop() : 'Untitled'
        const imageTitle = imageItem.title || imageItem.caption || 'Untitled image'
        return `${imageTitle}${fileName ? `: ${fileName}` : ''}`
      }
      case 'links': {
        const linkItem = item as Link
        return linkItem.title || 'Untitled'
      }
      case 'venues': {
        const venueItem = item as DashboardVenue
        return `${venueItem.name || venueItem.address}, ${venueItem.city}, ${venueItem.state || venueItem.country}`
      }
    }
  }

  return (
    <li
      key={item.id}
      className={styles['dashboard-list-item']}
    >
      <AccordionDropdown
        badges={badges()}
        isExpanded={isExpanded}
        title={titleWithCount()}
      >
        <EditItemNav
          id={item.id!}
          onEdit={onEdit}
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
            {usedOn.length > 0
              ? (
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
                )
              : (
                <li>No pages yet.</li>
                )}
          </ul>
        </div>
      </AccordionDropdown>
    </li>
  )
}

export function EditItem ({
  item,
  itemType
}: {
  item?: DashboardItem
  itemType: EmbeddedItemType
}) {
  switch (itemType) {
    case 'embedCodes':
      return <EditEmbedCode embedCode={item as EmbedCode | undefined} />
    case 'images':
      return <EditImage image={item as Image | undefined} />
    case 'links':
      return <EditLink link={item as Link | undefined} />
    case 'venues':
      return <EditVenue venue={item as Venue | undefined} />
    default:
      return <div>Unknown item type: {itemType}</div>
  }
}

export function ItemDisplay ({
  item,
  itemType
}: {
  item?: DashboardItem
  itemType: EmbeddedItemType
}) {
  switch (itemType) {
    case 'embedCodes':
      return <EmbedCodeItem embedCode={item as EmbedCode} />
    case 'images':
      return (
        <ImageFigure image={item as Image} />
      )
    case 'links':
      if ((item as Link).quotation || (item as Link).attribution) {
        return (
          <LinkItem link={item as Link} />
        )
      }
      break
    case 'venues':
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
