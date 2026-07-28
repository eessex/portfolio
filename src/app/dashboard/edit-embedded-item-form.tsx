'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import {
  type EmbeddedItemType,
  EmbeddedItemTypes,
  singularizePath
} from '@/lib/schemas'
import { camelToSnake } from '@/lib/strings'
import type { EmbeddedItem, FormResponse } from '@/lib/types'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import { Form, useFormErrors } from '@/ui/form/form'
import { EditImage } from '@/ui/images/edit-image-form'
import { EditLink } from '@/ui/links/edit-link-form'
import { EditPublishedEdition } from '@/ui/published-editions/edit-published-edition-form'
import { EditVenue } from '@/ui/venues/edit-venue-form'

function getEditFormComponent(itemType: EmbeddedItemType) {
  switch (itemType) {
    case EmbeddedItemTypes.embedCodes:
      return EditEmbedCode
    case EmbeddedItemTypes.images:
      return EditImage
    case EmbeddedItemTypes.links:
      return EditLink
    case EmbeddedItemTypes.publishedEditions:
      return EditPublishedEdition
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
  editItem
}: {
  item?: T
  itemType: EmbeddedItemType
  editItem: (
    formData: FormData,
    id?: string
  ) => Promise<FormResponse<T>>
}) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const res = await editItem(formData, item?.id)
    if (res?.ok && res.res) {
      router.push(`/dashboard/${camelToSnake(itemType)}`)
    }
    return res
  }

  return (
    <Form
      action={handleSubmit}
      submitButtonClassName='button-lg button-primary'
    >
      <EmbeddedItemFormFields item={item} itemType={itemType} />
    </Form>
  )
}
