'use client'

import NextLink from 'next/link'
import { useCallback, useEffect, useId, useState } from 'react'

import { embedCodeTypes } from '@/lib/embed-codes/schemas'
import type { DashboardEmbedCode, EmbedCode } from '@/lib/embed-codes/types'
import type { DashboardImage, Image } from '@/lib/images/types'
import { linkTypes } from '@/lib/links/schemas'
import type { DashboardLink, Link } from '@/lib/links/types'
import type { Badge, EmbeddedItemType, FormResponse } from '@/lib/types'
import type { DashboardVenue, Venue } from '@/lib/venues/types'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import type { OpenNewItemFormDetail } from '@/ui/admin-sidebar/add-item-button'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { Dialog } from '@/ui/dialog/dialog'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { ExpandCollapseButton } from '@/ui/filters/expand-collapse-button'
import { FiltersContainer } from '@/ui/filters/filters'
import { SortButton } from '@/ui/filters/sort-button'
import { EditItemNav } from '@/ui/form/edit-item-nav'
import { Form } from '@/ui/form/form'
import { Select } from '@/ui/form/select'
import { EditImage } from '@/ui/images/edit-image-form'
import { FigureImage } from '@/ui/images/image-figure'
import itemsStyles from '@/ui/items/items.module.scss'
import { EditLink } from '@/ui/links/edit-link-form'
import { LinkItem } from '@/ui/links/link-item'
import { SearchInput } from '@/ui/search-input/search-input'
import { camelToSentence, eventUrl, releaseUrl } from '@/ui/util'
import { EditVenue } from '@/ui/venues/edit-venue-form'
import { VenueInline } from '@/ui/venues/venue'

declare global {
  interface DocumentEventMap {
    openNewItemForm: CustomEvent<OpenNewItemFormDetail>
  }
}

export type DashboardItem = DashboardEmbedCode | DashboardImage | DashboardLink | DashboardVenue

interface DashboardProps <T extends DashboardItem> {
  itemType: EmbeddedItemType
  items: T[]
  editItem: (item: FormData) => Promise<FormResponse<T> | undefined>
  deleteItem: (id: string) => Promise<FormResponse<T> | undefined>
}

export function DashboardItems<T extends DashboardItem> (
  { itemType, items, editItem, deleteItem }: DashboardProps<T>
) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<T | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  function filteredItems () {
    const savedItems = items.filter(item => !!item.id)

    const typeFilteredItems = filterType
      ? savedItems.filter(item => (item as Link | EmbedCode).type === filterType)
      : savedItems

    if (!searchTerm && sortDirection === 'desc') return typeFilteredItems

    const searchFilteredItems = typeFilteredItems.filter(item =>
      Object.values(item)
        .filter(val => typeof val === 'string')
        .some(val => (val as string).toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (sortDirection === 'asc') {
      return [...searchFilteredItems].reverse()
    }
    return searchFilteredItems
  }

  async function onSubmit (formData: FormData): Promise<FormResponse<T>> {
    console.log('Form submitted:', formData)
    try {
      const res = await editItem(formData)
      if (!res || !res.ok) {
        const message = res?.message || `Failed to edit ${itemType}.`
        console.error(message)
        return res || { message }
      }
      setIsEditDialogOpen(false)
      setItemToEdit(undefined)
      return res
    } catch (error) {
      console.error('Failed to submit form:', error)
    }
  }

  const onEdit = useCallback((id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      setItemToEdit(item)
      setIsEditDialogOpen(true)
    }
  }, [items])

  const onDelete = useCallback(async (id: string) => {
    try {
      await deleteItem(id)
      console.log(`Delete ${itemType} with id:`, id)
    } catch (error) {
      console.error(`Failed to delete ${itemType}:`, error)
    }
  }, [itemType, deleteItem])

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

  function formattedItemType () {
    return camelToSentence(itemType) + 's'
  }

  function headingTitle () {
    const count = filteredItems().length
    const typeLabel = formattedItemType()

    if (searchTerm && filterType) {
      return `${typeLabel} of type "${filterType}" matching "${searchTerm}" (${count})`
    }

    if (searchTerm) {
      return `${typeLabel} matching "${searchTerm}" (${count})`
    }

    if (filterType) {
      return `${typeLabel} of type "${filterType}" (${count})`
    }

    return `All ${typeLabel} (${count})`
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

  return (
    <div>
      <FiltersContainer itemType={itemType} controlsId={tableId}>
        <ExpandCollapseButton
          ariaControls={tableId}
          isExpanded={!!isExpanded}
          onExpand={setIsExpanded}
          openLabel='Show me the art'
          closeLabel='Hide the art'
        />
        <SortButton
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
          />
        )}
        <SearchInput
          ariaControls={tableId}
          value={searchTerm}
          onChange={setSearchTerm}
          label={`Search ${itemType}`}
        />
      </FiltersContainer>

      <div className={itemsStyles['items-section']} id={tableId}>
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
                onDelete={onDelete}
              />
            ))}
          </ul>
        </section>
      </div>

      {isEditDialogOpen && (
        <Dialog
          title={itemToEdit?.id ? `Edit ${itemType}` : `Add ${itemType}`}
          onClose={() => setIsEditDialogOpen(false)}
        >
          <Form action={onSubmit}>
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
  function usedOnPages () {
    const events = item.eventSlugs?.map(i => eventUrl(i)) || []
    const releases =
      'releaseSlugs' in item && Array.isArray(item.releaseSlugs)
        ? item.releaseSlugs.map(i => releaseUrl(i))
        : []
    const about = []
    if ((item as Link).type === 'press' || (item as Image).isPress) {
      if (!(item as Link | Image).isHiddenOnAboutPage) {
        about.push('/about')
      }
    }

    return [...events, ...releases, ...about]
  }

  function titleWithCount () {
    const usedOn = usedOnPages()
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
      badges.push({ text: 'Footer link', color: 'blue' })
    }
    if (link.type === 'buy_link') {
      badges.push({ text: 'Buy link', color: 'purple' })
    }
    if (link.type === 'stream_link') {
      badges.push({ text: 'Stream link', color: 'orange' })
    }
    if (embedCode.type === 'audio') {
      badges.push({ text: 'Audio' })
    }
    if (embedCode.type === 'video') {
      badges.push({ text: 'Video', color: 'blue' })
    }
    if (usedOnPages().length === 0 && link.type !== 'social') {
      badges.push({ text: 'Not used', color: 'red' })
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
        const fileName = imageItem.url ? imageItem.url.split('/').pop() : 'Untitled'
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
    <li key={item.id} className={styles['dashboard-list-item']}>
      <AccordionDropdown
        badges={badges()}
        isExpanded={isExpanded}
        title={titleWithCount()}
      >
        <EditItemNav id={item.id!} onEdit={onEdit} onDelete={onDelete} />
        <ItemDisplay item={item} itemType={itemType} />

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
            {usedOnPages().length > 0
              ? (
                  usedOnPages().map((page) => (
                    <li key={page}>
                      <NextLink href={page} target='_blank' rel='noopener noreferrer'>
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
        <FigureImage image={item as Image} />
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
            <p><VenueInline venue={item as Venue} isNameHidden /></p>
          </div>
        </>
      )
    default:
      return <div>Unknown item type: {itemType}</div>
  }
}
