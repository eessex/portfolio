import {
  fromExtendedJson,
  htmlToText,
  inferLinkType,
  mapEditionFormat,
  normalizeAliases,
  normalizeVenueLocations,
  parseIframeSrc,
  parseMongoExport,
  toDefaultProject,
  toEvent,
  toRelease,
  toSettings,
  toVenue
} from './transforms'

// from the old repo's portfolio/src/client/tests/fixtures/*.ts
const bandcampIframe =
  '<iframe style="border: 0; width: 100%; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/album=1756541255/size=large/bgcol=ffffff/linkcol=333333/tracklist=false/artwork=small/transparent=true/" seamless><a href="http://das-audit.bandcamp.com/album/pioneer-works">Pioneer Works by Das Audit</a></iframe>'
const youtubeIframe =
  '<iframe width="560" height="315" src="https://www.youtube.com/embed/ekRYnh-Hhq0?rel=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
const soundcloudIframe =
  '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/136440153&color=%23efefef&auto_play=false"></iframe>'
const vimeoEmbed =
  '<div style="padding:75% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/68556248?color=ffffff&title=0" style="position:absolute;" frameborder="0" allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>'

const upcomingEvent = {
  _id: '5a0a60d48dcb886c6a1ab1df',
  published: true,
  start_date: '2017-12-06T00:00:00.000Z',
  links: [
    {
      title: 'Facebook Event',
      url: 'https://www.facebook.com/events/1505422539549739/'
    }
  ],
  images: [
    {
      caption: '<p>A caption for an upcoming event</p>',
      url: 'https://eve-portfolio.s3.amazonaws.com/20170117-cixous72-eve-essex-honeys.jpg'
    }
  ],
  end_date: null,
  all_day: false,
  title: 'Eve Essex, Kate Monhanty, Ben Jaffe',
  slug: 'eve-essex-kate-monhanty-ben-jaffe',
  venue: {
    country: '',
    state: 'NY',
    city: 'Ridgewood',
    address: '1290 Wyckoff Ave',
    name: 'Holo'
  },
  description: '<p>Three solo saxophone sets.</p>'
}

const unpublishedRelease = {
  _id: '5a496f9c688c1114024b497c',
  links: [],
  images: [
    {
      url: 'https://eve-portfolio.s3.amazonaws.com/2016-Das-Audit-pioneer-works.jpg'
    }
  ],
  published: false,
  artist: 'Das Audit',
  title: 'Pioneer Works (live)',
  description:
    '<p>John Anderson, percussion<br/>Eve Essex, saxophone, flute</p><p>Featuring guest vocalist Malcolm Mooney on &#x27;Phase Interference&#x27;</p>',
  embed_codes: [bandcampIframe],
  formats: [
    {
      format: 'Cassette',
      release_year: 2016,
      _id: '5a4ae24301097b1e69f865e9',
      featuring: false,
      compilation: false
    }
  ],
  project_ids: ['5a0673b00d5cea5c9e6e5d80'],
  slug: 'das-audit-pioneer-works-live'
}

describe('fromExtendedJson', () => {
  it('unwraps ids, dates and numbers', () => {
    expect(
      fromExtendedJson({
        _id: { $oid: 'abc' },
        at: { $date: '2017-11-11T18:27:55.029Z' },
        canonical: { $date: { $numberLong: '0' } },
        list: [{ n: { $numberInt: '3' } }]
      })
    ).toEqual({
      _id: 'abc',
      at: '2017-11-11T18:27:55.029Z',
      canonical: '1970-01-01T00:00:00.000Z',
      list: [{ n: 3 }]
    })
  })

  it('reads a --jsonArray export and a line-per-document one', () => {
    const doc = { _id: { $oid: 'a' }, title: 'x' }
    expect(parseMongoExport(JSON.stringify([doc]))).toEqual([
      { _id: 'a', title: 'x' }
    ])
    expect(
      parseMongoExport(
        `${JSON.stringify(doc)}\n${JSON.stringify(doc)}\n`
      )
    ).toHaveLength(2)
  })
})

