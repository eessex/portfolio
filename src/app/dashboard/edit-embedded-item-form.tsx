'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import type { EmbeddedItemType } from '@/lib/types'
import { editVenue } from '@/lib/venues/actions'
import type { DashboardItem } from '@/ui/dashboard/dashboard-items'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import { Form } from '@/ui/form/form'
import { EditImage } from '@/ui/images/edit-image-form'
import { EditLink } from '@/ui/links/edit-link-form'
import {
  camelToSnake,
  singularizePath
} from '@/ui/util'
import { EditVenue } from '@/ui/venues/edit-venue-form'

function getEditFormComponent (itemType: EmbeddedItemType) {
  switch (itemType) {
    case 'embedCodes':
      return EditEmbedCode
    case 'images':
      return EditImage
    case 'links':
      return EditLink
    case 'venues':
      return EditVenue
    default:
      throw new Error(`Unsupported item type: ${itemType}`)
  }
}

export function EditEmbeddedItemForm ({
  item,
  itemType
}: {
  item?: DashboardItem
  itemType: EmbeddedItemType
}) {
  const router = useRouter()

  async function handleSubmit (formData: FormData) {
    const res = await editVenue(formData)
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
      {React.createElement(
        getEditFormComponent(itemType) as React.ElementType,
        { [singularizePath(itemType)]: item }
      )}
    </Form>
  )
}
