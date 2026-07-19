import { render, screen, waitFor } from '@testing-library/react'

import {
  eventFixturePast,
  eventFixtureUpcoming
} from '@/lib/events/fixtures'
import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { resetIsAdminCache } from '@/ui/useIsAdmin'

const draftEvent: EventClient = {
  ...eventFixturePast,
  id: '550e8400-e29b-41d4-a716-446655440009',
  slug: 'draft-event',
  title: 'Unpublished draft event'
}

const draftUpcomingEvent: EventClient = {
  ...eventFixtureUpcoming,
  id: '550e8400-e29b-41d4-a716-446655440010',
  slug: 'draft-upcoming-event',
  title: 'Unpublished upcoming draft'
}

function makeResponse(
  res: FetchEventsResult,
  totalCount: number,
  nextCursor: string | null = null
) {
  return { res, nextCursor, totalCount }
}

const publishedResponse = makeResponse(
  {
    upcomingEvents: [eventFixtureUpcoming],
    pastEvents: [eventFixturePast]
  },
  2
)

const authedResponse = makeResponse(
  {
    upcomingEvents: [eventFixtureUpcoming, draftUpcomingEvent],
    pastEvents: [eventFixturePast, draftEvent]
  },
  4
)

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

function renderEventsTable(
  props: Partial<{
    initialItems: ReturnType<typeof makeResponse>
    featuredKey: 'upcomingEvents'
    projectId: string
  }> = {}
) {
  const { initialItems = publishedResponse, ...rest } = props

  return render(
    <ItemsTable<EventClient, FetchEventsResult>
      path={PagePaths.events}
      initialItems={initialItems}
      {...rest}
    />
  )
}

describe('ItemsTable', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
    resetIsAdminCache()
  })

  it('renders initial items and only checks the session for anonymous visitors', async () => {
    mockFetch(authedResponse, false)

    renderEventsTable()

    expect(
      screen.getByText(eventFixturePast.title)
    ).toBeInTheDocument()
    expect(
      screen.getByText(eventFixtureUpcoming.title)
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    expect(fetchedUrls()).toEqual(['/api/session'])
    expect(
      screen.queryByText(draftEvent.title)
    ).not.toBeInTheDocument()
  })

  describe('draft augmentation', () => {
    it('refetches page 1 for admins and replaces items', async () => {
      mockFetch(authedResponse)

      renderEventsTable()

      expect(
        screen.getByText(eventFixturePast.title)
      ).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText(draftEvent.title)).toBeInTheDocument()
      })
      expect(fetchedUrls()).toEqual([
        '/api/session',
        expect.stringContaining('/api/events')
      ])
      expect(
        screen.getByText(eventFixturePast.title)
      ).toBeInTheDocument()
    })

    it('scopes the refetch to a project when projectId is set', async () => {
      mockFetch(authedResponse)

      renderEventsTable({ projectId: 'proj-1' })

      await waitFor(() => {
        expect(screen.getByText(draftEvent.title)).toBeInTheDocument()
      })
      expect(fetchedUrls()).toEqual([
        '/api/session',
        expect.stringContaining('projectId=proj-1')
      ])
    })

    it('reveals a published-empty list once drafts arrive', async () => {
      mockFetch(
        makeResponse(
          { upcomingEvents: [], pastEvents: [draftEvent] },
          1
        )
      )

      const { container } = renderEventsTable({
        initialItems: makeResponse(
          { upcomingEvents: [], pastEvents: [] },
          0
        )
      })

      expect(container).toBeEmptyDOMElement()

      await waitFor(() => {
        expect(screen.getByText(draftEvent.title)).toBeInTheDocument()
      })
    })
  })

  describe('featuredKey', () => {
    it('renders the group as a featured list, not a table section', () => {
      mockFetch(authedResponse, false)

      renderEventsTable({ featuredKey: 'upcomingEvents' })

      // one featured-list occurrence, no duplicate table section
      expect(
        screen.getAllByText(eventFixtureUpcoming.title)
      ).toHaveLength(1)
      expect(
        screen.getByRole('heading', { name: /upcoming events/i })
      ).toBeInTheDocument()
      expect(
        screen.getByText(eventFixturePast.title)
      ).toBeInTheDocument()
    })

    it('updates the featured list from augmented data', async () => {
      mockFetch(authedResponse)

      renderEventsTable({ featuredKey: 'upcomingEvents' })

      await waitFor(() => {
        expect(
          screen.getByText(draftUpcomingEvent.title)
        ).toBeInTheDocument()
      })
      expect(
        screen.getAllByText(draftUpcomingEvent.title)
      ).toHaveLength(1)
    })
  })
})