describe('htmlToText', () => {
  it('turns paragraphs into blank lines and <br> into newlines', () => {
    expect(
      htmlToText(
        '<p>John Anderson, percussion<br/>Eve Essex, saxophone</p><p>1. Square Pipe<br>2. Picture</p>'
      ).text
    ).toBe(
      'John Anderson, percussion\nEve Essex, saxophone\n\n1. Square Pipe\n2. Picture'
    )
  })

  it('decodes entities and drops control characters', () => {
    expect(
      htmlToText(
        '<p>Gretta Johnson and Andy Cahill&#x27;s &quot;show&quot; &amp; more&nbsp;here \u0003unreleased</p>'
      ).text
    ).toBe(
      'Gretta Johnson and Andy Cahill\'s "show" & more here unreleased'
    )
  })

  it('strips formatting and names what it dropped', () => {
    const { text, droppedTags } = htmlToText(
      '<p>A duo of <strong>Eve Essex</strong> and <em>Craig</em>.</p>'
    )
    expect(text).toBe('A duo of Eve Essex and Craig.')
    expect(droppedTags).toEqual(['em', 'strong'])
  })

  it('keeps link words in the text and returns the links', () => {
    const { text, links, droppedTags } = htmlToText(
      '<p>Out now on <a href="https://soaplibrary.bandcamp.com/album/here-appear?a=1&amp;b=2">Soap <em>Library</em></a>.</p>'
    )
    expect(text).toBe('Out now on Soap Library.')
    expect(links).toEqual([
      {
        url: 'https://soaplibrary.bandcamp.com/album/here-appear?a=1&b=2',
        title: 'Soap Library',
        isFromDescription: true
      }
    ])
    expect(droppedTags).toEqual(['em'])
  })

  it('collapses runs of spaces and blank lines', () => {
    expect(
      htmlToText('<p>their  installations</p><p></p><p>b</p>').text
    ).toBe('their installations\n\nb')
  })

  it('returns empty text for nothing', () => {
    expect(htmlToText(undefined).text).toBe('')
    expect(htmlToText('').text).toBe('')
  })
})

describe('parseIframeSrc', () => {
  it.each([
    [
      bandcampIframe,
      'https://bandcamp.com/EmbeddedPlayer/album=1756541255/size=large/bgcol=ffffff/linkcol=333333/tracklist=false/artwork=small/transparent=true/'
    ],
    [
      youtubeIframe,
      'https://www.youtube.com/embed/ekRYnh-Hhq0?rel=0&showinfo=0'
    ],
    [
      soundcloudIframe,
      'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/136440153&color=%23efefef&auto_play=false'
    ],
    [
      vimeoEmbed,
      'https://player.vimeo.com/video/68556248?color=ffffff&title=0'
    ],
    [
      "<iframe src='//player.vimeo.com/video/1'></iframe>",
      'https://player.vimeo.com/video/1'
    ]
  ])('reads the src of %#', (html, src) => {
    expect(parseIframeSrc(html)).toBe(src)
  })

  it('is undefined without an iframe src', () => {
    expect(parseIframeSrc('<div>no embed</div>')).toBeUndefined()
    expect(
      parseIframeSrc('<iframe width="1"></iframe>')
    ).toBeUndefined()
    expect(parseIframeSrc(undefined)).toBeUndefined()
  })
})

describe('mapEditionFormat', () => {
  it.each([
    ['2xLP', '2xLP'],
    ['lp', 'LP'],
    ['2 x LP', '2xLP'],
    ['Double LP', '2xLP'],
    ['12"', 'LP'],
    ['12”', 'LP'],
    ['Vinyl', 'LP'],
    [' Cassette ', 'Cassette'],
    ['tape', 'Cassette'],
    ['CD', 'CD'],
    ['2xCD', '2xCD'],
    ['Double CD', '2xCD'],
    ['Digital download', 'Digital'],
    ['iOS app', 'iOSApp']
  ])('maps %s to %s', (format, expected) => {
    expect(mapEditionFormat(format)).toBe(expected)
  })

  it.each(['7"', 'Box set', '', undefined])(
    'leaves %s unmapped',
    (format) => {
      expect(mapEditionFormat(format)).toBeUndefined()
    }
  )
})

