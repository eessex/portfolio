import type { Venue } from '@/lib/venues/types'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'

interface EditVenueProps {
  isPrefixEnabled?: boolean
  venue?: Partial<Venue>
}

export const EditVenue = ({
  isPrefixEnabled, venue
}: EditVenueProps) => {
  const namePrefix = isPrefixEnabled ? 'venue.' : ''

  return (
    <>
      <Input
        label='Name'
        defaultValue={venue?.name}
        description='If the venue has no name, leave this blank.'
        attributes={{
          maxLength: 255,
          name: `${namePrefix}name`,
          placeholder: 'CBGB'
        }}
      />
      <Input
        label='Street address'
        defaultValue={venue?.address}
        attributes={{
          maxLength: 255,
          name: `${namePrefix}address`,
          placeholder: '123 Main St'
        }}
      />
      <Input
        label='City'
        defaultValue={venue?.city}
        attributes={{
          maxLength: 255,
          name: `${namePrefix}city`,
          placeholder: 'Brooklyn',
          required: true
        }}
      />
      <div className={styles['input-group']}>
        <Input
          label='State'
          defaultValue={venue?.state}
          attributes={{
            maxLength: 2,
            name: `${namePrefix}state`,
            placeholder: 'NY'
          }}
        />
        <Input
          label='Country'
          defaultValue={venue?.country}
          attributes={{
            maxLength: 255,
            name: `${namePrefix}country`,
            placeholder: 'USA'
          }}
        />
      </div>
      <Input
        label='Venue website'
        description='The homepage or profile of the venue, not a ticket link.'
        defaultValue={venue?.url}
        attributes={{
          maxLength: 255,
          name: `${namePrefix}url`,
          placeholder: 'https://cbgb.com',
          type: 'url'
        }}
      />
      {venue?.id && (
        <Input
          label='Venue ID'
          defaultValue={venue.id}
          attributes={{
            name: 'id',
            type: 'hidden'
          }}
        />
      )}
      {venue?.createdAt && (
        <Input
          label='Created At'
          defaultValue={venue.createdAt.toISOString()}
          attributes={{
            name: 'createdAt',
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}
