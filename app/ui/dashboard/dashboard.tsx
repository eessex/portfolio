'use client'

import { EmbeddedItemKey } from '@/lib/actions'
import { ItemArrays } from '@/lib/data'
import type { EmbedCode, Venue, Image, Link as _Link, FormResponse } from '@/lib/definitions'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { Dialog } from '@/ui/dialog/dialog'
import { EditItemNav } from '@/ui/form/edit-item-nav'
import { Form } from '@/ui/form/form'
import { eventUrl, releaseUrl } from '@/ui/util'
import styles from '@/ui/venues/venues.module.scss'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { EditVenue } from '@/ui/venues/edit-venue-form'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code'
import { EditLink } from '@/ui/links/edit-link-form'

interface DashboardProps <T extends ItemArrays | Venue> {
  itemType: EmbeddedItemKey | 'venue'
  items: T[],
  editItem: (item: FormData) => Promise<FormResponse<T> | undefined>,
  deleteItem: (id: string)=> Promise<FormResponse<T> | undefined>
}

export function Dashboard<T extends ItemArrays | Venue> (
  { itemType, items, editItem, deleteItem }: DashboardProps<T>
) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<T | undefined>(undefined)

  type SavedItem = T & { id: string }

  const toggleExpand = () => setIsExpanded(!isExpanded)

  async function onSubmit (formData: FormData): Promise<FormResponse<T>> {
    console.log('Form submitted:', formData)
    try {
      const res = await editItem(formData)
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

  return (
    <div>
      <header>
        <button className={`button ${styles['new-item']}`} onClick={() => setIsEditDialogOpen(true)}>
          <PlusIcon /> Add {itemType}
        </button>

        <div className={styles['venues-dashboard-header']}>
          <h2>All {itemType}s ({items.length})</h2>
          <button onClick={toggleExpand}>{isExpanded ? 'Collapse all' : 'Expand all'}</button>
        </div>
      </header>

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

      <ul>
        {items
          .filter(item => !!item.id)
          .map((item) => (
            <DashboardListItem
              key={item.id}
              item={(item as SavedItem)}
              itemType={itemType}
              isExpanded={isExpanded}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
      </ul>
    </div>
  )
}

function DashboardListItem<T extends ItemArrays | Venue> ({
  itemType,
  item,
  isExpanded,
  onEdit,
  onDelete
}: {
  itemType: EmbeddedItemKey | 'venue',
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

    return [...events, ...releases]
  }

  function titleWithCount () {
    const usedOn = usedOnPages()
    const count = usedOn.length > 0 ? ` (${usedOn.length})` : ''
    return title() + count
  }

  function title () {
    switch (itemType) {
      case 'venue': {
        const venueItem = item as Venue & { id: string }
        return `${venueItem.name || venueItem.address}, ${venueItem.city}, ${venueItem.state || venueItem.country}`
      }
      case 'link': {
        const linkItem = item as _Link
        return linkItem.title || 'Untitled'
      }
      case 'image': {
        const imageItem = item as Image
        return imageItem.caption || 'Untitled'
      }
      case 'embedCode': {
        const embedItem = item as EmbedCode
        return embedItem.title || 'Untitled'
      }
    }
  }

  return (
    <li key={item.id} className={styles['venues-dashboard-list-item']}>
      <AccordionDropdown title={titleWithCount()} isExpanded={isExpanded}>
        <EditItemNav id={item.id!} onEdit={onEdit} onDelete={onDelete} />
        <div>ID: {item.id}</div>

        <div>
          <h2>Visible on:</h2>
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
  item?: ItemArrays | Venue
  itemType: EmbeddedItemKey | 'venue'
}) {
  switch (itemType) {
    case 'venue':
      return <EditVenue venue={item as Venue | undefined} />
    case 'link':
      return <EditLink link={item as _Link | undefined} />
    // case 'image':
    //   return <EditImage image={item as Image | undefined} />
    case 'embedCode':
      return <EditEmbedCode embedCode={item as EmbedCode | undefined} />
    default:
      return <div>Unknown item type: {itemType}</div>
  }
}
