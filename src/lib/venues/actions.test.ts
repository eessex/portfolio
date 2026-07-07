import { updateTag } from 'next/cache'

import { sql } from '@/lib/db'
import { deleteVenue, editVenue } from '@/lib/venues/actions'
import {
  newVenueFixtureAlpha,
  venueFixtureAlpha
} from '@/lib/venues/fixtures'
import type { CreateVenue, Venue } from '@/lib/venues/schemas/db'
import { formDataFromObject } from '@/test/helpers'

jest.mock('next/cache')

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

const existingVenueRow = {
  ...venueFixtureAlpha,
  eventSlugs: []
}

describe('Venue Actions', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('#deleteVenue', () => {
    it('can delete a venue', async () => {
      mockSql.mockResolvedValueOnce([venueFixtureAlpha])
      const res = await deleteVenue(venueFixtureAlpha)

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('venues')
      // venues are embedded into cached event pages
      expect(updateTag).toHaveBeenCalledWith('events')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteVenue(venueFixtureAlpha)

      expect(res!.message).toBe('Failed to delete venue: DB error.')
    })
  })

  describe('#editVenue', () => {
    it('can edit an existing venue', async () => {
      mockSql
        .mockResolvedValueOnce([existingVenueRow]) // fetchVenueById
        .mockResolvedValueOnce([venueFixtureAlpha]) // UPDATE ... RETURNING *
      const res = await editVenue(
        formDataFromObject(venueFixtureAlpha),
        venueFixtureAlpha.id
      )
      expect(res?.ok).toBe(true)
      expect((res?.res as Venue)?.name).toEqual('Test Venue Texas')
      expect(updateTag).toHaveBeenCalledWith('venues')

      // second sql call is the UPDATE, scoped to the given id
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('merges submitted fields with the existing venue on update', async () => {
      mockSql
        .mockResolvedValueOnce([existingVenueRow])
        .mockResolvedValueOnce([venueFixtureAlpha])

      // only city and timezone (required) are submitted; other
      // fields should fall back to the existing venue's values
      // rather than being nulled out
      await editVenue(
        formDataFromObject({
          city: 'Austin',
          timezone: venueFixtureAlpha.timezone
        }),
        venueFixtureAlpha.id
      )

      const [, address, city, country, name] = mockSql.mock
        .calls[1] as unknown as string[]
      expect(address).toBe(venueFixtureAlpha.address)
      expect(city).toBe('Austin')
      expect(country).toBe(venueFixtureAlpha.country)
      expect(name).toBe(venueFixtureAlpha.name)
    })

    it('can create a new venue', async () => {
      mockSql.mockResolvedValueOnce([venueFixtureAlpha])
      const res = await editVenue(
        formDataFromObject(newVenueFixtureAlpha)
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Venue)?.name).toEqual('Test Venue Texas')
      expect((res?.res as Venue)?.id).toEqual(
        'b3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a'
      )
      expect(updateTag).toHaveBeenCalledWith('venues')
      // venues are embedded into cached event pages
      expect(updateTag).toHaveBeenCalledWith('events')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editVenue(
        formDataFromObject(venueFixtureAlpha)
      )

      expect(res!.message).toBe('Failed to edit venue: DB error.')
    })

    it('can handle errors fetching the existing venue on update', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editVenue(
        formDataFromObject(venueFixtureAlpha),
        venueFixtureAlpha.id
      )

      expect(res!.message).toBe('Failed to edit venue: DB error.')
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreateVenue> = {
        ...newVenueFixtureAlpha
      }
      delete invalid.city
      const res = await editVenue(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate venue.')
      expect(res!.errors).toEqual({ city: ['Required'] })
    })
  })
})
