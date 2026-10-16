import { updateTag } from 'next/cache'

import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { resolveOrderedEmbedCodeIds } from '@/lib/embed-codes/actions'
import { deleteEvent, editEvent } from '@/lib/events/actions'
import {
  eventFixtureAlpha,
  newEventFixtureAlpha
} from '@/lib/events/fixtures'
import type { CreateEvent, Event } from '@/lib/events/types'
import { resolveOrderedImageIds } from '@/lib/images/actions'
import { resolveOrderedLinkIds } from '@/lib/links/actions'
import { generateUniqueSlug } from '@/lib/slug/data'
import { fetchVenueById } from '@/lib/venues/data'
import { venueFixtureAlpha } from '@/lib/venues/fixtures'
import { formDataFromObject } from '@/test/helpers'
import { toDateTimeInputValue } from '@/ui/util'

jest.mock('@/lib/slug/data', () => ({
  generateUniqueSlug: jest.fn()
}))
const mockGenerateUniqueSlug = jest.mocked(generateUniqueSlug)

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))
const mockSql = jest.mocked(sql)

jest.mock('@/lib/images/actions', () => ({
  resolveOrderedImageIds: jest.fn()
}))
const mockResolveOrderedImageIds = jest.mocked(resolveOrderedImageIds)

jest.mock('@/lib/embed-codes/actions', () => ({
  resolveOrderedEmbedCodeIds: jest.fn()
}))
const mockResolveOrderedEmbedCodeIds = jest.mocked(
  resolveOrderedEmbedCodeIds
)

jest.mock('@/lib/links/actions', () => ({
  resolveOrderedLinkIds: jest.fn()
}))
const mockResolveOrderedLinkIds = jest.mocked(resolveOrderedLinkIds)

jest.mock('@/lib/venues/data', () => ({
  ...jest.requireActual('@/lib/venues/data'),
  fetchVenueById: jest.fn()
}))
const mockFetchVenueById = jest.mocked(fetchVenueById)
const mockVenue = venueFixtureAlpha as unknown as Awaited<
  ReturnType<typeof fetchVenueById>
>

const EXISTING_IMAGE_ID = '11111111-1111-4111-8111-111111111111'
const EXISTING_EMBED_CODE_ID = '22222222-2222-4222-8222-222222222222'
const FEATURED_EMBED_CODE_ID = '33333333-3333-4333-8333-333333333333'

