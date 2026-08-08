import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import type { DashboardEmbedCode } from '@/lib/embed-codes/schemas/client'
import {
  EmbedCodeContentTypes,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import {
  eventFixturePast,
  eventFixtureUpcoming
} from '@/lib/events/fixtures'
import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import {
  publisherFixtureAlpha,
  publisherFixtureBeta,
  publisherFixtureGamma
} from '@/lib/publishers/fixtures'
import type { DashboardPublisher } from '@/lib/publishers/schemas/client'
import { EmbeddedItemTypes, PagePaths } from '@/lib/schemas'
import type { ResponseWithCursor } from '@/lib/util'
import { formattedEmbedCodeTitle } from '@/ui/embed-codes/embed-code-details'
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
      itemType={PagePaths.events}
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

describe('ItemsTable — embedded items (embed codes)', () => {
  const usedEmbedCode: DashboardEmbedCode = {
    ...embedCodeFixture,
    contentType: EmbedCodeContentTypes.official_music_video,
    eventSlugs: [],
    projectSlugs: [],
    releaseSlugs: ['some-release']
  }

  const unusedEmbedCode: DashboardEmbedCode = {
    ...embedCodeFixture,
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Unused embed',
    type: EmbedCodeTypes.audio,
    eventSlugs: [],
    projectSlugs: [],
    releaseSlugs: []
  }

  function makeEmbedCodeResponse(
    res: DashboardEmbedCode[],
    totalCount: number,
    nextCursor: string | null = null
  ): ResponseWithCursor<DashboardEmbedCode> {
    return { res, nextCursor, totalCount }
  }

  function rowFor(embedCode: DashboardEmbedCode) {
    return screen
      .getByText(formattedEmbedCodeTitle(embedCode))
      .closest('tr')!
  }

  function renderEmbedCodesTable(
    initialItems = makeEmbedCodeResponse(
      [usedEmbedCode, unusedEmbedCode],
      2
    )
  ) {
    return render(
      <ItemsTable
        itemType={EmbeddedItemTypes.embedCodes}
        initialItems={initialItems}
      />
    )
  }

  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
    resetIsAdminCache()
    mockFetch(makeEmbedCodeResponse([], 0), false)
  })

  it('renders the host inline with the title, and caption below, without a row link', () => {
    renderEmbedCodesTable()

    // host special-cased to "YouTube" for video/youtube embeds
    expect(
      screen.getByText('YouTube: Test Embed Code')
    ).toBeInTheDocument()
    expect(
      within(rowFor(usedEmbedCode)).getByText(usedEmbedCode.caption!)
    ).toBeInTheDocument()
  })

  it('does not render a draft badge', () => {
    renderEmbedCodesTable()

    expect(screen.queryByText(/unpublished/i)).not.toBeInTheDocument()
  })

  it('renders type/contentType details', () => {
    renderEmbedCodesTable()

    const row = rowFor(usedEmbedCode)
    expect(within(row).getByText('Video')).toBeInTheDocument()
    expect(
      within(row).getByText('Official Music Video')
    ).toBeInTheDocument()
  })

  it('renders "used on" / "unused" based on relation slugs', () => {
    renderEmbedCodesTable()

    expect(
      within(rowFor(usedEmbedCode)).getByText(/used on 1 page/i)
    ).toBeInTheDocument()
    expect(
      within(rowFor(unusedEmbedCode)).getByText('unused')
    ).toBeInTheDocument()
  })

  it('does not render an iframe preview', () => {
    const { container } = renderEmbedCodesTable()

    expect(container.querySelector('iframe')).not.toBeInTheDocument()
  })

  it('shows the audio icon only for audio embed codes', () => {
    const { container } = renderEmbedCodesTable()

    expect(
      within(rowFor(unusedEmbedCode)).getByLabelText('Contains audio')
    ).toBeInTheDocument()
    expect(
      container.querySelectorAll('svg[aria-label="Contains audio"]')
    ).toHaveLength(1)
  })

  it('derives /api/embed_codes from the itemType when apiEndpoint is not passed', async () => {
    renderEmbedCodesTable(
      makeEmbedCodeResponse(
        [usedEmbedCode, unusedEmbedCode],
        30,
        'cursor-1'
      )
    )

    fireEvent.change(
      screen.getByRole('searchbox', { name: /search/i }),
      { target: { value: 'sound' } }
    )

    await waitFor(() => {
      expect(
        fetchedUrls().some((url) => url.includes('/api/embed_codes'))
      ).toBe(true)
    })
  })

  describe('edit link (admin-only, no own page/slug)', () => {
    it('does not render for anonymous visitors', async () => {
      renderEmbedCodesTable()

      // let the (mocked, anonymous) session check resolve
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      expect(
        screen.queryByRole('link', { name: /edit/i })
      ).not.toBeInTheDocument()
    })

    it('renders one edit link per row for admins, pointing at the dashboard edit page', async () => {
      mockFetch(
        makeEmbedCodeResponse([usedEmbedCode, unusedEmbedCode], 2),
        true
      )

      renderEmbedCodesTable()

      const editLinks = await screen.findAllByRole('link', {
        name: /edit/i
      })
      expect(editLinks).toHaveLength(2)
      expect(
        within(rowFor(usedEmbedCode)).getByRole('link', {
          name: /edit/i
        })
      ).toHaveAttribute(
        'href',
        `/dashboard/embed_codes/${usedEmbedCode.id}/edit`
      )
    })

    it('does not render for page items (events/releases/projects), even for admins', () => {
      mockFetch(authedResponse)

      renderEventsTable()

      expect(
        screen.queryByRole('link', { name: /edit/i })
      ).not.toBeInTheDocument()
    })
  })
})

