import { emptySnapshot, Planner, Report, toVenueRow } from './plan'
import { toVenue } from './transforms'

function plannerWith(
  snapshot: Partial<ReturnType<typeof emptySnapshot>> = {}
) {
  const report = new Report()
  const planner = new Planner(
    { ...emptySnapshot(), isEmpty: false, ...snapshot },
    report,
    true
  )
  return { planner, report }
}

function venueRow(
  id: string,
  fields: { name?: string; city: string; address?: string }
) {
  return toVenueRow({
    id,
    name: fields.name ?? null,
    city: fields.city,
    address: fields.address ?? null,
    primary_venue_id: null
  })
}

const HOLO_ID = '11111111-1111-4111-8111-111111111111'

const draft = (venue: Record<string, string>) => toVenue(venue).venue!

describe('Planner.venue', () => {
  it('adds a new address as another location of the same name', () => {
    const { planner, report } = plannerWith({
      venues: [
        venueRow(HOLO_ID, {
          name: 'Holo',
          city: 'Ridgewood',
          address: '1090 Wyckoff Ave'
        })
      ]
    })
    const id = planner.venue(
      draft({
        name: 'HOLO',
        city: 'Ridgewood',
        address: '1290 Wyckoff Ave'
      }),
      'event'
    )
    expect(id).not.toBe(HOLO_ID)
    expect(planner.plan.venues[0].row).toMatchObject({
      name: 'Holo',
      primaryVenueId: HOLO_ID
    })
    expect(
      report.lines.get('New locations for existing venue names')
    ).toHaveLength(1)
  })

  it('reuses a named venue when either side has no address', () => {
    const { planner } = plannerWith({
      venues: [venueRow(HOLO_ID, { name: 'Holo', city: 'Ridgewood' })]
    })
    expect(
      planner.venue(
        draft({
          name: 'Holo',
          city: 'Ridgewood',
          address: '1 Main St'
        }),
        'event'
      )
    ).toBe(HOLO_ID)
  })

  it("never makes an unnamed venue another's location", () => {
    const { planner, report } = plannerWith({
      venues: [venueRow('chicago', { city: 'Chicago' })]
    })
    planner.venue(draft({ city: 'Berlin' }), 'event')
    expect(planner.plan.venues[0].row.primaryVenueId).toBeUndefined()
    expect(report.lines.get('Venues to create')).toHaveLength(1)
    expect(
      report.lines.get('New locations for existing venue names')
    ).toBeUndefined()
  })

  it('matches an unnamed venue only at the same address', () => {
    const { planner } = plannerWith({
      venues: [venueRow('somewhere', { city: 'Brooklyn' })]
    })
    expect(
      planner.venue(
        draft({ city: 'Brooklyn', address: '1 Main St' }),
        'event'
      )
    ).not.toBe('somewhere')
    expect(planner.venue(draft({ city: 'brooklyn' }), 'event')).toBe(
      'somewhere'
    )
  })
})

describe('Planner.link', () => {
  const url = 'https://eveessex.bandcamp.com/'

  it('keeps a social link apart from a page link with its url', () => {
    const { planner } = plannerWith({
      linksByUrl: new Map([[url, 'release-link']])
    })
    expect(planner.link({ url, title: 'Bandcamp' }, 'release')).toBe(
      'release-link'
    )
    const socialId = planner.link(
      { url, title: 'Bandcamp', type: 'social' },
      'settings'
    )
    expect(socialId).not.toBe('release-link')
    expect(planner.plan.links).toEqual([
      {
        id: socialId,
        row: { url, title: 'Bandcamp', type: 'social' }
      }
    ])
    // the same social url again is the same row
    expect(
      planner.link(
        { url, title: 'Bandcamp', type: 'social' },
        'settings'
      )
    ).toBe(socialId)
  })

  it('reuses an existing social link', () => {
    const { planner } = plannerWith({
      socialLinksByUrl: new Map([[url, 'footer-link']])
    })
    expect(
      planner.link(
        { url, title: 'Bandcamp', type: 'social' },
        'settings'
      )
    ).toBe('footer-link')
  })

  it('skips a social link with no name', () => {
    const { planner, report } = plannerWith()
    expect(
      planner.link({ url, type: 'social' }, 'settings')
    ).toBeUndefined()
    expect(report.lines.get('Skipped')).toHaveLength(1)
  })
})
