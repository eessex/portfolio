import type { z } from 'zod'

import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
import type {
  createVenueSchema,
  Venue
} from '@/lib/venues/schemas/db'
import { venueTimezones } from '@/lib/venues/schemas/db'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'

interface EditVenueProps {
  errors?: z.inferFlattenedErrors<
    typeof createVenueSchema
  >['fieldErrors']
  venue?: Partial<Venue>
}

export const EditVenue = ({ errors, venue }: EditVenueProps) => {
  const namePrefix = useNamePrefix()

  return (
    <>
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
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
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: `${namePrefix}address`,
          placeholder: '123 Main St'
        }}
        defaultValue={venue?.address}
        errors={errors?.address}
        label='Street address'
      />

      <div className={styles['input-group']}>
        <Input
          attributes={{
            maxLength: MAX_STRING_LENGTH_SHORT,
            name: `${namePrefix}city`,
            placeholder: 'Brooklyn',
            required: true
          }}
          defaultValue={venue?.city}
          errors={errors?.city}
          label='City'
        />
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
      </div>

      <div className={styles['input-group']}>
        <Input
          attributes={{
            maxLength: MAX_STRING_LENGTH_SHORT,
            name: `${namePrefix}country`,
            placeholder: 'USA'
          }}
          defaultValue={venue?.country}
          errors={errors?.country}
          label='Country'
        />
        <Select
          options={[...venueTimezones]}
          formatOptionLabel={(tz) => tz.replace(/_/g, ' ')}
          errors={errors?.timezone}
          label='Timezone'
          placeholder='Select a timezone'
          value={venue?.timezone}
          attributes={{
            name: `${namePrefix}timezone`,
            required: true
          }}
        />
      </div>

      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: `${namePrefix}url`,
          placeholder: 'https://cbgb.com',
          type: 'url'
        }}
        defaultValue={venue?.url}
        description='The homepage or profile of the venue, not a ticket link.'
        errors={errors?.url}
        label='Venue website'
      />
    </>
  )
}
