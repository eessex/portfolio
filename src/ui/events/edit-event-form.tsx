'use client'

import { DEFAULT_TIME_ZONE } from '@/lib/dates'
import { deleteEvent, editEvent } from '@/lib/events/actions'
import type { EventClient } from '@/lib/events/types'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import { PagePaths } from '@/lib/schemas'
import {
  MAX_STRING_LENGTH_LONG,
  MAX_STRING_LENGTH_SHORT
} from '@/lib/schemas/primitives'
import {
  createVenueSchema,
  type Venue
} from '@/lib/venues/schemas/db'
import { EmbedCodesPicker } from '@/ui/embed-codes/embed-codes-picker'
import { Checkbox } from '@/ui/form/checkbox'
import { useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { ItemEditForm } from '@/ui/form/item-edit-form'
import { ImagesPicker } from '@/ui/images/images-picker'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import {
  LinksPicker,
  PressLinksPicker
} from '@/ui/links/links-picker'
import { formatProjectResult } from '@/ui/projects/format-project-result'
import { toDateTimeInputValue } from '@/ui/util'
import { EditVenue } from '@/ui/venues/edit-venue-form'
import {
  formatNewVenueSummary,
  formatVenueResult
} from '@/ui/venues/format-venue-result'

type EditEventFormProps = {
  event?: EventClient
}

function EventFormFields({ event }: EditEventFormProps) {
  const errors = useFormErrors()

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
        isSearchFirst
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
      <ImagesPicker
        coverImage={event?.coverImage}
        images={event?.images}
      />
      <EmbedCodesPicker embedCodes={event?.embedCodes} />
      <PressLinksPicker links={event?.links} />
      <LinksPicker links={event?.links} />
      <ItemPicker<never, ProjectClient, FetchProjectsResult>
        itemType={PagePaths.projects}
        label='Project'
        existingItem={event?.project as ProjectClient | undefined}
        renderExistingResult={formatProjectResult}
      />
      <Checkbox
        attributes={{ name: 'isPublished' }}
        isDefaultChecked={!!event?.isPublished}
        label='Published'
      />
    </>
  )
}

export function EditEventForm({ event }: EditEventFormProps) {
  return (
    <ItemEditForm
      path={PagePaths.events}
      action={(formData) => editEvent(formData, event?.id)}
      deleteItem={event && (() => deleteEvent(event))}
    >
      <EventFormFields event={event} />
    </ItemEditForm>
  )
}
