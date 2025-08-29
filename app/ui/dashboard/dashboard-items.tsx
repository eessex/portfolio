'use client'

import type { EmbeddedItemKey } from '@/lib/actions'
import type { ItemArrays } from '@/lib/data'
import type { Link as _Link, EmbedCode, FormResponse } from '@/lib/definitions'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { Dialog } from '@/ui/dialog/dialog'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button/expand-collapse-button'
import { EditItemNav } from '@/ui/form/edit-item-nav'
import { Form } from '@/ui/form/form'
import itemsStyles from '@/ui/items/items.module.scss'
import { EditLink } from '@/ui/links/edit-link-form'
import { LinkItem } from '@/ui/links/link-item'
import { eventUrl, releaseUrl } from '@/ui/util'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { OpenNewItemFormDetail } from './dashboard-layout'

declare global {
  interface DocumentEventMap {
    openNewItemForm: CustomEvent<OpenNewItemFormDetail>
  }
}

interface DashboardProps <T extends ItemArrays> {
  itemType: EmbeddedItemKey
  items: T[],
  editItem: (item: FormData) => Promise<FormResponse<T> | undefined>,
  deleteItem: (id: string)=> Promise<FormResponse<T> | undefined>
}

export function DashboardItems<T extends ItemArrays> (
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

  return (
    <div>
      <header className={itemsStyles['items-header']}>
        <h2>All {itemType}s ({items.length})</h2>
        <ExpandCollapseButton isExpanded={isExpanded} onExpand={toggleExpand} />
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

function DashboardListItem<T extends ItemArrays> ({
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
    const releases = item.releaseSlugs?.map(i => releaseUrl(i)) || []

    return [...events, ...releases]
  }

  function titleWithCount () {
    const usedOn = usedOnPages()
    const count = usedOn.length > 0 ? ` (${usedOn.length})` : ''
    return title() + count
  }

  function title () {
    switch (itemType) {
      case 'link': {
        const linkItem = item as _Link
        return linkItem.title || 'Untitled'
      }
      case 'embedCode': {
        const embedItem = item as EmbedCode
        return embedItem.title || 'Untitled'
      }
    }
  }

  return (
    <li key={item.id} className={styles['dashboard-list-item']}>
      <AccordionDropdown title={titleWithCount()} isExpanded={isExpanded}>
        <EditItemNav id={item.id!} onEdit={onEdit} onDelete={onDelete} />
        <ItemDisplay item={item} itemType={itemType} />

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
  item?: ItemArrays
  itemType: EmbeddedItemKey
}) {
  switch (itemType) {
    case 'link':
      return <EditLink link={item as _Link | undefined} />
    case 'embedCode':
      return <EditEmbedCode embedCode={item as EmbedCode | undefined} />
    default:
      return <div>Unknown item type: {itemType}</div>
  }
}

export function ItemDisplay ({
  item,
  itemType
}: {
  item?: ItemArrays
  itemType: EmbeddedItemKey
}) {
  switch (itemType) {
    case 'link':
      if ((item as _Link).quotation || (item as _Link).attribution) {
        return (
          <LinkItem link={item as _Link} />
        )
      } else {
        return (
          <div>
            <h3>URL:</h3>
            <p>{(item as _Link).url}</p>
          </div>
        )
      }

    case 'embedCode':
      return <EmbedCodeItem embedCode={item as EmbedCode} />
    default:
      return <div>Unknown item type: {itemType}</div>
  }
}
