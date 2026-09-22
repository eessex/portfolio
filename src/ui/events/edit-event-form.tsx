'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { DEFAULT_TIME_ZONE } from '@/lib/dates'
import {
  createEmbedCodeSchema,
  type EmbedCode
} from '@/lib/embed-codes/schemas/db'
import { deleteEvent, editEvent } from '@/lib/events/actions'
import type { EventClient } from '@/lib/events/types'
import {
  type Image,
  imageClientFieldsSchema
} from '@/lib/images/schemas/db'
import { createLinkSchema, type Link } from '@/lib/links/schemas/db'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import {
  MAX_STRING_LENGTH_LONG,
  MAX_STRING_LENGTH_SHORT
} from '@/lib/schemas/primitives'
import {
  createVenueSchema,
  type Venue
} from '@/lib/venues/schemas/db'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import {
  formatEmbedCodeResult,
  formatNewEmbedCodeSummary
} from '@/ui/embed-codes/format-embed-code-result'
import { Checkbox } from '@/ui/form/checkbox'
import { Form, useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { EditImage } from '@/ui/images/edit-image-form'
import {
  formatImageResult,
  formatNewImageSummary
} from '@/ui/images/format-image-result'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { DeleteItemButton } from '@/ui/items/delete-item-button'
import { EditLink } from '@/ui/links/edit-link-form'
import { formatLinkResult } from '@/ui/links/format-link-result'
import { formatProjectResult } from '@/ui/projects/format-project-result'
import { toDateTimeInputValue } from '@/ui/util'
import { EditVenue } from '@/ui/venues/edit-venue-form'
import {
  formatNewVenueSummary,
  formatVenueResult
} from '@/ui/venues/format-venue-result'

function EventFormFields({ event }: { event?: EventClient }) {
  const errors = useFormErrors()
  const images = [event?.coverImage, ...(event?.images ?? [])].filter(
    (image): image is Image => !!image
  )
  const [isPublished, setIsPublished] = useState(!!event?.isPublished)

  return (
    <>
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: 'title',
          required: true
        }}
        defaultValue={event?.title}
        errors={errors?.title}
        label='Title'
      />
      <div className={styles['input-group']}>
        <Input
          attributes={{
            name: 'startTime',
            type: 'datetime-local',
            required: true
          }}
          defaultValue={toDateTimeInputValue(
            event?.startTime,
            event?.venue?.timezone ?? DEFAULT_TIME_ZONE
          )}
          errors={errors?.startTime}
          label='Start time'
        />
        <Input
          attributes={{ name: 'endTime', type: 'datetime-local' }}
          defaultValue={toDateTimeInputValue(
            event?.endTime,
            event?.venue?.timezone ?? DEFAULT_TIME_ZONE
          )}
          errors={errors?.endTime}
          label='End time'
        />
      </div>
      <ItemPicker<Venue>
        itemType='venues'
        isRequired
        existingItem={event?.venue}
        renderExistingResult={formatVenueResult}
        renderNewItemSummary={formatNewVenueSummary}
        schema={createVenueSchema}
        renderEditItemForm={({ errors, existingItem }) => (
          <EditVenue errors={errors} venue={existingItem} />
        )}
      />
      <Input
        attributes={{ name: 'ticketLink', type: 'url' }}
        defaultValue={event?.ticketLink}
        errors={errors?.ticketLink}
        label='Ticket link'
      />
      <Input
        as='textarea'
        attributes={{
          maxLength: MAX_STRING_LENGTH_LONG,
          name: 'description'
        }}
        defaultValue={event?.description}
        errors={errors?.description}
        label='Description'
      />
      <ItemPicker<Image>
        isMulti
        name='images'
        label='Images'
        itemType='images'
        existingItems={images}
        renderExistingResult={formatImageResult}
        renderNewItemSummary={formatNewImageSummary}
        schema={imageClientFieldsSchema}
        renderEditItemForm={({
          errors,
          isRequired,
          existingItem
        }) => (
          <EditImage
            image={existingItem}
            errors={errors}
            isPressFieldsetHidden
            isRequired={isRequired}
          />
        )}
      />
      <ItemPicker<EmbedCode>
        isMulti
        name='embedCodes'
        label='Embed codes'
        itemType='embedCodes'
        existingItems={event?.embedCodes ?? []}
        renderExistingResult={formatEmbedCodeResult}
        renderNewItemSummary={formatNewEmbedCodeSummary}
        schema={createEmbedCodeSchema}
        renderEditItemForm={({
          errors,
          isRequired,
          existingItem,
          onBusyChange
        }) => (
          <EditEmbedCode
            embedCode={existingItem}
            errors={errors}
            isRequired={isRequired}
            onBusyChange={onBusyChange}
          />
        )}
      />
      <ItemPicker<Link>
        isMulti
        name='links'
        label='Links'
        itemType='links'
        existingItems={event?.links ?? []}
        renderExistingResult={formatLinkResult}
        schema={createLinkSchema}
        renderEditItemForm={({
          errors,
          isRequired,
          existingItem
        }) => (
          <EditLink
            link={existingItem}
            errors={errors}
            isRequired={isRequired}
          />
        )}
      />
      <ItemPicker<never, ProjectClient, FetchProjectsResult>
        itemType='projects'
        label='Project'
        existingItem={event?.project as ProjectClient | undefined}
        renderExistingResult={formatProjectResult}
      />
      <Checkbox
        attributes={{ name: 'isPublished' }}
        isChecked={isPublished}
        label='Published'
        onChange={() => setIsPublished(!isPublished)}
      />
    </>
  )
}

export function EditEventForm({ event }: { event?: EventClient }) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const res = await editEvent(formData, event?.id)
    if (res?.ok && res.res) {
      router.push(`/events/${res.res.slug}`)
    }
    return res
  }

  return (
    <>
      <Form
        action={handleSubmit}
        submitButtonClassName='button-lg button-primary'
      >
        <EventFormFields event={event} />
      </Form>

      {event && (
        <div className={styles['delete-button-container']}>
          <DeleteItemButton
            deleteItem={() => deleteEvent(event)}
            itemLabel='event'
            redirectTo='/events'
          />
        </div>
      )}
    </>
  )
}
