import { revalidatePath } from 'next/cache'

import { sql } from '@/lib/db'
import { deleteVenue, editVenue } from '@/lib/venues/actions'
import {
  newVenueFixtureAlpha,
  venueFixtureAlpha
} from '@/lib/venues/fixtures'
import type { CreateVenue, Venue } from '@/lib/venues/types'
import { formDataFromObject } from '@/test/helpers'

jest.mock('next/cache')

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

describe('Venue Actions', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('#deleteVenue', () => {
    it('can delete a venue', async () => {
      mockSql.mockResolvedValueOnce([venueFixtureAlpha])
      const res = await deleteVenue(venueFixtureAlpha)

      expect(res).toEqual({ ok: true })
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/venues')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteVenue(venueFixtureAlpha)

      expect(res!.message).toBe('Failed to delete venue: DB error')
    })
  })

  describe('#editVenue', () => {
    it('can edit an existing venue', async () => {
      mockSql.mockResolvedValueOnce([venueFixtureAlpha])
      const res = await editVenue(formDataFromObject(venueFixtureAlpha))
      expect(res?.ok).toBe(true)
      expect((res?.res as Venue)?.name).toEqual('Test Venue Texas')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/venues')
    })

    it('can create a new venue', async () => {
      mockSql.mockResolvedValueOnce([venueFixtureAlpha])
      const res = await editVenue(formDataFromObject(newVenueFixtureAlpha))

      expect(res?.ok).toBe(true)
      expect((res?.res as Venue)?.name).toEqual('Test Venue Texas')
      expect((res?.res as Venue)?.id).toEqual(
        'b3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a'
      )
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/venues')
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editVenue(formDataFromObject(venueFixtureAlpha))

      expect(res!.message).toBe('Failed to edit venue: DB error')
    })

    it('can handle validation errors', async () => {
      const invalid: Partial<CreateVenue> = { ...newVenueFixtureAlpha }
      delete invalid.city
      const res = await editVenue(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate venue.')
      expect(res!.errors).toEqual({ city: ['Required'] })
    })
  })
})
