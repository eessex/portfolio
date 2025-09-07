import type { Venue } from '@/lib/venues/types'
import { Input, type InputType } from '@/ui/form/input'

interface EditVenueProps {
  venue?: Venue,
  ref?: (el: InputType) => InputType | null
}

export const EditVenue = ({ venue, ref }: EditVenueProps) => {
  return (
    <>
      <Input
        label='Name'
        defaultValue={venue?.name}
        description='If the venue has no name, put the street address here instead.'
        ref={ref}
        attributes={{
          maxLength: 255,
          name: 'name',
          placeholder: 'CBGB'
        }}
      />
      <Input
        label='Street address'
        defaultValue={venue?.address}
        attributes={{
          maxLength: 255,
          name: 'address',
          placeholder: '123 Main St'
        }}
      />
      <Input
        label='City'
        defaultValue={venue?.city}
        attributes={{
          maxLength: 255,
          name: 'city',
          placeholder: 'Brooklyn',
          required: true
        }}
      />
      <Input
        label='State'
        defaultValue={venue?.state}
        attributes={{
          maxLength: 2,
          name: 'state',
          placeholder: 'NY'
        }}
      />
      <Input
        label='Country'
        defaultValue={venue?.country}
        attributes={{
          maxLength: 255,
          name: 'country',
          placeholder: 'USA'
        }}
      />
      <Input
        label='Venue website'
        description='The homepage or profile of the venue, not a ticket link.'
        defaultValue={venue?.url}
        attributes={{
          maxLength: 255,
          name: 'url',
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
    </>
  )
}