describe('inferLinkType', () => {
  it('tags purchase titles, then streaming hosts', () => {
    expect(
      inferLinkType('Buy on Bandcamp', 'https://x.bandcamp.com')
    ).toBe('buyLink')
    expect(
      inferLinkType('Pre-order', 'https://open.spotify.com/a')
    ).toBe('buyLink')
    expect(
      inferLinkType('Listen', 'https://open.spotify.com/a')
    ).toBe('streamLink')
    expect(
      inferLinkType(undefined, 'https://music.apple.com/a')
    ).toBe('streamLink')
    expect(
      inferLinkType('PAN Bandcamp', 'https://p-a-n.bandcamp.com')
    ).toBeUndefined()
    expect(
      inferLinkType('Video', 'https://www.youtube.com/watch?v=1')
    ).toBeUndefined()
  })
})

describe('toVenue', () => {
  it('normalizes a venue and picks its timezone', () => {
    const { venue, issues } = toVenue(upcomingEvent.venue)
    expect(venue).toEqual({
      name: 'Holo',
      address: '1290 Wyckoff Ave',
      city: 'Ridgewood',
      state: 'NY',
      country: undefined,
      timezone: 'America/New_York',
      isTimezoneGuessed: false,
      nameKey: 'holo',
      locationKey: 'ridgewood|1290 wyckoff ave',
      key: 'holo|ridgewood|1290 wyckoff ave'
    })
    expect(issues).toEqual([])
  })

  it('gives one location the same key however its address is spelled', () => {
    const a = toVenue({
      name: 'Safe Gallery',
      city: 'Brooklyn',
      address: '1004 Metropolitan Ave.'
    })
    const b = toVenue({
      name: 'SAFE gallery',
      city: 'brooklyn',
      address: '1004 Metropolitan Avenue'
    })
    expect(a.venue!.key).toBe(b.venue!.key)
  })

  it('puts every location of a venue at its set address', () => {
    const aliases = normalizeAliases({ 'Trans Pecos': 'Trans Pecos' })
    const locations = normalizeVenueLocations({
      'Trans Pecos': {
        address: '915 Wyckoff Ave',
        city: 'Ridgewood',
        state: 'NY'
      }
    })
    const keys = [
      {
        name: 'Trans Pecos',
        city: 'Queens',
        address: '815 Wyckoff Ave'
      },
      {
        name: 'trans pecos',
        city: 'Brooklyn',
        address: '915 Wyckoff Ave.'
      }
    ].map((v) => toVenue(v, aliases, locations).venue!)
    expect(keys[0]).toMatchObject({
      name: 'Trans Pecos',
      address: '915 Wyckoff Ave',
      city: 'Ridgewood',
      state: 'NY'
    })
    expect(keys[1].key).toBe(keys[0].key)
  })

  it('matches names with or without an apostrophe', () => {
    expect(
      toVenue({ name: "Honey's", city: 'Brooklyn' }).venue!.nameKey
    ).toBe(
      toVenue({ name: 'Honeys', city: 'Brooklyn' }).venue!.nameKey
    )
  })

  it('resolves aliases to the canonical name', () => {
    const { venue } = toVenue(
      { name: 'ISSUE Project Room, Brooklyn', city: 'Brooklyn' },
      normalizeAliases({
        'Issue project room, brooklyn': 'ISSUE Project Room'
      })
    )
    expect(venue!.name).toBe('ISSUE Project Room')
    expect(venue!.nameKey).toBe('issue project room')
  })

  it('times a US venue by its state before its city', () => {
    const portland = (state?: string) =>
      toVenue({ city: 'Portland', state }).venue!
    expect(portland('ME').timezone).toBe('America/New_York')
    expect(portland('ME').isTimezoneGuessed).toBe(false)
    expect(portland('OR').timezone).toBe('America/Los_Angeles')
    expect(portland().timezone).toBe('America/Los_Angeles')
    expect(
      toVenue({
        city: 'Catskill',
        state: 'NY',
        country: '29 Church St'
      }).venue!
    ).toMatchObject({
      timezone: 'America/New_York',
      isTimezoneGuessed: false
    })
    expect(
      toVenue({ city: 'Washington D.C.' }).venue!.isTimezoneGuessed
    ).toBe(false)
    // a state only counts in the US
    expect(
      toVenue({ city: 'Berlin', state: 'CA', country: 'Germany' })
        .venue!.timezone
    ).toBe('Europe/Berlin')
  })

  it('times a venue by state, then city, then country', () => {
    expect(toVenue({ city: 'Berlin' }).venue!.timezone).toBe(
      'Europe/Berlin'
    )
    expect(toVenue({ city: 'Hobart' }).venue!.timezone).toBe(
      'Australia/Sydney'
    )
    expect(toVenue({ city: 'Lima' }).venue!.timezone).toBe(
      'America/Bogota'
    )
    expect(
      toVenue({ city: 'Hudson', state: 'NY' }).venue!.timezone
    ).toBe('America/New_York')
    expect(
      toVenue({ city: 'Ojai', state: 'CA' }).venue!.timezone
    ).toBe('America/Los_Angeles')
    expect(
      toVenue({ city: 'Lyon', country: 'France' }).venue!.timezone
    ).toBe('Europe/Paris')
  })

  it('defaults an unknown city and warns', () => {
    const { venue, issues } = toVenue({
      name: 'Hall',
      city: 'Nowhere'
    })
    expect(venue!.timezone).toBe('America/New_York')
    expect(venue!.isTimezoneGuessed).toBe(true)
    expect(issues).toEqual([
      expect.objectContaining({ level: 'warn' })
    ])
  })

  it('fails a venue with no city', () => {
    const { venue, issues } = toVenue({ name: 'Holo', city: '' })
    expect(venue).toBeUndefined()
    expect(issues).toEqual([
      expect.objectContaining({
        level: 'fail',
        message: expect.stringContaining('no city')
      })
    ])
  })
})