describe('Event Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGenerateUniqueSlug.mockResolvedValue(eventFixtureAlpha.slug)
    mockResolveOrderedImageIds.mockResolvedValue({
      coverImageId: undefined,
      imageIds: []
    })
    mockResolveOrderedEmbedCodeIds.mockResolvedValue({
      embedCodeIds: []
    })
    mockResolveOrderedLinkIds.mockResolvedValue({ linkIds: [] })
    mockFetchVenueById.mockResolvedValue(mockVenue)
  })

  it('rejects unauthenticated callers', async () => {
    const mockAuth = auth as unknown as jest.Mock
    mockAuth.mockResolvedValueOnce(null)
    const res = await deleteEvent(eventFixtureAlpha)

    expect(res).toEqual({
      ok: false,
      message: 'You must be signed in to perform this action.'
    })
    expect(mockSql).not.toHaveBeenCalled()
  })

  describe('#deleteEvent', () => {
    it('can delete an event', async () => {
      mockSql.mockResolvedValueOnce([eventFixtureAlpha])
      const res = await deleteEvent(eventFixtureAlpha)

      expect(res).toEqual({ ok: true })
      expect(updateTag).toHaveBeenCalledWith('events')
      expect(updateTag).toHaveBeenCalledWith('events:authed')
      expect(updateTag).toHaveBeenCalledWith('events:public')
      expect(updateTag).toHaveBeenCalledWith(
        `event:${eventFixtureAlpha.id}`
      )
      expect(updateTag).toHaveBeenCalledWith('venues')
    })

    it('can handle errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await deleteEvent(eventFixtureAlpha)

      expect(res!.message).toBe('Failed to delete event: DB error.')
    })
  })

  describe('#editEvent', () => {
    it('can edit an existing event', async () => {
      mockSql
        .mockResolvedValueOnce([eventFixtureAlpha]) // fetchEventById
        .mockResolvedValueOnce([eventFixtureAlpha]) // UPDATE ... RETURNING *
      mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
        embedCodeIds: [EXISTING_EMBED_CODE_ID]
      })
      const res = await editEvent(
        formDataFromObject({
          ...eventFixtureAlpha,
          isPublished: 'on'
        }),
        eventFixtureAlpha.id
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Event)?.title).toEqual('Test Event')
      expect(mockGenerateUniqueSlug).toHaveBeenCalledWith(
        'Test Event',
        'events',
        eventFixtureAlpha.id
      )
      expect(updateTag).toHaveBeenCalledWith('events')

      expect(mockSql.mock.calls[1]?.[3]).toEqual([
        EXISTING_EMBED_CODE_ID
      ])
      expect(mockSql.mock.calls[1]?.[6]).toBe(true)
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('unpublishes an event when the Published checkbox is unchecked', async () => {
      mockSql
        .mockResolvedValueOnce([eventFixtureAlpha])
        .mockResolvedValueOnce([eventFixtureAlpha])

      const { isPublished: _omit, ...withoutPublished } =
        eventFixtureAlpha
      await editEvent(
        formDataFromObject(withoutPublished),
        eventFixtureAlpha.id
      )

      expect(mockSql.mock.calls[1]?.[6]).toBe(false)
    })

    it('merges submitted fields with the existing event on update', async () => {
      mockSql
        .mockResolvedValueOnce([eventFixtureAlpha])
        .mockResolvedValueOnce([eventFixtureAlpha])

      // only title is submitted; other fields should fall back to the
      // existing event's values
      await editEvent(
        formDataFromObject({
          title: 'Updated Title',
          venueId: eventFixtureAlpha.venueId,
          startTime: eventFixtureAlpha.startTime
        }),
        eventFixtureAlpha.id
      )

      expect(mockSql.mock.calls[1]?.[9]).toBe(
        eventFixtureAlpha.shortDescription
      )
    })

    it('can create a new event', async () => {
      mockSql.mockResolvedValueOnce([eventFixtureAlpha])
      mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
        embedCodeIds: [EXISTING_EMBED_CODE_ID]
      })
      const res = await editEvent(
        formDataFromObject({
          ...newEventFixtureAlpha,
          isPublished: 'on'
        })
      )

      expect(res?.ok).toBe(true)
      expect((res?.res as Event)?.title).toEqual('Test Event')
      expect((res?.res as Event)?.id).toEqual(eventFixtureAlpha.id)
      expect(mockGenerateUniqueSlug).toHaveBeenCalledWith(
        'Test Event',
        'events',
        undefined
      )
      expect(updateTag).toHaveBeenCalledWith('events')
      // embed_code_ids is written from the resolved order
      expect(mockSql.mock.calls[0]?.[3]).toEqual([
        EXISTING_EMBED_CODE_ID
      ])
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('interprets the start time in the venue timezone', async () => {
      mockSql.mockResolvedValueOnce([eventFixtureAlpha])

      await editEvent(
        formDataFromObject({
          ...newEventFixtureAlpha,
          isPublished: 'on',
          startTime: '2030-06-01T20:00'
        })
      )

      const startTime = mockSql.mock.calls[0]?.[11] as Date
      expect(startTime.toISOString()).not.toBe(
        '2030-06-01T20:00:00.000Z'
      )
      expect(
        toDateTimeInputValue(startTime, venueFixtureAlpha.timezone)
      ).toBe('2030-06-01T20:00')
    })

    it('resolves an inline-created venue into venue_id', async () => {
      const withoutVenue: Partial<CreateEvent> = {
        ...newEventFixtureAlpha
      }
      delete withoutVenue.venueId

      mockSql
        .mockResolvedValueOnce([venueFixtureAlpha])
        .mockResolvedValueOnce([eventFixtureAlpha])
      const res = await editEvent(
        formDataFromObject({
          ...withoutVenue,
          isPublished: 'on',
          'venue.city': venueFixtureAlpha.city,
          'venue.timezone': venueFixtureAlpha.timezone
        })
      )

      expect(res?.ok).toBe(true)
      expect(mockSql.mock.calls[1]?.[15]).toEqual(
        venueFixtureAlpha.id
      )
    })

    it('can handle generic errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'))
      const res = await editEvent(
        formDataFromObject({
          ...newEventFixtureAlpha,
          isPublished: 'on'
        })
      )

      expect(res!.message).toBe('Failed to save event: DB error.')
    })

    it('can handle validation errors when venueId is missing', async () => {
      const invalid: Partial<CreateEvent> = {
        ...newEventFixtureAlpha,
        isPublished: 'on' as unknown as boolean
      }
      delete invalid.venueId
      const res = await editEvent(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate event.')
      expect(res!.errors).toEqual({ venueId: ['Required'] })
    })

    it('can handle validation errors when title is missing', async () => {
      const invalid: Partial<CreateEvent> = {
        ...newEventFixtureAlpha,
        isPublished: 'on' as unknown as boolean
      }
      delete invalid.title
      const res = await editEvent(formDataFromObject(invalid))

      expect(res!.message).toBe('Failed to validate event.')
      expect(res!.errors).toEqual({ title: ['Required'] })
    })

    it('writes the resolved embedCodeIds, in order, to the saved row', async () => {
      mockSql
        .mockResolvedValueOnce([eventFixtureAlpha]) // fetchEventById
        .mockResolvedValueOnce([eventFixtureAlpha]) // UPDATE
      mockResolveOrderedEmbedCodeIds.mockResolvedValueOnce({
        embedCodeIds: [FEATURED_EMBED_CODE_ID, EXISTING_EMBED_CODE_ID]
      })

      await editEvent(
        formDataFromObject({
          ...eventFixtureAlpha,
          isPublished: 'on'
        }),
        eventFixtureAlpha.id
      )

      expect(mockSql.mock.calls[1]?.[3]).toEqual([
        FEATURED_EMBED_CODE_ID,
        EXISTING_EMBED_CODE_ID
      ])
    })

    it('passes the raw submitted data to the ordered id resolvers', async () => {
      mockSql.mockResolvedValueOnce([eventFixtureAlpha])

      await editEvent(
        formDataFromObject({
          ...newEventFixtureAlpha,
          isPublished: 'on',
          'images[]': '',
          'images[0].id': EXISTING_IMAGE_ID
        })
      )

      expect(mockResolveOrderedImageIds).toHaveBeenCalledWith(
        expect.objectContaining({
          'images[0].id': EXISTING_IMAGE_ID
        })
      )
    })
  })
})
