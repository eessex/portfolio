import { render, screen, waitFor } from '@testing-library/react'

import { eventFixtureUpcoming } from '@/lib/events/fixtures'
import type { EventClient } from '@/lib/events/types'
import { UpcomingEventsList } from '@/ui/events/upcoming-events-list'
import { resetIsAdminCache } from '@/ui/useIsAdmin'

const draftUpcomingEvent: EventClient = {
  ...eventFixtureUpcoming,
  id: '550e8400-e29b-41d4-a716-446655440010',
  slug: 'draft-upcoming-event',
  title: 'Unpublished upcoming draft'
}

function mockFetch(data: unknown, isAdmin = true) {
  global.fetch = jest.fn().mockImplementation(
    async (url: unknown) =>
      ({
        json: async () =>
          String(url).includes('/api/session')
            ? { isAuthed: isAdmin }
            : data
      }) as Response
  )
}

function fetchedUrls() {
  return (global.fetch as jest.Mock).mock.calls.map((call) =>
    String(call[0])
  )
}

describe('UpcomingEventsList', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
    resetIsAdminCache()
  })

  it('renders initial events and only checks the session for anonymous visitors', async () => {
    mockFetch([eventFixtureUpcoming, draftUpcomingEvent], false)

    render(
      <UpcomingEventsList
        initialEvents={[eventFixtureUpcoming]}
        title='Upcoming Events'
      />
    )

    expect(
      screen.getByText(eventFixtureUpcoming.title)
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    expect(fetchedUrls()).toEqual(['/api/session'])
    expect(
      screen.queryByText(draftUpcomingEvent.title)
    ).not.toBeInTheDocument()
  })

  it('refetches the full set for admins and replaces the list', async () => {
    mockFetch([eventFixtureUpcoming, draftUpcomingEvent])

    render(
      <UpcomingEventsList initialEvents={[eventFixtureUpcoming]} />
    )

    await waitFor(() => {
      expect(
        screen.getByText(draftUpcomingEvent.title)
      ).toBeInTheDocument()
    })
    expect(fetchedUrls()).toEqual([
      '/api/session',
      '/api/events/upcoming'
    ])
    expect(
      screen.getByText(eventFixtureUpcoming.title)
    ).toBeInTheDocument()
  })

  it('excludes the current event from initial and augmented data', async () => {
    mockFetch([eventFixtureUpcoming, draftUpcomingEvent])

    render(
      <UpcomingEventsList
        initialEvents={[eventFixtureUpcoming]}
        excludeId={eventFixtureUpcoming.id}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(draftUpcomingEvent.title)
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByText(eventFixtureUpcoming.title)
    ).not.toBeInTheDocument()
  })

  it('reveals a published-empty list once drafts arrive', async () => {
    mockFetch([draftUpcomingEvent])

    const { container } = render(
      <UpcomingEventsList
        initialEvents={[]}
        title='Upcoming Events'
      />
    )

    expect(container).toBeEmptyDOMElement()

    await waitFor(() => {
      expect(
        screen.getByText(draftUpcomingEvent.title)
      ).toBeInTheDocument()
    })
  })

  it('keeps the published list when the augment fetch fails', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(async (url: unknown) => {
        if (String(url).includes('/api/session')) {
          return {
            json: async () => ({ isAuthed: true })
          } as Response
        }
        throw new Error('network error')
      })

    render(
      <UpcomingEventsList initialEvents={[eventFixtureUpcoming]} />
    )

    await waitFor(() => {
      expect(fetchedUrls()).toContain('/api/events/upcoming')
    })
    expect(
      screen.getByText(eventFixtureUpcoming.title)
    ).toBeInTheDocument()
  })
})