describe('toEvent', () => {
  it('maps an event and its embedded items', () => {
    // as mongoexport writes it
    const exported = {
      ...upcomingEvent,
      _id: { $oid: upcomingEvent._id },
      start_date: { $date: upcomingEvent.start_date }
    }
    const doc = parseMongoExport(JSON.stringify([exported]))[0]
    const event = toEvent(doc)
    expect(event).toMatchObject({
      mongoId: '5a0a60d48dcb886c6a1ab1df',
      title: 'Eve Essex, Kate Monhanty, Ben Jaffe',
      slug: 'eve-essex-kate-monhanty-ben-jaffe',
      description: 'Three solo saxophone sets.',
      isPublished: true,
      startTime: new Date('2017-12-06T00:00:00.000Z'),
      endTime: undefined,
      mongoProjectIds: [],
      venue: { name: 'Holo', city: 'Ridgewood' },
      images: [
        {
          url: 'https://eve-portfolio.s3.amazonaws.com/20170117-cixous72-eve-essex-honeys.jpg',
          caption: 'A caption for an upcoming event',
          type: 'flyer'
        }
      ],
      links: [
        {
          title: 'Facebook Event',
          url: 'https://www.facebook.com/events/1505422539549739/'
        }
      ],
      embeds: [],
      issues: [],
      lossy: []
    })
  })

  it('reads a caption kept in an image title', () => {
    const event = toEvent({
      ...upcomingEvent,
      images: [
        {
          title: '<p>A caption for a past event</p>',
          url: 'https://b.s3.amazonaws.com/eve-poster.jpg'
        }
      ]
    })
    expect(event.images[0].caption).toBe('A caption for a past event')
  })

  it('appends description links after its own, once each', () => {
    const event = toEvent({
      ...upcomingEvent,
      description:
        '<p>Tickets <a href="https://tickets.example.com/x">here</a> and <a href="https://www.facebook.com/events/1505422539549739/">FB</a></p>'
    })
    expect(event.links.map((l) => l.url)).toEqual([
      'https://www.facebook.com/events/1505422539549739/',
      'https://tickets.example.com/x'
    ])
    expect(event.lossy).toEqual([
      'description: 2 link(s) also added as link entries'
    ])
  })

  it('upgrades http links to https and notes it', () => {
    const event = toEvent({
      ...upcomingEvent,
      links: [{ title: 'Site', url: 'http://essex-olivares.com/' }],
      description:
        '<p><a href="HTTP://tonyconrad.memorial">TC</a></p>'
    })
    expect(event.links.map((l) => l.url)).toEqual([
      'https://essex-olivares.com/',
      'https://tonyconrad.memorial'
    ])
    expect(event.issues).toEqual([])
    expect(event.lossy).toEqual(
      expect.arrayContaining([
        'link http://essex-olivares.com/: upgraded to https',
        'link HTTP://tonyconrad.memorial: upgraded to https'
      ])
    )
  })

  it('skips a link over 255 characters', () => {
    const url = `https://dice.fm/event/x?${'a'.repeat(260)}`
    const event = toEvent({ ...upcomingEvent, links: [{ url }] })
    expect(event.links).toEqual([])
    expect(event.issues).toEqual([
      expect.objectContaining({
        level: 'skip',
        message: expect.stringContaining('over 255 characters')
      })
    ])
  })

  it('reads an older single project_id', () => {
    const doc = parseMongoExport(
      JSON.stringify([
        {
          ...upcomingEvent,
          project_ids: [],
          project_id: { $oid: '5a0a80bb8dcb886c6a1ab1e1' }
        }
      ])
    )[0]
    expect(toEvent(doc).mongoProjectIds).toEqual([
      '5a0a80bb8dcb886c6a1ab1e1'
    ])
  })

  it('keeps only the first project and warns', () => {
    const event = toEvent({
      ...upcomingEvent,
      project_ids: ['a', 'b']
    })
    expect(event.mongoProjectIds).toEqual(['a', 'b'])
    expect(event.issues).toEqual([
      { level: 'warn', message: '2 projects; only the first is kept' }
    ])
  })

  it('fails an event with no start date or no venue city', () => {
    const event = toEvent({
      ...upcomingEvent,
      start_date: undefined,
      venue: { name: 'Holo' }
    })
    expect(event.issues.map((i) => i.level)).toEqual(['fail', 'fail'])
  })

  it('fails a description over 5,000 characters, printing it whole', () => {
    const long = 'a'.repeat(5001)
    const event = toEvent({
      ...upcomingEvent,
      description: `<p>${long}</p>`
    })
    expect(event.issues).toEqual([
      expect.objectContaining({
        level: 'fail',
        message: expect.stringContaining(long)
      })
    ])
  })

  it('parses the embed codes in order', () => {
    const event = toEvent({
      ...upcomingEvent,
      embed_codes: [
        soundcloudIframe,
        youtubeIframe,
        vimeoEmbed,
        '<p>x</p>'
      ]
    })
    expect(event.embeds.map((e) => [e.host, e.type])).toEqual([
      ['soundcloud', 'audio'],
      ['youtube', 'video'],
      ['vimeo', 'video']
    ])
    expect(event.issues).toEqual([
      { level: 'skip', message: 'embed code: no iframe src' }
    ])
  })
})

