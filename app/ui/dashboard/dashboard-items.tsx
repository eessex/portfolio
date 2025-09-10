'use client'

import type { DashboardEmbedCode, EmbedCode } from '@/lib/embed-codes/types'
import type { DashboardImage, Image } from '@/lib/images/types'
import type { Link as _Link, DashboardLink } from '@/lib/links/types'
import type { Badge, FormResponse } from '@/lib/types'
import type { DashboardVenue, Venue } from '@/lib/venues/types'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import type { OpenNewItemFormDetail } from '@/ui/admin-sidebar/add-item-button'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { Dialog } from '@/ui/dialog/dialog'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { EditItemNav } from '@/ui/form/edit-item-nav'
import { Form } from '@/ui/form/form'
import { EditImage } from '@/ui/images/edit-image-form'
import { FigureImage } from '@/ui/images/image-figure'
import { ItemsFilterNav } from '@/ui/items/items-index'
import itemsStyles from '@/ui/items/items.module.scss'
import { EditLink } from '@/ui/links/edit-link-form'
import { LinkItem } from '@/ui/links/link-item'
import { camelToSentence, eventUrl, releaseUrl } from '@/ui/util'
import { EditVenue } from '@/ui/venues/edit-venue-form'
import { VenueInline } from '@/ui/venues/venue'
import Link from 'next/link'
import { useCallback, useEffect, useId, useState } from 'react'

declare global {
  interface DocumentEventMap {
    openNewItemForm: CustomEvent<OpenNewItemFormDetail>
  }
}

export type DashboardItem = DashboardEmbedCode | DashboardImage | DashboardLink | DashboardVenue
export const DashboardItemType = ['embedCode', 'image', 'link', 'venue'] as const
export type EmbeddedItemKey = typeof DashboardItemType[number]

interface DashboardProps <T extends DashboardItem> {
  itemType: EmbeddedItemKey,
  items: T[],
  editItem: (item: FormData) => Promise<FormResponse<T> | undefined>,
  deleteItem: (id: string)=> Promise<FormResponse<T> | undefined>
}

export function DashboardItems<T extends DashboardItem> (
  { itemType, items, editItem, deleteItem }: DashboardProps<T>
) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<T | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = () => {
    const savedItems = items.filter(item => !!item.id)
    const term = searchTerm.toLowerCase()
    if (!searchTerm) return savedItems

    return savedItems.filter(item =>
      Object.values(item)
        .filter(val => typeof val === 'string')
        .some(val => (val as string).toLowerCase().includes(term))
    )
  }

  const toggleExpand = () => setIsExpanded(!isExpanded)

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
    if (searchTerm.length > 0) {
      return `${formattedItemType()} matching "${searchTerm}" (${filteredItems().length})`
    }
    return `All ${formattedItemType()} (${filteredItems().length})`
  }

  const headingId = useId()

  return (
    <div>
      <ItemsFilterNav
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isExpanded={isExpanded}
        onExpand={toggleExpand}
        itemType={itemType}
      />

      <div className={itemsStyles['items-section']}>
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
  itemType: EmbeddedItemKey,
  item: T,
  isExpanded?: boolean,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
}) {
  function usedOnPages () {
    const events = item.eventSlugs?.map(i => eventUrl(i)) || []
    const releases =
      'releaseSlugs' in item && Array.isArray(item.releaseSlugs)
        ? item.releaseSlugs.map(i => releaseUrl(i))
        : []
    const about = []
    if ((item as _Link).type === 'press' || (item as Image).isPress) {
      if (!(item as _Link | Image).isHiddenOnAboutPage) {
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
    const link = item as _Link
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
      case 'embedCode': {
        const embedItem = item as EmbedCode
        return embedItem.title || 'Untitled'
      }
      case 'image': {
        const imageItem = item as Image
        const fileName = imageItem.url ? imageItem.url.split('/').pop() : 'Untitled'
        const imageTitle = imageItem.title || imageItem.caption || 'Untitled image'
        return `${imageTitle}${fileName ? `: ${fileName}` : ''}`
      }
      case 'link': {
        const linkItem = item as _Link
        return linkItem.title || 'Untitled'
      }
      case 'venue': {
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

        {(item as _Link | Venue).url && (
          <div>
            <h3>URL:</h3>
            <p>{(item as _Link | Venue).url}</p>
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
                      <Link href={page} target='_blank' rel='noopener noreferrer'>
                        {page}
                      </Link>
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
  itemType: EmbeddedItemKey
}) {
  switch (itemType) {
    case 'embedCode':
      return <EditEmbedCode embedCode={item as EmbedCode | undefined} />
    case 'image':
      return <EditImage image={item as Image | undefined} />
    case 'link':
      return <EditLink link={item as _Link | undefined} />
    case 'venue':
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
  itemType: EmbeddedItemKey
}) {
  switch (itemType) {
    case 'embedCode':
      return <EmbedCodeItem embedCode={item as EmbedCode} />
    case 'image':
      return (
        <FigureImage image={item as Image} />
      )
    case 'link':
      if ((item as _Link).quotation || (item as _Link).attribution) {
        return (
          <LinkItem link={item as _Link} />
        )
      }
      break
    case 'venue':
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