describe('ItemsTable — embedded items (publishers)', () => {
  const usedPublisher: DashboardPublisher = {
    ...publisherFixtureAlpha,
    eventSlugs: [],
    projectSlugs: [],
    releaseSlugs: ['some-release']
  }

  const unusedPublisher: DashboardPublisher = {
    ...publisherFixtureBeta,
    eventSlugs: [],
    projectSlugs: [],
    releaseSlugs: []
  }

  const museumPublisher: DashboardPublisher = {
    ...publisherFixtureGamma,
    type: 'museum',
    eventSlugs: [],
    projectSlugs: [],
    releaseSlugs: []
  }

  function makePublisherResponse(
    res: DashboardPublisher[],
    totalCount: number,
    nextCursor: string | null = null
  ): ResponseWithCursor<DashboardPublisher> {
    return { res, nextCursor, totalCount }
  }

  function rowFor(publisher: DashboardPublisher) {
    return screen.getByText(publisher.name).closest('tr')!
  }

  function renderPublishersTable(
    initialItems = makePublisherResponse(
      [usedPublisher, unusedPublisher],
      2
    )
  ) {
    return render(
      <ItemsTable
        itemType={EmbeddedItemTypes.publishers}
        initialItems={initialItems}
      />
    )
  }

  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
    resetIsAdminCache()
    mockFetch(makePublisherResponse([], 0), false)
  })

  it('renders the name as the title and the website below it', () => {
    renderPublishersTable()

    const row = rowFor(usedPublisher)
    expect(screen.getByText(usedPublisher.name)).toBeInTheDocument()
    expect(
      within(row).getByText('soaplibrary.example.com')
    ).toBeInTheDocument()
  })

  it('renders the type as a Details-column badge', () => {
    renderPublishersTable()

    expect(
      within(rowFor(usedPublisher)).getByText('Record Label')
    ).toBeInTheDocument()
  })

  it('gives each publisher type a distinct badge color', () => {
    renderPublishersTable(
      makePublisherResponse([usedPublisher, museumPublisher], 2)
    )

    const recordLabelBadge = within(rowFor(usedPublisher)).getByText(
      'Record Label'
    )
    const museumBadge = within(rowFor(museumPublisher)).getByText(
      'Museum'
    )
    expect(recordLabelBadge.className).not.toBe(museumBadge.className)
  })

  it('renders "used on" / "unused" based on relation slugs', () => {
    renderPublishersTable()

    expect(
      within(rowFor(usedPublisher)).getByText(/used on 1 page/i)
    ).toBeInTheDocument()
    expect(
      within(rowFor(unusedPublisher)).getByText('unused')
    ).toBeInTheDocument()
  })
})