describe('toRelease', () => {
  it('maps a release with its editions', () => {
    const release = toRelease(unpublishedRelease)
    expect(release).toMatchObject({
      mongoId: '5a496f9c688c1114024b497c',
      title: 'Pioneer Works (live)',
      artist: 'Das Audit',
      type: 'album',
      isPublished: false,
      description:
        "John Anderson, percussion\nEve Essex, saxophone, flute\n\nFeaturing guest vocalist Malcolm Mooney on 'Phase Interference'",
      mongoProjectIds: ['5a0673b00d5cea5c9e6e5d80'],
      editions: [{ format: 'Cassette', publishDate: '2016-01-01' }],
      releaseDate: '2016-01-01',
      embeds: [{ host: 'bandcamp', type: 'audio' }],
      issues: []
    })
    expect(release.images[0].type).toBeUndefined()
  })

  it('dates the release by its earliest edition', () => {
    const release = toRelease({
      ...unpublishedRelease,
      formats: [
        {
          format: 'LP',
          release_year: 2018,
          publisher: 'Sky Walking'
        },
        {
          format: 'Cassette',
          release_year: 2017,
          publisher: 'Soap Library'
        }
      ]
    })
    expect(release.releaseDate).toBe('2017-01-01')
    expect(release.editions.map((e) => e.publisherName)).toEqual([
      'Sky Walking',
      'Soap Library'
    ])
  })

  it('types featured and compilation releases', () => {
    const typeOf = (flags: Record<string, boolean>) =>
      toRelease({
        ...unpublishedRelease,
        formats: [{ format: 'LP', release_year: 2018, ...flags }]
      }).type
    expect(typeOf({ featuring: true })).toBe('feature')
    expect(typeOf({ compilation: true })).toBe('compilation')
    expect(typeOf({ featuring: false, compilation: false })).toBe(
      'album'
    )
  })

  it('takes a full release_date over the year', () => {
    const release = toRelease({
      ...unpublishedRelease,
      formats: [{ format: 'LP', release_date: '2019-07-30' }]
    })
    expect(release.issues).toEqual([])
    expect(release.editions[0].publishDate).toBe('2019-07-30')
  })

  it('renames publishers through the aliases', () => {
    const release = toRelease(
      {
        ...unpublishedRelease,
        formats: [
          { format: 'LP', release_year: 2018, publisher: 'Braille' },
          { format: 'CD', release_year: 2018, publisher: 'Zoar' }
        ]
      },
      normalizeAliases({ braille: 'Braille Records' })
    )
    expect(release.editions.map((e) => e.publisherName)).toEqual([
      'Braille Records',
      'Zoar'
    ])
  })

  it('fails on an unmapped format or a missing year', () => {
    const release = toRelease({
      ...unpublishedRelease,
      formats: [
        { format: '7"', release_year: 2016 },
        { format: 'LP' }
      ]
    })
    expect(release.issues).toEqual([
      { level: 'fail', message: 'unmapped edition format "7""' },
      { level: 'fail', message: 'edition "LP" has no release_year' }
    ])
  })

  it('fails with no formats', () => {
    expect(
      toRelease({ ...unpublishedRelease, formats: [] }).issues[0]
        .level
    ).toBe('fail')
  })
})

