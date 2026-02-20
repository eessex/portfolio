import type { z } from 'zod'

import type { createVenueSchema } from '@/lib/venues/schemas'
import type { Venue } from '@/lib/venues/types'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'

interface EditVenueProps {
  errors?: z.inferFlattenedErrors<typeof createVenueSchema>['fieldErrors']
  isPrefixEnabled?: boolean
  venue?: Partial<Venue>
}

export const EditVenue = ({
  errors,
  isPrefixEnabled,
  venue
}: EditVenueProps) => {
  const namePrefix = isPrefixEnabled ? 'venue.' : ''

  return (
    <>
      <Input
        attributes={{
          maxLength: 255,
          name: `${namePrefix}name`,
          placeholder: 'CBGB'
        }}
        description='If the venue has no name, leave this blank.'
        defaultValue={venue?.name}
        errors={errors?.name}
        label='Name'
      />
      <Input
        attributes={{
          maxLength: 255,
          name: `${namePrefix}address`,
          placeholder: '123 Main St'
        }}
        defaultValue={venue?.address}
        errors={errors?.address}
        label='Street address'
      />
      <Input
        attributes={{
          maxLength: 255,
          name: `${namePrefix}city`,
          placeholder: 'Brooklyn',
          required: true
        }}
        defaultValue={venue?.city}
        errors={errors?.city}
        label='City'
      />
      <div className={styles['input-group']}>
        <Input
          attributes={{
            maxLength: 2,
            name: `${namePrefix}state`,
            placeholder: 'NY'
          }}
          defaultValue={venue?.state}
          errors={errors?.state}
          label='State'
        />
        <Input
          attributes={{
            maxLength: 255,
            name: `${namePrefix}country`,
            placeholder: 'USA'
          }}
          defaultValue={venue?.country}
          errors={errors?.country}
          label='Country'
        />
      </div>
      <Input
        attributes={{
          maxLength: 255,
          name: `${namePrefix}url`,
          placeholder: 'https://cbgb.com',
          type: 'url'
        }}
        defaultValue={venue?.url}
        description='The homepage or profile of the venue, not a ticket link.'
        errors={errors?.url}
        label='Venue website'
      />
      {venue?.id && (
        <Input
          attributes={{
            name: `${namePrefix}id`,
            type: 'hidden'
          }}
          defaultValue={venue.id}
          label='Venue ID'
        />
      )}
    </>
  )
}
