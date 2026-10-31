'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import {
  type EmbeddedItemType,
  EmbeddedItemTypes,
  itemTypeToLabel,
  singularizePath
} from '@/lib/schemas'
import type { EmbeddedItem, FormResponse } from '@/lib/types'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import { Form, useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { EditImage } from '@/ui/images/edit-image-form'
import { DeleteItemButton } from '@/ui/items/delete-item-button'
import { EditLink } from '@/ui/links/edit-link-form'
import { EditPublisher } from '@/ui/publishers/edit-publisher-form'
import { dashboardUrl } from '@/ui/routes'
import { EditVenue } from '@/ui/venues/edit-venue-form'

function getEditFormComponent(itemType: EmbeddedItemType) {
  switch (itemType) {
    case EmbeddedItemTypes.embedCodes:
      return EditEmbedCode
    case EmbeddedItemTypes.images:
      return EditImage
    case EmbeddedItemTypes.links:
      return EditLink
    case EmbeddedItemTypes.publishers:
      return EditPublisher
    case EmbeddedItemTypes.venues:
      return EditVenue
    default:
      throw new Error(`Unsupported item type: ${itemType}`)
  }
}

function EmbeddedItemFormFields<T extends EmbeddedItem>({
  item,
  itemType
}: {
  item?: T
  itemType: EmbeddedItemType
}) {
  const errors = useFormErrors()

  return React.createElement(
    getEditFormComponent(itemType) as React.ElementType,
    { [singularizePath(itemType)]: item, errors }
  )
}

export function EditEmbeddedItemForm<
  T extends EmbeddedItem = EmbeddedItem
>({
  item,
  itemType,
  editItem,
  deleteItem
}: {
  item?: T
  itemType: EmbeddedItemType
  editItem: (
    formData: FormData,
    id?: string
  ) => Promise<FormResponse<T>>
  deleteItem?: (item: T) => Promise<FormResponse<T>>
}) {
  const router = useRouter()
  const redirectTo = dashboardUrl(itemType)

  async function handleSubmit(formData: FormData) {
    const res = await editItem(formData, item?.id)
    if (res?.ok && res.res) {
      router.push(redirectTo)
    }
    return res
  }

  return (
    <>
      <Form action={handleSubmit}>
        <EmbeddedItemFormFields item={item} itemType={itemType} />
      </Form>

      {item && deleteItem && (
        <div className={styles['delete-button-container']}>
          <DeleteItemButton
            deleteItem={() => deleteItem(item)}
            itemLabel={itemTypeToLabel(itemType, true, true)}
            redirectTo={redirectTo}
          />
        </div>
      )}
    </>
  )
}