describe('toDefaultProject', () => {
  it('makes the info page the default project, and nothing else', () => {
    expect(
      toDefaultProject({ _id: 'p', slug: 'info', title: 'Info' })
    ).toMatchObject({ isDefaultProject: true, slug: 'info' })
    expect(
      toDefaultProject({ _id: 'h', slug: 'home', title: 'Home' })
    ).toBeUndefined()
  })
})

describe('toSettings', () => {
  it('builds social links as the old footer did', () => {
    const settings = toSettings({
      _id: '5999f935bc41cbb936d7ec7a',
      title: 'Eve Essex',
      social: [
        { service: 'twitter', profile: 'cher' },
        { service: 'bandcamp', profile: 'eveessex' },
        { service: 'instagram', profile: '' }
      ],
      meta: {
        description: 'A Brooklyn-based musician.',
        image:
          'https://eve-portfolio.s3.amazonaws.com/EveEssex_byLenaShkoda_web.png'
      }
    })
    expect(settings).toEqual({
      mongoId: '5999f935bc41cbb936d7ec7a',
      title: 'Eve Essex',
      description: 'A Brooklyn-based musician.',
      coverImage: {
        url: 'https://eve-portfolio.s3.amazonaws.com/EveEssex_byLenaShkoda_web.png'
      },
      socialLinks: [
        {
          title: 'Twitter',
          url: 'https://twitter.com/cher',
          type: 'social'
        },
        {
          title: 'Bandcamp',
          url: 'https://eveessex.bandcamp.com/',
          type: 'social'
        }
      ],
      issues: []
    })
  })
})
