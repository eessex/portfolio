import { Venue, type Event } from '@/lib/definitions'

// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data
export const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User',
    email: 'user@nextmail.com',
    password: '123456',
  },
]

export const venues: Venue[] = [
  {
    name: 'Double Dutch',
    city: 'Brooklyn',
    state: 'NY',
    address: '667 Evergreen Ave'
  },
  {
    name: 'Umbra',
    city: 'Brooklyn',
    state: 'NY',
    address: '785 Hart St'
  },
  {
    name: 'Topos Too',
    city: 'Ridgewood',
    state: 'NY',
    address: '59-22 Myrtle Ave'
  },
  {
    name: 'Lost Bag',
    city: 'Providence',
    state: 'RI'
  }, {
    name: 'Avalon Lounge',
    address: '29 Church St',
    city: 'Catskill',
    state: 'NY',
  }, {
    name: 'Baba Yaga Gallery',
    city: 'Hudson',
    state: 'NY',
    address: '5821 NY-9G'
  },
  {
    name: 'No Place Gallery',
    address: '1 E Gay St',
    city: 'Columbus',
    state: 'OH',
  },
  {
    name: 'Rhizome',
    address: '6950 Maple St NW',
    city: 'Washington',
    state: 'DC',
  }, {
    name: 'No Place Gallery',
    address: '1 E Gay St',
    city: 'Columbus',
    state: 'OH',
  }, {
    name: 'The Green Room @ Crosstown Arts',
    address: '1350 Councourse Ave.',
    city: 'Memphis',
    state: 'TN',
  }, {
    name: 'Drkmttr',
    address: '1111 Dickerson Pike',
    city: 'Nashville',
    state: 'TN',
  }, {
    name: 'Pilot Light',
    address: '106 E Jackson Ave',
    city: 'Knoxville',
    state: 'TN',
  }, {
    name: "Dunlap's Corner Bar",
    address: '3258 W 32nd St.',
    city: 'Cleveland',
    state: 'OH',
  }, {
    name: 'Unnameable Books',
    address: '615 Vanderbilt Ave.',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'Hart Bar',
    address: '538 Hart St.',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'Epsilon Spires',
    address: '190 Main St',
    city: 'Brattleboro',
    state: 'VT',
  }, {
    name: 'Grimm Ales',
    address: '990 Metropolitan Ave',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'MoMA PS1',
    city: 'Long Island City',
    address: '22-25 Jackson Ave',
    state: 'NY',
  }, {
    name: 'Dirty Dungarees',
    address: '2584 N High St',
    city: 'Columbus',
    state: 'OH',
  }, {
    name: 'Shift',
    address: '411 Kent Ave',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'Chaos Computer',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'Tibet House',
    address: '22 W 15th St.',
    city: 'NYC',
    state: 'NY',
  }, {
    name: 'Outpost Artist Resources',
    address: '1665 Norman St',
    city: 'Ridgewood',
    state: 'NY',
  }, {
    name: "St. Peter's Church",
    address: '346 W 20th St',
    city: 'NYC',
    state: 'NY',
  }, {
    name: 'KAJE',
    address: '74 15th St',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'Montez Press Radio',
    address: '46 Canal Street',
    city: 'NYC',
    state: 'NY',
  }, {
    name: 'IRL Gallery',
    address: '80 Franklin St.',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'Windjammer',
    address: '552 Grandview Ave',
    city: 'Ridgewoood',
    state: 'NY',
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '1114 Dekalb Ave',
    name: 'Flowers For All Occasions'
  }, {
    name: 'KAJE',
    address: '7 Herkimer Pl',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '119 Pierrepont St',
    name: 'ISSUE Project Room'
  }, {
    name: 'Et Al Gallery',
    address: '620 Kearny St.',
    city: 'San Francisco',
    state: 'CA',
  }, {
    state: 'NY',
    city: 'NYC',
    address: '217 E. Houston Street',
    name: 'Mercury Lounge'
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '93 Scott Ave',
    name: 'Honeys'
  }, {
    name: 'Ruba Club',
    address: '416 Green Street',
    city: 'Philadelphia',
    state: 'PA',
  }, {
    state: 'MD',
    city: 'Baltimore',
    name: 'Red Room',
    address: '425 E. 31st Street'
  }, {
    name: 'The Glove',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    state: 'OH',
    city: 'Columbus',
    address: '1164 S. Front St.',
    name: 'No Place Gallery'
  }, {
    name: 'Fridman Gallery',
    address: '169 Bowery',
    city: 'NYC',
    state: 'NY',
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '224 Greene Ave',
    name: 'e-flux Bar Laika'
  }, {
    name: 'Secret Project Robot',
    address: '1186 Broadway',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'Nha Minh',
    address: '485 Morgan Ave',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    state: 'NY',
    city: 'Ridgewood',
    address: '1090 Wyckoff Ave.',
    name: 'HOLO'
  }, {
    name: 'Bohemian Grove',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    state: 'NY',
    city: 'Brooklyn',
    name: 'National Sawdust',
    address: '80 N 6th St'
  }, {
    name: 'Doyers',
    city: 'NYC',
    state: 'NY',
  }, {
    country: 'Belgium',
    city: 'Eupen',
    address: 'Rotenbergplatz 19',
    name: 'Kulturzentrum Alter Schlachthof'
  }, {
    name: 'ACUD Macht Neu',
    address: 'Veteranenstraße 21',
    city: 'Berlin',
    country: 'Germany'
  }, {
    name: 'Honeys',
    address: '93 Scott Ave',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'Wonders of Nature',
    city: 'Brooklyn',
    state: 'NY',
    address: '131 Grand St'
  }, {
    name: 'Trans Pecos',
    address: '815 Wyckoff Ave',
    city: 'Ridgewood',
    state: 'NY',
  }, {
    name: 'ISSUE Project Room',
    address: '22 Boerum Place',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    name: 'Machines With Magnets',
    address: '400 Main St.',
    city: 'Pawtucket',
    state: 'RI',
  }, {
    name: 'Root Cellar',
    address: '10 Fiske Ave.',
    city: 'Greenfield',
    state: 'MA',
  }, {
    name: 'Wuthering Heights',
    city: 'Baltimore',
    state: 'MD',
  }, {
    name: 'Lacquer',
    city: 'Philadelphia',
    state: 'PA',
  }, {
    name: "Wendy's Subway",
    address: '379 Bushwick Ave',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '484 Union Ave',
    name: 'Union Pool'
  }, {
    name: 'Greene Naftali',
    address: '508 W 26th St.',
    city: 'NYC',
    state: 'NY',
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '469 President St.',
    name: 'Gowanus E-Waste Warehouse'
  }, {
    country: 'Germany',
    city: 'Berlin',
    address: '8 Grüntaler Straße',
    name: 'Studioacht'
  }, {
    country: 'Germany',
    city: 'Berlin',
    address: 'Skalitzer Str. 133',
    name: 'West Germany Venue'
  }, {
    state: 'NY',
    city: 'NYC',
    address: '158 Bleecker St.',
    name: 'Le Poisson Rouge'
  }, {
    state: 'NY',
    city: 'Maspeth',
    address: '52-19 Flushing Ave.',
    name: 'Knockdown Center'
  }, {
    state: 'NY',
    city: 'NYC',
    address: '172 Forsyth St.',
    name: 'Commend'
  }, {
    name: 'The Sump',
    address: '1563 Decatur St.',
    city: 'Ridgewood',
    state: 'NY',
  }, {
    state: 'NY',
    city: 'NYC',
    address: '15 Gramercy Park S.',
    name: 'National Arts Club'
  }, {
    state: 'NY',
    city: 'NYC',
    address: '83 Pitt St.'
  }, {
    state: 'RI',
    city: 'Providence',
    address: '25 Manton Ave.',
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '1031 Grand St',
    name: 'Sunnyvale'
  }, {
    state: 'NY',
    city: 'NYC',
    address: '55 Walker St.',
    name: 'Artists Space'
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '221 Nassau Ave.',
    name: 'Sunview Luncheonette'
  }, {
    state: 'NY',
    city: 'Long Island City',
    address: '44-19 Purves St',
    name: 'SculptureCenter'
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '29 Ash St.',
    name: 'U.S. Blues'
  }, {
    name: 'Character Projects',
    address: '6042 Monte Vista St',
    city: 'Los Angeles',
    state: 'CA',
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '1004 Metropolitan Ave.',
    name: 'Safe Gallery'
  }, {
    name: 'Signal',
    address: '260 Johnson Ave.',
    city: 'Brooklyn',
    state: 'NY',
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '159 Pioneer St.',
    name: 'Pioneer Works'
  }, {
    state: 'NY',
    city: 'Brooklyn',
    address: '146 Broadway',
    name: "Baby's All Right"
  }
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const events: Omit<Event, 'imageIds' | 'linkIds' | 'venueId'>[] = [
  {
    venue: {
      name: 'Rhizome',
      address: '6950 Maple St NW',
      city: 'Washington',
      state: 'DC',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '666cab41e0b607004737f51e',
    createdAt: '2024-06-14T20:42:41.324Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20240804-Rhizome-WashingtonDC.jpeg',
        aspect: 0.7500750075007501,
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://withfriends.co/event/20249435'
      }
    ],
    startDate: '2024-08-04T23:00:00.000Z',
    updatedAt: '2024-06-14T20:42:41.324Z',
    slug: 'eve-essex-animal-surrender-mary-regalado',
    title: 'Eve Essex / Animal, Surrender! / Mary Regalado'
  },
  {
    venue: {
      name: 'No Place Gallery',
      address: '1 E Gay St',
      city: 'Columbus',
      state: 'OH',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '666ca92ee0b607004737f516',
    createdAt: '2024-06-14T20:33:50.015Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/451854945_1466898100604181_3166833090969750086_n.jpg',
        aspect: 0.772399588053553,
        caption: 'Poster by Dang Olsen'
      }
    ],
    links: [
      {
        title: 'noplacegallery.com',
        url: 'https://noplacegallery.com'
      }
    ],
    startDate: '2024-08-03T00:00:00.000Z',
    updatedAt: '2024-06-14T20:33:50.015Z',
    slug: 'eve-essex-jacoti-sommes-dang-olsen',
    title: 'Eve Essex, Jacoti Sommes, Dang Olsen',
    description: 'Tickets at the door only.'
  },
  {
    venue: {
      name: 'The Green Room @ Crosstown Arts',
      address: '1350 Councourse Ave.',
      city: 'Memphis',
      state: 'TN',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '666ca9dee0b607004737f51c',
    createdAt: '2024-06-14T20:36:46.770Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20240726-GreenRoom-MemphisTN-SM.jpg',
        aspect: 0.8421052631578947
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://dice.fm/partner/dice/event/wwwwmv-eve-essex-and-general-labor-26th-jul-the-green-room-at-crosstown-arts-memphis-tickets?dice_id=3395450&dice_channel=web&dice_tags=organic&dice_campaign=DICE&dice_feature=mio_marketing&_branch_match_id=1287890556635031033&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXz8nMy9ZLyUxO1UvL1S8wtkhJMUpKNU9KMwMAXks%2BASEAAAA%3D'
      }
    ],
    startDate: '2024-07-26T23:00:00.000Z',
    updatedAt: '2024-06-14T20:36:46.770Z',
    slug: 'eve-essex-general-labor',
    title: 'Eve Essex, General Labor'
  },
  {
    venue: {
      name: 'Drkmttr',
      address: '1111 Dickerson Pike',
      city: 'Nashville',
      state: 'TN',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '664ac25975eb0e0047a72ae9',
    createdAt: '2024-05-20T03:24:09.116Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20240714-REVISED-EveEssex-BodyElectric-EveMared-DrkmttrNashville.jpg',
        aspect: 1,
        caption: 'Poster by JQM'
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://app.opendate.io/e/eve-essex-nyc-body-electric-eve-maret-july-14-2024-534092'
      }
    ],
    startDate: '2024-07-15T00:00:00.000Z',
    updatedAt: '2024-05-20T03:24:09.117Z',
    slug: 'eve-essex-body-electric-eve-maret',
    title: 'Eve Essex, Body Electric, Eve Maret'
  },
  {
    venue: {
      name: 'Pilot Light',
      address: '106 E Jackson Ave',
      city: 'Knoxville',
      state: 'TN',
      country: ''
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '666ca891e0b607004737f511',
    createdAt: '2024-06-14T20:31:13.003Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20240623-PilotLight-KnoxvilleTN.jpg',
        aspect: 1,
        caption: 'Poster by Justin Q Martin'
      }
    ],
    links: [
      {
        title: 'thepilotlight.com',
        url: 'https://thepilotlight.com'
      }
    ],
    startDate: '2024-06-24T00:00:00.000Z',
    updatedAt: '2024-06-14T20:31:13.003Z',
    slug: 'eve-essex-eve-maret-fire-fighter',
    title: 'Eve Essex, Eve Maret, Fire/Fighter'
  },
  {
    venue: {
      name: "Dunlap's Corner Bar",
      address: '3258 W 32nd St.',
      city: 'Cleveland',
      state: 'OH',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '6642dd365486660047d7088b',
    createdAt: '2024-05-14T03:40:38.365Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/cleveland_poster_color_flat2.JPG',
        aspect: 0.9853403141361257,
        caption: 'Poster by JQM'
      }
    ],
    links: [],
    startDate: '2024-05-31T00:00:00.000Z',
    updatedAt: '2024-05-14T03:40:38.366Z',
    slug: 'eve-essex-prostitutes-james-donadio-slugg-dj-clubby-the-disco-baller',
    title: 'Eve Essex, Prostitutes (James Donadio), Slugg, DJ Clubby The Disco Baller',
    description: 'Presented by Shed Projects'
  },
  {
    venue: {
      name: 'Unnameable Books',
      address: '615 Vanderbilt Ave.',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '660cc080602f8100474d0280',
    createdAt: '2024-04-03T02:35:44.844Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/IMG_7740.jpg',
        aspect: 0.765527950310559
      }
    ],
    links: [
      {
        title: 'PCRF',
        url: 'https://www.pcrf.net'
      }
    ],
    startDate: '2024-05-26T23:00:00.000Z',
    updatedAt: '2024-04-03T02:35:44.844Z',
    slug: 'rescheduled-eve-essex-sadie-powers-nat-homer-turin-mass-dj-winged-eros',
    title: 'Eve Essex, Sadie Powers, Nat Homer, Turin Mass, DJ Winged Eros',
    description: 'Outdoor show, benefits to The Palestine Children&#x27;s Relief Fund.'
  },
  {
    venue: {
      name: 'Hart Bar',
      address: '538 Hart St.',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '664173e215bdac00478cac2e',
    createdAt: '2024-05-13T01:58:58.977Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/9B9F4CAE-10FB-474D-87CF-7B7DE8799B53.JPG',
        aspect: 1.4148148148148147
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://www.eventbrite.com/e/ewa-awe-eve-essex-kyyberwall-ucc-harlo-bookworms-tickets-902750349597'
      }
    ],
    startDate: '2024-05-25T03:00:00.000Z',
    updatedAt: '2024-05-13T01:58:58.977Z',
    slug: 'eve-essex-ewa-awe-kyyberwal-bookworms-dj-ucc-harlo',
    title: 'Eve Essex, ewa awe, kyyberwal, bookworms, DJ UCC Harlo'
  },
  {
    venue: {
      name: 'Epsilon Spires',
      city: 'Brattleboro',
      state: 'VT',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '65a9c9de9f349a004561f249',
    createdAt: '2024-01-19T01:01:18.549Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/JQM_Epsilon2_v5_cropped.jpg',
        aspect: 0.703751617076326,
        caption: 'Poster by Justin Q Martin'
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://www.epsilonspires.org/event-info/nadah-el-shazly-eve-essex'
      }
    ],
    startDate: '2024-03-20T23:30:00.000Z',
    updatedAt: '2024-01-19T01:01:18.550Z',
    slug: 'eve-essex-nadah-el-shazly',
    title: 'Eve Essex, Nadah El Shazly',
    description: 'Part of GRRLS TO THE FRONT Collaboration of Epsilon Spires, Vermont Women&#x27;s Fund and The Stone Church.'
  },
  {
    venue: {
      name: "Grimm Ales / Lala's",
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '65baefa69af94e0047a484ca',
    createdAt: '2024-02-01T01:11:02.399Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20240318-ExquisiteCorp-Grimm.jpg',
        aspect: 0.7456359102244389
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://www.eventbrite.com/e/exquisite-corp-tickets-846615378387?aff=oddtdtcreator'
      }
    ],
    startDate: '2024-03-18T22:00:00.000Z',
    updatedAt: '2024-02-01T01:11:02.400Z',
    slug: 'exquisite-corp-eve-essex-the-grayscale-clown-sophie-and-jerry-dj-alfm',
    title: 'Exquisite Corp: Eve Essex, The Grayscale Clown, Sophie & Jerry, DJ ALFM'
  },
  {
    venue: {
      name: 'MoMA PS1',
      city: 'Long Island City',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '65a9d0749f349a004561f2f0',
    createdAt: '2024-01-19T01:29:24.900Z',
    images: [],
    links: [
      {
        title: 'MoMA PS1',
        url: 'https://www.momaps1.org/events/365-night-at-the-museum'
      }
    ],
    startDate: '2024-02-24T01:00:00.000Z',
    updatedAt: '2024-01-19T01:29:24.900Z',
    slug: 'das-audit-night-at-the-museum-rikrit-tiravanija-party',
    title: 'Das Audit @ Night at the Museum / Rikrit Tiravanija party',
    description: '<p>For one night only, experience Night at the Museum, an after-hours party celebrating the final weeks of <u><em><a href="https://www.momaps1.org/programs/258-rirkrit-tiravanija">Rirkrit Tiravanija: A LOT OF PEOPLE</a></em></u> with special performances, interactive artworks, music, dancing, and more. Take in DJ sets from Spencer Sweeney as well as Brian DeGraw from legendary New York band Gang Gang Dance. Get a screen printed t-shirt made in Tiravanija’s <em>untitled 2011 (t-shirt, no t-shirt)</em>—with select phrases that are only available at the event. Bring your A-game for a doubles ping-pong tournament and compete to win special artist-designed prizes. The entire museum will be open until midnight. </p><p>Music is performed all night, with a festival that features artists in Tiravanija’s network: art rock ensemble Das Audit (Craig Kalpakijan, Eve Essex, Dan Fox), artists Alex Zhang Hungtai and Che Chen, and more special guests. All participatory works in the exhibition will be activated: for a late-night buzz, Turkish coffee is served in <em>untitled 1993 (café deutschland)</em>, and tea is available in <em>untitled 1992 (cure)</em>. Plus, drinks will be available for purchase at the bar. Tickets are required for this event.</p><p><strong>Open rehearsals @ PS1:</strong></p><p>Saturday, February 3 from 2:00-4:00PM</p><p>Saturday, February 10 from 2:00-3:00PM</p><p>Saturday, February 17 from 5:00-8:00PM</p>'
  },
  {
    venue: {
      name: 'Dirty Dungarees',
      address: '2584 N High St',
      city: 'Columbus',
      state: 'OH',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '64dc28b96c58df004847fbfa',
    createdAt: '2023-08-16T01:39:05.644Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/21FAE4DB-8F63-428D-86AE-7559BACB836C.JPG',
        aspect: 0.729483282674772
      }
    ],
    links: [],
    startDate: '2023-09-10T00:00:00.000Z',
    updatedAt: '2023-08-16T01:39:05.645Z',
    slug: 'eve-essex-orchard-keepers-dairy-family-friends-with-elephants',
    title: 'Eve Essex, Orchard Keepers, Dairy Family, Friends with Elephants'
  },
  {
    venue: {
      name: 'Epsilon Spires',
      address: '190 Main St',
      city: 'Brattleboro',
      state: 'VT',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '64b301a9e33d1000479cd82b',
    createdAt: '2023-07-15T20:29:29.797Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/Screen Shot 2023-07-19 at 12.06.44 AM.png',
        aspect: 0.8016806722689076,
        caption: 'Poster by Justin Q Martin'
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://www.epsilonspires.org/event-info/winter-family-eve-essex'
      }
    ],
    startDate: '2023-07-24T00:00:00.000Z',
    updatedAt: '2023-07-15T20:29:29.798Z',
    slug: 'eve-essex-winter-family',
    title: 'Eve Essex, Winter Family'
  },
  {
    venue: {
      name: 'Shift',
      address: '411 Kent Ave',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '6439af0980e61300479eadfc',
    createdAt: '2023-04-14T19:52:41.724Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/TIWBTB-Release1.jpg',
        aspect: 0.8212962962962963
      }
    ],
    links: [
      {
        title: 'Shift 411',
        url: 'https://www.411kent.org/shift'
      }
    ],
    startDate: '2023-04-29T21:00:00.000Z',
    updatedAt: '2023-04-14T19:52:41.725Z',
    slug: 'eve-essex-and-andy-cahill-today-i-will-be-the-bread-soundtrack-release-party',
    title: 'Eve Essex & Andy Cahill: Today, I Will Be The Bread Soundtrack Release Party',
    description: 'On Saturday, April 29 at 5PM, Shift and Soap Library present a free screening celebrating the release of Eve Essex’s original soundtrack for Andy Cahill’s animated film &quot;Today, I Will Be The Bread.&quot; The event includes a screening of &quot;Today, I Will Be The Bread&quot; as well as the premiere of two new music videos by Eve Essex, animated by Andy Cahill and James J.A. Mercer. &quot;Today, I Will Be The Bread&quot; marks the first foray into soundtrack composition from multi-instrumentalist and Soap Library veteran Eve Essex. Animated by artist Andy Cahill, &quot;Today, I Will Be The Bread&quot; captures 10 minutes of an uncanny daydream involving a boy, a clock, a loaf of bread, and an orange, augmented by Foley sounds and ASMR textures that resonate deep within the ear. Eve Essex’s soundtrack to &quot;Today, I Will Be The Bread&quot; releases on Friday, April 28, 2023 in digital formats via Soap Library.'
  },
  {
    venue: {
      name: 'seCret loCation',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '641e08ebbdd428004730dfea',
    createdAt: '2023-03-24T20:32:43.282Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/CC-Apr1023-small.jpg',
        aspect: 0.8220230473751601,
      }
    ],
    links: [],
    startDate: '2023-04-11T00:00:00.000Z',
    updatedAt: '2023-03-24T20:32:43.282Z',
    slug: 'eve-essex-nope-harlow-and-kate-mohanty',
    title: 'Eve Essex, NOPE, Harlow & Kate Mohanty',
    description: 'A three-saxophone bill at Greenpoint&#x27;s favorite secret location... DM for details.'
  },
  {
    venue: {
      name: 'Tibet House',
      address: '22 W 15th St.',
      city: 'NYC',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '63793f2945767a0052699fd5',
    createdAt: '2022-11-19T20:40:09.567Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/AW_POETRY_DEC_7_2022.jpg',
        aspect: 0.8823529411764706,
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://events.thus.org/programs/spanner-in-the-works-arden-wohl-poetry-series-night-2/'
      }
    ],
    startDate: '2022-12-07T23:00:00.000Z',
    updatedAt: '2022-11-19T20:40:09.568Z',
    slug: 'das-audit-at-spanner-in-the-works-plan-b',
    title: 'Das Audit at Spanner In The Works/Plan B ',
    description: 'A night of poetry and music organized by Arden Wohl, featuring Adam Green, Jordan Galland, imogen xtian smith, Katie Ebbitt, Ari Lisner, Jamie Pallot, Das Audit, Ilka Scobie, David Rimanelli, Sahra Motalebi, Simone Frazier and Sayra Player.'
  },
  {
    venue: {
      name: 'Outpost Artist Resources',
      address: '1665 Norman St',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '633e137a34ebd6004e70de34',
    createdAt: '2022-10-05T23:30:02.034Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/2201022_FOH BENEFIT_yella_square_RGB.jpg',
        aspect: 1
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://withfriends.co/event/15036616/1022_a_benefit_for_fire_over_heaven'
      }
    ],
    startDate: '2022-10-22T18:00:00.000Z',
    updatedAt: '2022-10-05T23:30:02.034Z',
    slug: 'eve-essex-benefit-for-fire-over-heaven',
    title: 'Eve Essex @ Benefit for Fire Over Heaven',
    description: '&quot;An epic, 6-hour benefit concert for the Fire Over Heaven music series. In this time of multi-dimensional uncertainty and funding woes, our already meager grants have evaporated and we turn to our community for support. This day-long concert will feature graciously donated sets by The 75 Dollar Bill Little Big Band, Eve Essex, Loren Connors, David Grubbs &amp; Ryley Walker, C.Spencer Yeh, Patrick Holmes &amp; Ryan Sawyer and more artists TBA. Tickets are $30 and all proceeds will go to support the continued work of this concert series.&quot;'
  },
  {
    venue: {
      name: 'Outpost Artist Resources',
      address: '1665 Norman St',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '6306b6cd85caa40049174a5b',
    createdAt: '2022-08-24T23:39:57.633Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/220915_DAS A_HYPERB_SQUARE_72.jpg',
        aspect: 1
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://withfriends.co/event/14922478/fire_over_heaven_915_das_audit_and_hyperbolic_time_chamber'
      }
    ],
    startDate: '2022-09-16T00:00:00.000Z',
    updatedAt: '2022-08-24T23:39:57.633Z',
    slug: 'das-audit-quartet-hyperbolic-time-chamber',
    title: 'Das Audit Quartet, Hyperbolic Time Chamber',
    description: 'Das Audit opens the Fire Over Heaven season with a quartet performance featuring Eve Essex (winds/voice/electronics), Dan Fox (bass/clarinet/electronics), Craig Kalpakjian (electric guitar) and a special appearance by former member Sean Keenan, in from California, on percussion.'
  },
  {
    venue: {
      name: "St. Peter's Church",
      address: '346 W 20th St',
      city: 'NYC',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [
      '<iframe style="border: 0; width: 100%; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/track=2206652730/size=large/bgcol=ffffff/linkcol=333333/tracklist=false/artwork=small/transparent=true/" seamless><a href="https://eveessex.bandcamp.com/track/honeypot-live">Honeypot (live) by Eve Essex &amp; The Fabulous Truth</a></iframe>',
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/GyNZ8PtjrEE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    ],
    projectIds: [],
    isPublished: true,
    _id: '628f7f84db6e610049c0e4dc',
    createdAt: '2022-05-26T13:24:20.851Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/617 flyer-final.jpg',
        aspect: 0.7727272727272727
      }
    ],
    links: [
      {
        title: 'Tickets',
        url: 'https://ra.co/events/1540086'
      }
    ],
    startDate: '2022-06-17T23:30:00.000Z',
    updatedAt: '2022-05-26T13:24:20.851Z',
    slug: 'eve-essex-and-the-fabulous-truth-jacob-becker-ucc-harlo',
    title: 'Eve Essex & The Fabulous Truth, Jacob Becker, UCC Harlo',
    description: 'My first solo performance with live ensemble, and the debut of The Fabulous Truth featuring Allyson Clare, violin, Dan Fox, bass, Anne Garlid, viola, Max Gordon, piano, Kevin Kenkel, drums, John Swartz, cello.'
  },
  {
    venue: {
      name: 'KAJE',
      address: '74 15th St',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/TqaTBlXX8KQ?start=888" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    ],
    projectIds: [],
    isPublished: true,
    _id: '620efdc25762d8004c00b82d',
    createdAt: '2022-02-18T02:00:34.035Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/kaje-dasaudit-instagram-post-5-800x-q90.png',
        aspect: 1
      }
    ],
    links: [
      {
        title: 'Bandcamp live-stream RSVP',
        url: 'https://das-audit.bandcamp.com/merch/peter-zummo-s-environmental-combo-das-audit-quintet-early-shinada'
      },
      {
        title: 'KAJE',
        url: 'https://kaje.world/das-audit'
      }
    ],
    startDate: '2022-03-31T23:00:00.000Z',
    updatedAt: '2022-02-18T02:00:34.035Z',
    slug: 'das-audit-and-friends-peter-zummo-s-environmental-combo-early-shinada',
    title: 'Das Audit & Friends: Peter Zummo’s Environmental Combo, Early Shinada',
    description: '<p>Das Audit takes over KAJE’s gallery space in Brooklyn, NY for six weeks in February-March to mount three evenings of performances. For the final event of the series, Early Shinada opens with a reading, and Das Audit (Eve Essex, Dan Fox, Craig Kalpakjian) performs in a first-time quintet joined by Kevin Kenkel, drums, and Max Gordon on keyboards. Peter Zummo’s Environmental Combo closes out the series with a quartet performance featuring Mustafa Ahmed, percussion, Ernie Brooks, bass, and Bill Ruyle, dulcimer. Multimedia artist Kit Fitzgerald produces live video with analog and digital effects for the live-stream. The event will be live-streamed on Bandcamp. Limited in-person seating is available (suggested donation $10), details at <a href="https://kaje.world/">kaje.world</a></p><p>This project was supported, in part, by a Foundation for Contemporary Arts Emergency Grant.</p>'
  },
  {
    venue: {
      name: 'KAJE',
      address: '74 15th St',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/SZj_C3UEJp4?start=3752" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    ],
    projectIds: [],
    isPublished: true,
    _id: '620efd1b5762d8004c00b823',
    createdAt: '2022-02-18T01:57:47.477Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/KAJE_DASAUDIT_INSTAGRAM_POST.4.png',
        aspect: 1
      }
    ],
    links: [
      {
        title: 'Bandcamp live-stream RSVP',
        url: 'https://das-audit.bandcamp.com/merch/kevin-kenkel-das-audit-quartet-arden-wohl'
      },
      {
        title: 'KAJE',
        url: 'https://kaje.world/das-audit'
      }
    ],
    startDate: '2022-03-13T22:00:00.000Z',
    updatedAt: '2022-02-18T01:57:47.477Z',
    slug: 'das-audit-and-friends-kevin-kenkel-arden-wohl',
    description: '<p>Das Audit takes over KAJE’s gallery space in Brooklyn, NY for six weeks in February-March to mount three evenings of performances. For this second event, Arden Wohl opens with a reading, Das Audit (Eve Essex, Dan Fox, Craig Kalpakjian) performs in a first time quartet with Kevin Kenkel on drums, and Kevin Kenkel presents a solo electronics set. Multimedia artist Kit Fitzgerald produces live video with analog and digital effects for the live-stream. </p><p>The event will be live-streamed on Bandcamp. </p><p>Limited in-person seating is available (suggested donation $10), details at <a href="https://kaje.world/">kaje.world</a></p><p>This project was supported, in part, by a Foundation for Contemporary Arts Emergency Grant. </p>',
    title: 'Das Audit & Friends: Kevin Kenkel, Arden Wohl'
  },
  {
    venue: {
      name: 'KAJE',
      address: '74 15th St',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/CL2yKj9hLHo?start=1799" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    ],
    projectIds: [],
    isPublished: true,
    _id: '620efbf55762d8004c00b7b3',
    createdAt: '2022-02-18T01:52:53.996Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/KAJE_DASAUDIT_INSTAGRAM_POST.png',
        aspect: 1
      }
    ],
    links: [
      {
        title: 'KAJE',
        url: 'https://kaje.world/das-audit'
      },
      {
        title: 'Bandcamp Live Stream RSVP',
        url: 'https://das-audit.bandcamp.com/merch/gavil-n-rayna-russom-das-audit-trio-emmanuel-olunkwa'
      }
    ],
    startDate: '2022-02-27T23:00:00.000Z',
    updatedAt: '2022-02-18T01:52:53.996Z',
    slug: 'das-audit-and-friends-gavilan-rayna-russom-emmanuel-olunkwa',
    title: 'Das Audit & Friends: Gavilán Rayna Russom, Emmanuel Olunkwa',
    description: '<p>Das Audit takes over KAJE’s gallery space in Brooklyn, NY for six weeks in February-March to mount three evenings of performances. For this opening event, Emmanuel Olunkwa opens with a reading, Das Audit performs as a trio (Eve Essex, Dan Fox, Craig Kalpakjian), and Gavilán Rayna Russom presents a solo electronics set. Multimedia artist Kit Fitzgerald produces live video with analog and digital effects. </p><p>The event will be live-streamed on Bandcamp. </p><p>Limited in-person seating is available (suggested donation $10), details at <a href="https://kaje.world/">kaje.world</a></p><p>This project was supported, in part, by a Foundation for Contemporary Arts Emergency Grant.</p>'
  },
  {
    venue: {
      name: 'Montez Press Radio',
      address: '46 Canal Street',
      city: 'NYC',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '61e8bfefa2f0de00489340f1',
    createdAt: '2022-01-20T01:50:39.649Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20220127-DasAudit-MontezPress.jpeg',
        aspect: 1
      }
    ],
    links: [
      {
        title: 'radio.montezpress.com',
        url: 'https://radio.montezpress.com/#/show/2346'
      }
    ],
    startDate: '2022-01-27T23:00:00.000Z',
    updatedAt: '2022-01-20T01:50:39.649Z',
    slug: 'das-audit-02',
    title: 'Das Audit',
    description: 'Visit in-person or listen via radio.'
  },
  {
    venue: {
      name: 'IRL Gallery',
      address: '80 Franklin St.',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/B7RyeGIcljQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    ],
    projectIds: [],
    isPublished: true,
    _id: '6147b225dddc7c0048bc728c',
    createdAt: '2021-09-19T21:56:53.057Z',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20211004-TBHQ-release-IRL.jpg',
        aspect: 0.7949367088607595,
        caption: 'Jonny Campolo'
      }
    ],
    links: [
      {
        title: 'tickets',
        url: 'https://www.eventbrite.com/e/tbhq-bentley-anderson-x-nick-neuburg-eve-essex-tickets-171812464707'
      }
    ],
    startDate: '2021-10-03T23:00:00.000Z',
    updatedAt: '2021-09-19T21:56:53.058Z',
    slug: 'eve-essex-bentley-anderson-x-nick-neuburg-tbhq',
    title: 'Eve Essex, Bentley Anderson x Nick Neuburg, TBHQ',
    description: 'Release show for TBHQ&#x27;s &#x27;Cairo&#x27;'
  },
  {
    venue: {
      name: 'Windjammer',
      address: '552 Grandview Ave',
      city: 'Ridgewoood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5e560852e1a5a300295c1608',
    slug: 'eve-essex-tamio-shiraishi-and-carolyn-hietter-sauber-zauber-tbhq',
    updatedAt: '2020-02-26T05:55:30.577Z',
    startDate: '2020-03-08T01:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/128712165185381/',
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20200307-Windjammer.jpg',
        aspect: 0.8014084507042254,
      }
    ],
    createdAt: '2020-02-26T05:55:30.576Z',
    title: 'Eve Essex, Tamio Shiraishi & Carolyn Hietter, Sauber Zauber, TBHQ'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Brooklyn',
      address: '1114 Dekalb Ave',
      name: 'Flowers For All Occasions'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5dcee344cb08eb0029eccfd4',
    slug: 'eve-essex-melody-loveless-trash-panda-qc',
    updatedAt: '2019-11-15T17:41:24.151Z',
    startDate: '2020-02-24T02:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/IMG_5243.jpeg',
        aspect: 1,
      }
    ],
    createdAt: '2019-11-15T17:41:24.151Z',
    title: 'Eve Essex, Melody Loveless, Trash Panda QC'
  },
  {
    venue: {
      name: '',
      address: '7 Herkimer Pl',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [
      '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1100690644&color=%23181814&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/kaje-place" title="KAJE" target="_blank" style="color: #cccccc; text-decoration: none;">KAJE</a> · <a href="https://soundcloud.com/kaje-place/20200209-kaje-live-mix" title="Eve Essex Live at KAJE" target="_blank" style="color: #cccccc; text-decoration: none;">Eve Essex Live at KAJE</a></div>'
    ],
    projectIds: [],
    isPublished: true,
    _id: '5e2fbf9c4c8ce400298d3714',
    slug: 'eve-essex-and-lydia-okrent',
    updatedAt: '2020-01-28T04:59:08.936Z',
    startDate: '2020-02-09T21:00:00.000Z',
    links: [
      {
        title: 'KAJE',
        url: 'https://kaje.world/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/kaje-flier.png',
        aspect: 1.0233837689133425
      }
    ],
    createdAt: '2020-01-28T04:59:08.936Z',
    title: 'Eve Essex & Lydia Okrent',
    description: 'Music by Eve Essex. Movement by Lydia Okrent. Installation by Kate Levant &amp; Dmitri Hertz. Presented by Kaje.'
  },
  {
    venue: {
      name: 'Windjammer',
      address: '552 Grandview Ave',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5d7e719a722e880029e24c17',
    slug: 'hevm-leila-bordreuil-and-bookworms-housefire-secret-boyfriend',
    updatedAt: '2019-09-15T17:15:06.883Z',
    startDate: '2019-09-27T00:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/9_26_2019_Flyer.jpeg',
        aspect: 0.7602958480416877,
        caption: 'Poster by Jeremiah Carter'
      }
    ],
    createdAt: '2019-09-15T17:15:06.883Z',
    title: 'HEVM, Leila Bordreuil & Bookworms, Housefire,  Secret Boyfriend'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Brooklyn',
      address: '119 Pierrepont St',
      name: 'ISSUE Project Room'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5d3781bfa9526a002949d595',
    slug: 'eve-essex-james-ferraro-jd-emmanuel',
    updatedAt: '2019-07-23T21:53:03.596Z',
    startDate: '2019-09-06T00:00:00.000Z',
    links: [
      {
        title: 'ISSUE Project Room',
        url: 'https://issueprojectroom.org/event/j-d-emmanuel-james-ferraro-eve-essex'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/Screen Shot 2019-10-14 at 9.12.01 PM.png',
        aspect: 1.5038167938931297,
        caption: 'Cameron Kelly McLeod'
      }
    ],
    createdAt: '2019-07-23T21:53:03.595Z',
    title: 'Eve Essex, James Ferraro, JD Emmanuel'
  },
  {
    venue: {
      name: 'Et Al Gallery',
      address: '620 Kearny St.',
      city: 'San Francisco',
      state: 'CA',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5d54056c7f7e450029e55996',
    slug: 'eve-essex-cranky',
    updatedAt: '2019-08-14T12:58:20.274Z',
    startDate: '2019-08-30T22:00:00.000Z',
    links: [
      {
        title: 'Facebook Event',
        url: 'https://www.facebook.com/events/374903493158212/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/SF_Poster.jpg',
        aspect: 1.052439024390244,
        caption: 'Poster by Justin Q Martin'
      }
    ],
    createdAt: '2019-08-14T12:58:20.273Z',
    title: 'Eve Essex, Cranky',
    description: 'First performance in San Francisco, with Cranky (Oakland): a trio comprised of Sean Keenan (bass guitar, Das Audit), Jake Parker Scott (alto saxophone) and Mitch Stahlmann (flute/soprano saxophone/electronics). Katy Cowan &amp; Heidi Howard Closing Reception.'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'NYC',
      address: '217 E. Houston Street',
      name: 'Mercury Lounge'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5d179bce56e6b3002929edcd',
    slug: 'eve-essex-nyobs',
    updatedAt: '2019-06-29T17:11:42.192Z',
    startDate: '2019-08-22T01:30:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/840681166306475/'
      },
      {
        title: 'Tickets',
        url: 'https://www.eventbrite.com/e/eve-essex-nyobs-tickets-64270441621'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/IMG_4886.jpg',
        aspect: 1.3333333333333333
      }
    ],
    createdAt: '2019-06-29T17:11:42.192Z',
    title: 'Eve Essex, NYOBS'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Brooklyn',
      address: '93 Scott Ave',
      name: 'Honeys'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5d02c93d78a7180029cd5b83',
    slug: 'hevm-c-spencer-yeh-amirtha-kidambi-che-chen-robbie-lee-trio-rebekah-luna',
    updatedAt: '2019-06-13T22:07:57.099Z',
    startDate: '2019-06-29T00:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/435332197261888/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20190628-Honeys.jpg',
        aspect: 0.7404556650246306,
        caption: 'Poster by Andy Cahill'
      }
    ],
    createdAt: '2019-06-13T22:07:57.099Z',
    title: 'HEVM, C Spencer Yeh, Amirtha Kidambi/Che Chen/Robbie Lee trio, Rebekah Luna'
  },
  {
    venue: {
      name: 'Ruba Club',
      address: '416 Green Street',
      city: 'Philadelphia',
      state: 'PA',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5ccb531576b3610029a444c5',
    slug: 'hevm-and-david-grubbs-at-dreamweapons-a-musical-afterlife-of-tony-conrad',
    updatedAt: '2019-05-02T20:29:09.478Z',
    startDate: '2019-06-28T00:00:00.000Z',
    links: [
      {
        title: 'Ars Nova Workshop',
        url: 'https://www.arsnovaworkshop.org/events/hevm-06-27-2019/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/ruba-club.jpg',
        aspect: 1
      }
    ],
    createdAt: '2019-05-02T20:29:09.478Z',
    title: 'HEVM & David Grubbs at Dreamweapons: A Musical Afterlife of Tony Conrad',
    description: '<p>Please join Ars Nova Workshop and the Institute of Contemporary Art at the University of Pennsylvania for <em>Dreamweapons</em>, a series of performances celebrating the multivalent influences of Tony Conrad. Conrad was a central figure in numerous experimental film, music, and performance communities from the early 1960s until his death in 2016. These events are presented in conjunction with ICA’s presentation of <em>Introducing Tony Conrad: A Retrospective</em>, the first large-scale museum survey devoted entirely to the artist.</p><p><strong>HEVM</strong> is a new group comprised of three distinct voices that hail from disparate parts of the experimental pop landscape: MV Carbon, Eve Essex, and Hunter Hunt-Hendrix.</p>'
  },
  {
    venue: {
      country: undefined,
      state: 'MD',
      city: 'Baltimore',
      name: 'Red Room'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5d0846e868e0330029b7387f',
    slug: 'hevm-andrew-bernstein',
    updatedAt: '2019-06-18T02:05:28.775Z',
    startDate: '2019-06-27T00:30:00.000Z',
    links: [
      {
        title: 'redroom.org',
        url: 'http://redroom.org/hevm-andrew-bernstein/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/HEVM.png',
        aspect: 1.6387614678899083
      }
    ],
    createdAt: '2019-06-18T02:05:28.775Z',
    title: 'HEVM, Andrew Bernstein'
  },
  {
    venue: {
      name: 'The Glove',
      address: '',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5cd025ebb7410500290d8d4c',
    slug: 'das-audit-bentley-anderson-and-nick-stevens-tbhq-silencio',
    updatedAt: '2019-05-06T12:17:47.437Z',
    startDate: '2019-05-16T00:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20190515-DasAudit-Glove.jpg',
        aspect: 0.78369140625
      }
    ],
    createdAt: '2019-05-06T12:17:47.437Z',
    title: 'Das Audit, Bentley Anderson & Nick Stevens, TBHQ, Silencio'
  },
  {
    venue: {
      country: undefined,
      state: 'OH',
      city: 'Columbus',
      address: '1164 S. Front St.',
      name: 'No Place Gallery'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c70aed16eb0cae667d9ce52',
    slug: 'eve-essex-mike-shiflet-robb-hatt-envenomist',
    updatedAt: '2019-02-23T02:24:17.020Z',
    startDate: '2019-04-27T00:00:00.000Z',
    links: [
      {
        title: 'noplacegallery.com',
        url: 'http://noplacegallery.com/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/poster_a1-bw-small.jpg',
        aspect: 1
      }
    ],
    createdAt: '2019-02-23T02:24:17.019Z',
    title: 'Eve Essex, Mike Shiflet, Robb Hatt, Envenomist'
  },
  {
    venue: {
      name: 'Fridman Gallery',
      address: '169 Bowery',
      city: 'NYC',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c7362e9b298770029257e32',
    slug: 'eve-essex-byron-westbrook',
    updatedAt: '2019-02-25T03:37:13.454Z',
    startDate: '2019-04-24T00:00:00.000Z',
    links: [
      {
        title: 'Fridman Gallery',
        url: 'https://www.fridmangallery.com/product-page/april-23-byron-westbrook-and-eve-essex'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/eve-byron.jpg',
        aspect: 1.4941176470588236
      }
    ],
    createdAt: '2019-02-25T03:37:13.453Z',
    title: 'Eve Essex, Byron Westbrook',
    description: 'Fridman Gallery presents two solo sets from performer-composers Byron Westbrook (Los Angeles) and Eve Essex (NYC). Eve Essex presents new and recent songs, combining avant-pop vocals with open-ended combinations of synthesizer and woodwinds. Byron Westbrook performs new works in just intonation for laptop and electronics.'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '224 Greene Ave',
      name: 'e-flux Bar Laika'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c807ed21fe9e70029bc1d7d',
    slug: 'satellite-5-peter-zummo-and-eve-essex',
    updatedAt: '2019-03-07T02:15:46.423Z',
    startDate: '2019-03-22T00:00:00.000Z',
    links: [
      {
        title: 'e-flux',
        url: 'https://www.e-flux.com/program/256578/bar-laika-nbsp-presents-satellite-5-nbsp-peter-zummo-and-eve-essex'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/zummo-eve.gif',
        aspect: 1.5
      }
    ],
    createdAt: '2019-03-07T02:15:46.423Z',
    title: 'Satellite 5: Peter Zummo & Eve Essex',
    description: 'Bar Laika by e-flux presents the fifth edition of Satellite, featuring Peter Zummo and Eve Essex.'
  },
  {
    venue: {
      name: 'Secret Project Robot',
      address: '1186 Broadway',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c51bc1e8cfd5d0025df0bcb',
    slug: 'eve-essex-rachika-s-segregated-witness-jacob-becker',
    updatedAt: '2019-01-30T15:00:46.238Z',
    startDate: '2019-03-15T00:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/314408752542595'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20190314-SPR.jpg',
        aspect: 0.728515625,
        caption: 'Poster by Justin Q Martin'
      }
    ],
    createdAt: '2019-01-30T15:00:46.238Z',
    title: 'Eve Essex, Rachika S, Segregated Witness, Jacob Becker'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Ridgewood',
      address: '552 Grandview Ave',
      name: 'Windjammer'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c528d788cfd5d0025df0bce',
    slug: 'eve-essex-hairy-sands-luscious-skin-and-muyassar-kurdi',
    updatedAt: '2019-01-31T05:54:00.186Z',
    startDate: '2019-02-17T01:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/759757271063460/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20190216-Windjammer.jpg',
        aspect: 0.70703125
      }
    ],
    createdAt: '2019-01-31T05:54:00.186Z',
    title: 'Eve Essex, Hairy Sands, Luscious Skin and Muyassar Kurdi'
  },
  {
    venue: {
      name: 'Nha Minh',
      address: '485 Morgan Ave',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c47a55225837d0025f0bf2f',
    slug: 'eve-essex-jjmrdr-dj-s-s-sandhu',
    updatedAt: '2019-01-22T23:20:50.877Z',
    startDate: '2019-01-31T01:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/354954528659541/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/nha-mihn.jpg',
        aspect: 1.358695652173913
      }
    ],
    createdAt: '2019-01-22T23:20:50.877Z',
    description: 'The Colloquium for Unpopular Culture presents,  JJMRDR is a collaboration between Martin Daughtry and Joel Rust.',
    title: 'Eve Essex, JJMRDR, DJ S.S. Sandhu'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Ridgewood',
      address: '1090 Wyckoff Ave.',
      name: 'HOLO'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5bff50e7baac550025b419c8',
    slug: 'das-audit-w-stefan-tcherepnin-and-philippa-shao',
    updatedAt: '2018-11-29T02:37:27.232Z',
    startDate: '2018-12-10T01:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/Holo 12.9.18.jpg',
        aspect: 0.75
      }
    ],
    createdAt: '2018-11-29T02:37:27.231Z',
    title: 'Das Audit w/ Stefan Tcherepnin & Philippa Shao',
    description: 'Das Audit (Eve Essex &amp; Craig Kalpakjian) perform as a quartet with special guests Stefan Tcherepnin (percussion) and Philippa Shao (guitar). Live sets by StKeto (Taketo Shimada &amp; Stefan Tcherepnin), Sarah Viviana Valdez (i_like_dog_face) and Abe Maneri/Ben Jaffe duo.'
  },
  {
    venue: {
      name: 'Bohemian Grove',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5bddc5d56b9d48001332e5d9',
    updatedAt: '2018-11-03T15:59:17.360Z',
    startDate: '2018-11-09T01:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/1943268205974523/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20181108-EveEssex-BernardHermanDungeon.jpg',
        aspect: 1
      }
    ],
    createdAt: '2018-11-03T15:59:17.359Z',
    slug: 'eve-essex-mummy-dust-trippers-new-firmament-blessed-broke-the-throat',
    title: 'Eve Essex, Mummy Dust Trippers, New Firmament, Blessed Broke, The Throat'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Brooklyn',
      name: 'National Sawdust'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c0f18d6a38756002500c427',
    slug: 'origin-of-the-alimonies-hunter-hunt-hendrix',
    updatedAt: '2018-12-11T01:54:30.469Z',
    startDate: '2018-10-26T00:00:00.000Z',
    links: [
      {
        title: 'National Sawdust',
        url: 'https://nationalsawdust.org/event/hunter-hunt-hendrix-origin-of-the-alimonies/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/Screen Shot 2018-12-10 at 20.55.11.png',
        aspect: 1.001669449081803
      }
    ],
    createdAt: '2018-12-11T01:54:30.469Z',
    title: 'Origin of the Alimonies: Hunter Hunt-Hendrix',
    description: 'Performing on flutes and saxophone as part of ensemble for live premiere of video opera by Hunter Hunt-Hendrix.'
  },
  {
    venue: {
      country: undefined,
      state: undefined,
      city: 'Washington D.C.',
      address: '6950 Maple St. NW',
      name: 'Rhizome'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5ba54c5f9dd216001458576c',
    updatedAt: '2018-09-21T19:54:07.462Z',
    startDate: '2018-10-21T00:00:00.000Z',
    links: [
      {
        title: 'Rhizome DC',
        url: 'http://www.rhizomedc.org/new-events/2018/10/20/concert-eve-essex-kayla-guthrie-andrew-bernstein-dead-tennants'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/44145100_2103192720009460_1229345663045599232_n.jpg',
        aspect: 0.8208333333333333
      }
    ],
    createdAt: '2018-09-21T19:54:07.462Z',
    title: 'Eve Essex, Kayla Guthrie, Andrew Bernstein, Dead Tenants',
    slug: 'eve-essex-kayla-guthrie-andrew-bernstein-dead-tenants'
  },
  {
    venue: {
      name: 'Doyers',
      address: '',
      city: 'NYC',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5bc678e10c1fac0014cfc688',
    updatedAt: '2018-10-16T23:48:49.326Z',
    startDate: '2018-10-14T23:00:00.000Z',
    links: [],
    images: [],
    createdAt: '2018-10-16T23:48:49.326Z',
    title: 'Das Audit',
    slug: 'das-audit'
  },
  {
    venue: {
      country: 'Belgium',
      state: undefined,
      city: 'Eupen',
      address: 'Rotenbergplatz 19',
      name: 'Kulturzentrum Alter Schlachthof'
    },
    isAllDay: true,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5ab9c3b9acbde1001402b4da',
    updatedAt: '2018-03-27T04:08:25.020Z',
    startDate: '2018-09-08T04:08:00.000Z',
    links: [
      {
        title: 'meakusma-festival.be',
        url: 'http://www.meakusma-festival.be/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20180908-Meakusma-Festival-First-Wave-1100x407 (1).jpg',
        aspect: 2.7027027027027026
      }
    ],
    createdAt: '2018-03-27T04:08:25.020Z',
    title: 'Eve Essex at Meakusma Festival',
    slug: 'eve-essex-at-meakusma-festival'
  },
  {
    venue: {
      name: 'ACUD Macht Neu',
      address: 'Veteranenstraße 21',
      city: 'Berlin',
      state: '',
      country: 'Germany'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5b7342fffc6a2800144931be',
    updatedAt: '2018-08-14T21:00:47.494Z',
    startDate: '2018-09-07T00:00:00.000Z',
    links: [
      {
        title: 'ACUD Macht Neu',
        url: 'http://acudmachtneu.de/events/1183/sky-walking-laboratory-2-eve-essex-sky-walking-hanna-schwarz/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20180906-EveEssexSkyWalking-Acud-Berlin.jpg',
        aspect: 0.7071428571428572
      }
    ],
    createdAt: '2018-08-14T21:00:47.494Z',
    title: 'Eve Essex, Sky Walking, Hanna Schwarz',
    slug: 'eve-essex-sky-walking-hanna-schwarz'
  },
  {
    venue: {
      name: 'HOLO',
      address: '1090 Wyckoff Ave',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5b451692f88a3d00141b30fb',
    updatedAt: '2018-07-10T20:26:58.091Z',
    startDate: '2018-08-06T00:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/601593510227900/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20180805-EveDan0-HOLO.jpg',
        aspect: 0.77734375
      }
    ],
    createdAt: '2018-07-10T20:26:58.091Z',
    title: 'Eve Essex & Dan Fox, 1-800-Valentine, Crystal Penalosa + N. Wheeler',
    slug: 'eve-essex-and-dan-fox-1-800-valentine-crystal-penalosa-n-wheeler'
  },
  {
    venue: {
      name: 'Honeys',
      address: '93 Scott Ave',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5b2d8850af56020014679285',
    updatedAt: '2018-06-22T23:37:52.749Z',
    startDate: '2018-07-20T00:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/1318941064917534'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20180719-KaylaReleaseShow-Honeys.jpg',
        aspect: 0.78271484375
      }
    ],
    createdAt: '2018-06-22T23:37:52.749Z',
    title: 'Eve Essex, Kayla Guthrie, Sadaf, Guido, vveiss',
    description: 'Kayla Guthrie LP release show',
    slug: 'eve-essex-kayla-guthrie-sadaf-guido-vveiss'
  },
  {
    venue: {
      name: 'Secret Project Robot',
      address: '1186 Broadway',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5b29c27c99a5880014411828',
    updatedAt: '2018-06-20T02:57:00.604Z',
    startDate: '2018-07-11T00:00:00.000Z',
    links: [
      {
        title: 'Secret Project Robot',
        url: 'https://www.secretprojectrobot.org/calendar/2018/7/10/che-chen-david-watsoneve-essex-dan-foxfrye-shafiee-stardrum'
      }
    ],
    images: [],
    createdAt: '2018-06-20T02:57:00.603Z',
    title: 'Eve Essex & Dan Fox, Che Chen & David Watson, Frye / Shafiee / Stardrum',
    slug: 'eve-essex-and-dan-fox-che-chen-and-david-watson-frye-shafiee-stardrum'
  },
  {
    venue: {
      name: 'Wonders of Nature',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5b26f62a873f79963152c30d',
    updatedAt: '2018-06-18T00:00:42.785Z',
    startDate: '2018-06-27T00:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/Screen Shot 2018-06-17 at 8.00.10 PM.png',
        aspect: 0.753303964757709
      }
    ],
    createdAt: '2018-06-18T00:00:42.784Z',
    title: 'Eve Essex, Kate Monhanty, Ben Jaffe & Abe Maneri',
    slug: 'eve-essex-kate-monhanty-ben-jaffe-and-abe-maneri'
  },
  {
    venue: {
      name: 'Trans Pecos',
      address: '815 Wyckoff Ave',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5ae61aac4f6f62d2ae2c2f5b',
    updatedAt: '2018-04-29T19:19:08.406Z',
    startDate: '2018-05-18T00:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/1808031352832850/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20180517-hesper-meakusma-transpecos.jpg',
        aspect: 0.7685546875
      }
    ],
    createdAt: '2018-04-29T19:19:08.406Z',
    title: 'Hesper, Brian Close, Bryce Hackford, Ghost Producer DJs',
    description: 'Presented by Meakusma (Belguim)',
    slug: 'hesper-brian-close-bryce-hackford-ghost-producer-djs'
  },
  {
    venue: {
      name: 'HOLO',
      address: '1090 Wyckoff Ave.',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a9df8f2018667001471b7d1',
    updatedAt: '2018-03-06T02:12:02.108Z',
    startDate: '2018-05-02T23:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/161258777854490'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/zummo_holo_poster.jpg',
        aspect: 1
      }
    ],
    createdAt: '2018-03-06T02:12:02.108Z',
    title: 'Eve Essex, Luke Moldof, Peter Zummo Quintet',
    description: 'Trombonist and downtown NY legend PETER ZUMMO appears in a quintet with bassist Ernie Brooks, and percussionists Mustafa Ahmed, Bill Ruyle, and Danny Tunick. Zummo recently released of Frame Loop (Foom)-- an archival LP of 1984 collaborations with Ruyle, Ahmed, and Arthur Russell. With support from NY experimental musicians EVE ESSEX (Das Audit) and LUKE MOLDOF, who both perform solo sets; DJ CSD (Moira) appears throughout the night.',
    slug: 'eve-essex-luke-moldof-peter-zummo-quintet'
  },
  {
    venue: {
      name: 'ISSUE Project Room',
      address: '22 Boerum Place',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5b2560ba410f47561f0035e0',
    updatedAt: '2018-06-16T19:10:50.288Z',
    startDate: '2018-04-27T00:00:00.000Z',
    links: [
      {
        title: 'ISSUE Project Room',
        url: 'https://issueprojectroom.org/event/james-k-elektra-scream-through-eyes-statue-eve-essex-app-leila-bordreuil-eli-v-manuscript'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20180426-elektra-issue.jpg',
        aspect: 1.9275590551181103
      }
    ],
    createdAt: '2018-06-16T19:10:50.288Z',
    title: 'James K: Elektra with Eve Essex, Via App, Leila Bordreuil, Eli V Manuscript',
    description: 'Part of James K&#x27;s residency.',
    slug: 'james-k-elektra-with-eve-essex-via-app-leila-bordreuil-eli-v-manuscript'
  },
  {
    venue: {
      name: 'HOLO',
      address: '1090 Wyckoff Ave.',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5ac2f628967d4849048a2c56',
    updatedAt: '2018-04-03T03:34:00.900Z',
    startDate: '2018-04-13T23:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20180413-H0l0.jpg',
        aspect: 1.643939393939394,
        caption: 'Poster by Craig Kalpakjian'
      }
    ],
    createdAt: '2018-04-03T03:34:00.900Z',
    title: 'Das Audit, Ai Isshiki, Brian Chase/Tom Hamilton/David Watson, DJ ALFM',
    slug: 'das-audit-ai-isshiki-brian-chasetom-hamiltondavid-watson-dj-alfm'
  },
  {
    venue: {
      name: 'HOLO',
      address: '1098 Wyckoff Ave.',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a977e375213570014481b14',
    updatedAt: '2018-03-01T04:14:47.863Z',
    startDate: '2018-03-29T00:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/holo show flyer 2.28.18 final.jpg',
        aspect: 0.7440476190476191
      }
    ],
    createdAt: '2018-03-01T04:14:47.863Z',
    title: 'Hesper, Wetware, Melanin Free, Vveiss',
    slug: 'hesper-wetware-melanin-free-vveiss'
  },
  {
    venue: {
      name: 'Machines With Magnets',
      address: '400 Main St.',
      city: 'Pawtucket',
      state: 'RI',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5aabca02d3c7940f890c2f4e',
    updatedAt: '2018-03-16T13:43:30.916Z',
    startDate: '2018-03-25T01:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/461024097646829/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20180324-Eve-Kayla-Providence.jpg',
        aspect: 0.646484375
      }
    ],
    createdAt: '2018-03-16T13:43:30.916Z',
    title: 'Eve Essex, Kayla Guthrie, Statues of Eden, N.Renea',
    slug: 'eve-essex-kayla-guthrie-statues-of-eden-nrenea'
  },
  {
    venue: {
      name: 'Root Cellar',
      address: '10 Fiske Ave.',
      city: 'Greenfield',
      state: 'MA',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a94ae16d37489001459b3f9',
    updatedAt: '2018-02-27T01:02:14.735Z',
    startDate: '2018-03-11T23:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/351916201988697/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20180311-GreenfieldMA.jpg',
        aspect: 1
      }
    ],
    createdAt: '2018-02-27T01:02:14.735Z',
    title: 'Eve Essex, Kayla Guthrie, Bentley Anderson, Noise Nomads',
    slug: 'eve-essex-kayla-guthrie-bentley-anderson-noise-nomads'
  },
  {
    venue: {
      name: 'Outpost Artists Resources',
      address: '1665 Norman St.',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a864134dfc1483771a212fe',
    updatedAt: '2018-02-16T02:25:56.272Z',
    startDate: '2018-03-11T01:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/eve_essex_release_poster_web.jpg',
        aspect: 0.6734216679657054
      }
    ],
    createdAt: '2018-02-16T02:25:56.272Z',
    title: 'Eve Essex, Kayla Guthrie, MV Carbon, Emily Shinada, DJ Gretta',
    description: 'Outpost Artists resources presents an evening of performances featuring musicians Eve Essex, Kayla Guthrie, MV Carbon, Providence, RI-based performance/video artist Emily Shinada, and DJ Gretta. The event celebrates the release of the cassette Here Appear on Soap Library, the first solo album by Brooklyn-based musician Eve Essex, and closes an East Coast tour by Essex and Kayla Guthrie.',
    slug: 'eve-essex-kayla-guthrie-mv-carbon-emily-shinada-dj-gretta'
  },
  {
    venue: {
      name: 'Wuthering Heights',
      city: 'Baltimore',
      state: 'MD',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a91f499b4ec394bb30597e8',
    updatedAt: '2018-02-24T23:26:17.757Z',
    startDate: '2018-03-05T01:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/WaxingWaningFlyer.jpg',
        aspect: 0.7909371781668383
      }
    ],
    createdAt: '2018-02-24T23:26:17.757Z',
    title: 'Eve Essex, Kayla Guthrie, Melanin Free, Infinity Knives & Randi, alienood420',
    slug: 'eve-essex-kayla-guthrie-melanin-free-infinity-knives-and-randi-alienood420'
  },
  {
    venue: {
      name: 'Lacquer',
      city: 'Philadelphia',
      state: 'PA',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a65321e44eea0c8e638c00b',
    updatedAt: '2018-01-22T00:36:46.418Z',
    startDate: '2018-03-02T01:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/IMG_3998.jpg',
        aspect: 1
      }
    ],
    createdAt: '2018-01-22T00:36:46.418Z',
    title: 'Eve Essex, Kayla Guthrie, extant, Slack, Control Point',
    description: 'Here Appear release tour',
    slug: 'eve-essex-kayla-guthrie-extant-slack-control-point'
  },
  {
    venue: {
      name: "Wendy's Subway",
      address: '379 Bushwick Ave',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a7a655c714c3b0014d55637',
    updatedAt: '2018-02-07T02:33:00.209Z',
    startDate: '2018-02-23T01:00:00.000Z',
    links: [],
    images: [],
    createdAt: '2018-02-07T02:33:00.209Z',
    title: 'Eve Essex, EXISTERS',
    description: 'A night of sound with free-ambient trio EXISTERS from Winnipeg, Canada.',
    slug: 'eve-essex-existers'
  },
  {
    venue: {
      name: 'Secret Project Robot',
      address: '1186 Broadway',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a568c6ad3ad9c0014afd3f8',
    updatedAt: '2018-01-10T21:58:02.054Z',
    startDate: '2018-02-03T01:00:00.000Z',
    links: [
      {
        title: 'Secret Project Robot',
        url: 'https://www.secretprojectrobot.org/calendar/2018/2/2/wolf-eyes-residency'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/Screen Shot 2018-01-10 at 8.07.10 PM.png',
        aspect: 1.4363636363636363
      }
    ],
    createdAt: '2018-01-10T21:58:02.054Z',
    title: 'HEVM, Dreamcrusher, Eric Copeland, Wolf Eyes',
    description: 'HEVM (MV Carbon, Eve Essex, Hunter Hunt-Hendrix) appear as part of a Wolf Eyes&#x27; residency at Secret Project Robot, the event takes place inside an installation by Monica Mirabile.',
    slug: 'hevm-dreamcrusher-eric-copeland-wolf-eyes'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Ridgewood',
      address: '1090 Wyckoff Ave',
      name: 'Holo'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a0a60d48dcb886c6a1ab1df',
    updatedAt: '2017-11-14T03:19:48.185Z',
    startDate: '2018-02-01T00:00:00.000Z',
    links: [
      {
        title: 'Facebook Event',
        url: 'https://www.facebook.com/events/1505422539549739/'
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/2018-01-04-Eve-Essex-Holo.jpg',
        aspect: 0.8
      }
    ],
    createdAt: '2017-11-14T03:19:48.185Z',
    title: 'Eve Essex, Kate Monhanty, Ben Jaffe',
    slug: 'eve-essex-kate-monhanty-ben-jaffe'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '94 Scott Ave.',
      name: "Honey's"
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59f29d656c8caa00121a5590',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20171117-cixous72-eve-essex-honeys.jpg',
        aspect: 0.7724609375
      }
    ],
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/219351125268934'
      }
    ],
    updatedAt: '2017-10-27T02:43:49.349Z',
    createdAt: '2017-10-27T02:43:49.349Z',
    startDate: '2017-11-18T01:00:00.000Z',
    title: 'Eve Essex, David Wesley Sutton, Valise, DJ pure',
    description: 'Celebrating Cixous72&#x27;s two-year anniversary.',
    slug: 'eve-essex-david-wesley-sutton-valise-dj-pure'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Ridgewood',
      address: '815 Wyckoff Ave.',
      name: 'Trans Pecos'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59c45bf0afabe03d91df9d7e',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/eve poster.jpg',
        aspect: 0.8354333715158457
      }
    ],
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/122890601707216/'
      }
    ],
    updatedAt: '2017-09-22T00:40:16.986Z',
    createdAt: '2017-09-22T00:40:16.986Z',
    startDate: '2017-10-20T00:00:00.000Z',
    title: 'Eve Essex, YATTA, Melanin Free, Jake Becker, DJ James Place',
    description: 'Presented by WNYU',
    slug: 'eve-essex-yatta-melanin-free-jake-becker-dj-james-place'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '484 Union Ave',
      name: 'Union Pool'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59c06c59b9892846f0a61f6b',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20171010-DasAudit-UnionPool.jpg',
        aspect: 0.64697265625
      }
    ],
    links: [
      {
        title: 'Union Pool',
        url: 'http://www.union-pool.com/event/1561684-das-audit-brooklyn/'
      }
    ],
    updatedAt: '2017-09-19T01:01:13.484Z',
    createdAt: '2017-09-19T01:01:13.484Z',
    startDate: '2017-10-11T00:00:00.000Z',
    title: 'Das Audit, Noise Nomads, Outside World, Bentley Anderson',
    slug: 'das-audit-noise-nomads-outside-world-bentley-anderson'
  },
  {
    venue: {
      country: '',
      state: '',
      city: 'Washington D.C.',
      address: '6950 Maple Street NW',
      name: 'Rhizome'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5999f94eb685570011157443',
    links: [
      {
        title: 'dc-soniccircuits.org',
        url: 'http://dc-soniccircuits.org/festival/2017/'
      }
    ],
    updatedAt: '2017-08-20T21:04:14.108Z',
    createdAt: '2017-08-20T21:04:14.108Z',
    startDate: '2017-09-16T00:00:00.000Z',
    title: 'HEVM at Sonic Circuits Fest',
    description: 'Lineup: Ryan Keberle &amp; Catharsis, HEVM (MV Carbon / Eve Essex / Hunter Hunt-Hendrix), Geoff Wilt, Jax Delucas.',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20170915-hevm-sonicCircuits-dc.png',
        aspect: 0.6711409395973155
      }
    ],
    slug: 'hevm-at-sonic-circuits-fest'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '93 Scott Ave.',
      name: "Honey's"
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5999fdd9fffcfd064db2a0c1',
    links: [],
    updatedAt: '2017-08-20T21:23:37.675Z',
    createdAt: '2017-08-20T21:23:37.675Z',
    startDate: '2017-09-13T00:00:00.000Z',
    title: 'HEVM, Mysterious House, KIZU, Elle Erdman, dj GRETTA',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20170912-hevm-mysteriousHouse-kizu-elleErdman-honeys.jpg',
        aspect: 1.24068,
        caption: 'Poster by Gretta Johnson'
      }
    ],
    description: '<p>A night of multidisciplinary live performance featuring:</p><p>* Choreography by Elle Erdman, danced by Elle and Elanor</p><p>** KIZU (performance by Alison Kizu-Blair)</p><p>*** Mysterious House (lush electronic sounds of James Mercer)</p><p>**** HEVM (trio of MV Carbon, Eve Essex, Hunter Hunt-Hendrix)</p><p>Also featuring Japanese food by Takoyaki Pop-Up</p>',
    slug: 'hevm-mysterious-house-kizu-elle-erdman-dj-gretta'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '',
      name: 'The Glove'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: ['5a0a80bb8dcb886c6a1ab1e1'],
    isPublished: true,
    _id: '5999fb0bfffcfd064db2a08e',
    links: [],
    updatedAt: '2017-08-20T21:11:39.644Z',
    createdAt: '2017-08-20T21:11:39.644Z',
    startDate: '2017-08-14T00:00:00.000Z',
    title: 'Hesper, Sister Mantos, Private Time, David Mramor, Grisel Lopez',
    description: 'Presented by Bernard Herman.',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20170813-Hesper-glove-nyc.jpg',
        aspect: 1,
        caption: 'Poster by Barkev Gusselarian'
      }
    ],
    slug: 'hesper-sister-mantos-private-time-david-mramor-grisel-lopez'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '93 Scott Ave.',
      name: "Honey's"
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: ['5a0a80bb8dcb886c6a1ab1e1'],
    isPublished: true,
    _id: '5999fb6bfffcfd064db2a08f',
    links: [],
    updatedAt: '2017-08-20T21:13:15.791Z',
    createdAt: '2017-08-20T21:13:15.791Z',
    startDate: '2017-08-11T00:00:00.000Z',
    title: 'Hesper, Leila Bordreuil & Zach Rowden, NYCDBOS, dj GRETTA',
    description: 'Hesper appears as a duo, Eve Essex &amp; James K.',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/honeys-poster-20170810.jpg',
        aspect: 1
      }
    ],
    slug: 'hesper-leila-bordreuil-and-zach-rowden-nycdbos-dj-gretta'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Ridgewood',
      address: '1090 Wyckoff Ave.',
      name: 'HOLO'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5999fc33fffcfd064db2a091',
    links: [],
    updatedAt: '2017-08-20T21:16:35.463Z',
    createdAt: '2017-08-20T21:16:35.463Z',
    startDate: '2017-07-15T00:00:00.000Z',
    title: 'Das Audit, Blue Jazz TV, Bentley Anderson trio',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20170714-DasAudit-BentleyAnderson-BlueJazzTV.jpg',
        aspect: 1.4136125654450262,
        caption: 'Poster by Craig Kalpakjian'
      }
    ],
    slug: 'das-audit-blue-jazz-tv-bentley-anderson-trio'
  },
  {
    venue: {
      name: 'Greene Naftali',
      address: '508 W 26th St.',
      city: 'NYC',
      state: 'NY',
      country: ''
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5999fcaefffcfd064db2a092',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/310984852689110'
      }
    ],
    updatedAt: '2017-08-20T21:18:38.137Z',
    createdAt: '2017-08-20T21:18:38.137Z',
    startDate: '2017-06-24T00:00:00.000Z',
    title: 'Das Audit x Gelatin, Horse Lords, Straw Pipes',
    description: 'Das Audit (Eve Essex &amp; Craig Kalpakjian) perform as a duo and in collaboration with drummer Nathan Gwynne and members of Gelatin.',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/DasAudit-by-AnnaZanes.jpg',
        aspect: 1.4906832298136645,
        caption: 'Photo by Anna Zanes'
      }
    ],
    slug: 'das-audit-x-gelatin-horse-lords-straw-pipes'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '469 President St.',
      name: 'Gowanus E-Waste Warehouse'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5999fc31fffcfd064db2a090',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/942940939179684'
      }
    ],
    updatedAt: '2017-08-20T21:16:33.277Z',
    createdAt: '2017-08-20T21:16:33.277Z',
    startDate: '2017-06-14T23:00:00.000Z',
    title: 'Das Audit at Monument',
    description: 'Das Audit (Eve Essex &amp; Craig Kalpakjian) perform two sets as part of an evening of place-based, site specific installation, video, and music, using the e-waste found on-site (including CRT TVs; broken flat screen TVs; electrical cords; sound equipment; and various musical instruments). Featuring Constant Dullaart, Motoko Fukuyama, Elana Herzog, Faith Holland, Charles Sainty, Jean Shin, and Penelope Umbrico. Organized by Yazmine Mihojevich and Penelope Umbrico.',
    images: [],
    slug: 'das-audit-at-monument'
  },
  {
    venue: {
      country: 'Germany',
      state: '',
      city: 'Berlin',
      address: 'Veteranenstraße 21',
      name: 'ACUD Macht Neu'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5999fcb0fffcfd064db2a093',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/190892858089370'
      }
    ],
    updatedAt: '2017-08-20T21:18:40.370Z',
    createdAt: '2017-08-20T21:18:40.370Z',
    startDate: '2017-05-05T00:00:00.000Z',
    title: 'Sky Walking Presents: Hesper, Schluss',
    description: 'Presented by Sky Walking',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20170504-SkyWalking-Hesper-Acud.jpg',
        aspect: 1.1769521410579344
      }
    ],
    slug: 'sky-walking-presents-hesper-schluss'
  },
  {
    venue: {
      country: 'Germany',
      state: '',
      city: 'Berlin',
      address: '8 Grüntaler Straße',
      name: 'Studioacht'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5999fdd7fffcfd064db2a0c0',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/776558092504748'
      }
    ],
    updatedAt: '2017-08-20T21:23:35.310Z',
    createdAt: '2017-08-20T21:23:35.310Z',
    startDate: '2017-05-01T00:00:00.000Z',
    title: 'Eve Essex, Zicla, Felicity Mangan',
    images: [],
    slug: 'eve-essex-zicla-felicity-mangan'
  },
  {
    venue: {
      country: 'Germany',
      state: '',
      city: 'Berlin',
      address: 'Skalitzer Str. 133',
      name: 'West Germany Venue'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5999ff1efffcfd064db2a0c4',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/1775745059406270'
      }
    ],
    updatedAt: '2017-08-20T21:29:02.624Z',
    createdAt: '2017-08-20T21:29:02.624Z',
    startDate: '2017-04-24T00:00:00.000Z',
    title: 'Hesper, Wilted Woman, IRUUUUUUUU?',
    description: 'Debut live show of Hesper (Eve Essex / James K). Release show for Wilted Woman&#x27;s Diary Of A Woman LP on She Rocks.',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20170427-Hesper-WiltedWoman-berlin.jpg',
        aspect: 2.951
      }
    ],
    slug: 'hesper-wilted-woman-iruuuuuuuu'
  },
  {
    venue: {
      country: '',
      state: '',
      city: 'NYC',
      address: '158 Bleecker St.',
      name: 'Le Poisson Rouge'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '599a306f76d9290011967f7e',
    links: [
      {
        url: 'http://tonyconrad.memorial'
      }
    ],
    updatedAt: '2017-08-21T00:59:27.625Z',
    createdAt: '2017-08-21T00:59:27.625Z',
    startDate: '2017-04-09T23:30:00.000Z',
    title: 'HEVM, Charlemagne Palestine & Rhys Chatham, C. Spencer Yeh',
    images: [],
    slug: 'hevm-charlemagne-palestine-and-rhys-chatham-c-spencer-yeh'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Maspeth',
      address: '52-19 Flushing Ave.',
      name: 'Knockdown Center'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '599a37a1e1bba41725b0f38c',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20170408-Tony-Conrad-Memorial.jpg',
        aspect: 1.5
      }
    ],
    links: [
      {
        url: 'http://tonyconrad.memorial'
      }
    ],
    updatedAt: '2017-08-21T01:30:09.682Z',
    createdAt: '2017-08-21T01:30:09.682Z',
    startDate: '2017-04-09T02:30:00.000Z',
    title: 'Das Audit, David Grubbs & Eli Keszler, Mary Jordan',
    description: 'Das Audit and friends appear in tribute to Tony Conrad.',
    slug: 'das-audit-david-grubbs-and-eli-keszler-mary-jordan'
  },
  {
    venue: {
      country: '',
      state: '',
      city: 'NYC',
      address: '172 Forsyth St.',
      name: 'Commend'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5999ff1cfffcfd064db2a0c3',
    links: [],
    updatedAt: '2017-08-20T21:29:00.501Z',
    createdAt: '2017-08-20T21:29:00.501Z',
    startDate: '2017-03-24T23:00:00.000Z',
    title: 'Eve Essex, Jake Becker',
    description: 'Release show for Jake Becker&#x27;s &quot;dial down sound&quot; on Soap Library.',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20170324-EveEssex-JakeBecker-Commend.jpg',
        aspect: 1.0005333333333333
      }
    ],
    slug: 'eve-essex-jake-becker'
  },
  {
    venue: {
      name: 'The Sump',
      address: '1563 Decatur St.',
      city: 'Ridgewood',
      state: 'NY',
      country: ''
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a3138db91053612b01aa40',
    links: [],
    updatedAt: '2017-08-27T18:46:37.394Z',
    createdAt: '2017-08-27T18:46:37.394Z',
    startDate: '2017-03-24T00:00:00.000Z',
    title: 'HEVM, Ka Baird, Twig Harper',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/hevm_kabaird_twigharper_sump.jpg',
        aspect: 1.301,
        caption: 'Poster by Justin Q Martin'
      }
    ],
    slug: 'hevm-ka-baird-twig-harper'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Ridgewood',
      address: '1665 Norman St.',
      name: 'Outpost'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a3138fb91053612b01aa41',
    links: [],
    updatedAt: '2017-08-27T18:46:39.548Z',
    createdAt: '2017-08-27T18:46:39.548Z',
    startDate: '2017-01-27T01:00:00.000Z',
    title: 'Das Audit, Che Chen & Amirtha Kidambi, Owen Gardner',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20170126-DasAudit-FireOverHeaven.jpg',
        aspect: 0.607
      }
    ],
    slug: 'das-audit-che-chen-and-amirtha-kidambi-owen-gardner'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'NYC',
      address: '15 Gramercy Park S.',
      name: 'National Arts Club'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a1cc6398244300116c754c',
    links: [],
    updatedAt: '2017-08-26T19:30:43.278Z',
    createdAt: '2017-08-26T19:30:43.278Z',
    startDate: '2016-12-16T01:00:00.000Z',
    title: 'Das Audit, Lary 7 + more',
    description: 'Blank Forms &amp; Audio Visual Arts Holiday Party',
    images: [],
    slug: 'das-audit-lary-7-more'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Ridgewood',
      address: '1563 Decatur St.',
      name: 'The Sump'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a314d0b91053612b01aa43',
    links: [],
    updatedAt: '2017-08-27T18:52:00.896Z',
    createdAt: '2017-08-27T18:52:00.896Z',
    startDate: '2016-12-08T01:00:00.000Z',
    title: 'Das Audit, Blue Jazz TV, Grady Owens',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20161206-DasAudit-BlueJazzTv-GradyOwens.jpg',
        aspect: 1.476923076923077
      }
    ],
    slug: 'das-audit-blue-jazz-tv-grady-owens'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'NYC',
      address: '83 Pitt St.',
      name: ''
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a314ceb91053612b01aa42',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/555138908027614'
      }
    ],
    updatedAt: '2017-08-27T18:51:58.594Z',
    createdAt: '2017-08-27T18:51:58.594Z',
    startDate: '2016-11-04T00:00:00.000Z',
    title: 'Das Audit at Dojo West',
    description: 'Performances by Cammisa Buerhaus, Das Audit, Alan Licht, Roger Van Voorhees, The FPBJPC quintet. Organized by Benjamin G. Scott.',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/2016-DasAudit-pitt-st.jpg',
        aspect: 1.4691535150645625,
        caption: 'Poster Image by Rose Marcus'
      }
    ],
    slug: 'das-audit-at-dojo-west'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '',
      name: 'The Glove'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a3152cb91053612b01aa44',
    links: [],
    updatedAt: '2017-08-27T18:53:32.253Z',
    createdAt: '2017-08-27T18:53:32.253Z',
    startDate: '2016-11-01T00:00:00.000Z',
    title: "Eve Essex at Bernard Herman's Halloween",
    description: 'Macula Dog, The Coincidenal Hour, Eve Essex, Orlando Estrada, Kayla Guthrie, BOBO, Katie Vida, Dean Cercone, and Bernard Herman. Dj&#x27;s Semita Serpens &amp; Edward Chimera.',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20161031-EveEssex-BernardHermanHalloween.jpg',
        aspect: 0.7733333333333333
      }
    ],
    slug: 'eve-essex-at-bernard-hermans-halloween'
  },
  {
    venue: {
      country: '',
      state: 'RI',
      city: 'Providence',
      address: '25 Manton Ave.',
      name: ''
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a37219aa77e676a0b327aa',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/197260260691596/'
      }
    ],
    updatedAt: '2017-08-28T01:30:01.294Z',
    createdAt: '2017-08-28T01:30:01.294Z',
    startDate: '2016-09-24T18:00:00.000Z',
    title: 'Eve Essex at PUFFERSS V',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/2016-PUFFERSSV.jpg',
        aspect: 1.7777777777777777
      }
    ],
    slug: 'eve-essex-at-pufferss-v'
  },
  {
    venue: {
      name: 'Trans Pecos',
      address: '815 Wyckoff Ave',
      city: 'Ridgewood',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a6d2b300d779300147bd1b4',
    updatedAt: '2018-01-28T01:45:20.554Z',
    startDate: '2016-08-11T00:00:00.000Z',
    links: [
      {
        title: 'Facebook Event',
        url: 'https://www.facebook.com/events/1411250685556670/'
      }
    ],
    images: [],
    createdAt: '2018-01-28T01:45:20.554Z',
    title: 'Eve Essex, Jordonna, Signal Break, Weeping Icon, CE Schneider',
    slug: 'eve-essex-jordonna-signal-break-weeping-icon-ce-schneider'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Brooklyn',
      address: '1031 Grand St',
      name: 'Sunnyvale'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a6d2acc99bc3a4476aa51d5',
    updatedAt: '2018-01-28T01:43:40.105Z',
    startDate: '2016-08-07T00:00:00.000Z',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/584028391775416/'
      }
    ],
    images: [],
    createdAt: '2018-01-28T01:43:40.105Z',
    title: 'Eve Essex, Kel Valhaal, Contessa Stuto, Soren Roi, VBA, DJ Unsay',
    description: 'Record release show for Kel Valhaal album New Introductory Lectures on the System of Transcendental Qabala.',
    slug: 'eve-essex-kel-valhaal-contessa-stuto-soren-roi-vba-dj-unsay'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'NYC',
      address: '55 Walker St.',
      name: 'Artists Space'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a324f2f6e9da6918fe1fef',
    links: [
      {
        title: 'Artists Space',
        url: 'http://artistsspace.org/programs/neon'
      }
    ],
    updatedAt: '2017-08-27T20:00:50.083Z',
    createdAt: '2017-08-27T20:00:50.083Z',
    startDate: '2016-07-13T23:00:00.000Z',
    description: 'Artists Space presents as it if it is to be, a commissioned neon by artist Eve Fowler, accompanied by a set of songs and improvisations by Brooklyn-based artist and musician Eve Essex, with projections created by Justin Q. Martin.',
    title: 'NEON: Eve Essex, Eve Fowler',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20160715-EveEssex-EveFowler-ArtistsSpace.jpg',
        aspect: 0.7874015748031497
      }
    ],
    slug: 'neon-eve-essex-eve-fowler'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '221 Nassau Ave.',
      name: 'Sunview Luncheonette'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a38e376b739a7c30af71e0',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20160709-EveEssex-SunviewLuncheonette.jpg',
        aspect: 0.6073684210526316
      }
    ],
    links: [],
    updatedAt: '2017-08-28T03:29:59.865Z',
    createdAt: '2017-08-28T03:29:59.865Z',
    startDate: '2016-07-09T17:00:00.000Z',
    title: 'Eve Essex, Mai Mai, Jun-Y Ciao',
    description: 'Afternoon show featuring experimental composers in visiting from Beijing. Che Chen&#x27;s gazpacho &amp; guacamole at 1, music at 2.',
    slug: 'eve-essex-mai-mai-jun-y-ciao'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Ridgewood',
      address: '1563 Decatur St.',
      name: 'The Sump'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a38f456b739a7c30af71e1',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20160622-EveEssex-MysteriousHouse-BobBellerue-RossChait.jpg',
        aspect: 0.7276641550053822
      }
    ],
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/1628594964128501'
      }
    ],
    updatedAt: '2017-08-28T03:34:29.859Z',
    createdAt: '2017-08-28T03:34:29.859Z',
    startDate: '2016-06-23T00:00:00.000Z',
    title: 'Eve Essex, Ross Chait, Bob Bellerue, Mysterious House',
    slug: 'eve-essex-ross-chait-bob-bellerue-mysterious-house'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Long Island City',
      address: '',
      name: 'SculptureCenter'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a37496aa77e676a0b327f3',
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/1112369928835698'
      }
    ],
    updatedAt: '2017-08-28T01:40:38.902Z',
    createdAt: '2017-08-28T01:40:38.902Z',
    startDate: '2016-06-18T21:00:00.000Z',
    description: 'Abdu Ali / Das Audit / Cayman / Gooddroid B2B quest?onmarc',
    title: 'Das Audit at Holding Space',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20160718-DasAudit-HoldingSpace.jpg',
        aspect: 1
      }
    ],
    slug: 'das-audit-at-holding-space'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Ridgewood',
      address: '855 Wyckoff Ave',
      name: 'Trans Pecos'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59a3650bb03bd36d02734b12',
    links: [
      {
        title: 'Facebook Event',
        url: 'https://www.facebook.com/events/366599603463955'
      }
    ],
    updatedAt: '2017-08-28T00:34:19.111Z',
    createdAt: '2017-08-28T00:34:19.111Z',
    startDate: '2016-06-15T00:00:00.000Z',
    title: 'Das Audit, Tashi Dorji & Tyler Damon, Greg Fox, Leila Bordreuil',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20160614-DasAudit-TashiDorji.jpg',
        aspect: 1.2,
        caption: 'Poster by Craig Kalpakjian'
      }
    ],
    slug: 'das-audit-tashi-dorji-and-tyler-damon-greg-fox-leila-bordreuil'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '29 Ash St.',
      name: 'U.S. Blues'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '59fd1687f36528064766edc8',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/06052016-EveEssex-UsBlues.jpg',
        aspect: 0.7068965517241379
      }
    ],
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/274203306264112/'
      }
    ],
    updatedAt: '2017-11-04T01:23:19.404Z',
    createdAt: '2017-11-04T01:23:19.404Z',
    startDate: '2016-06-06T00:00:00.000Z',
    title: 'Eve Essex',
    description: 'In conjunction with Matthew Schrader&#x27;s exhibition &quot;methods of charging&quot;.',
    slug: 'eve-essex'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Ridgewood',
      address: '1563 Decatur St.',
      name: 'The Sump'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a028b8641c58900120bc512',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/2016-DasAudit-VBA-Drome-CrucifixTrio .jpg',
        aspect: 1.2066666666666668,
        caption: 'Poster by Craig Kalpakjian'
      }
    ],
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/263973597279922/'
      }
    ],
    updatedAt: '2017-11-08T04:43:50.806Z',
    createdAt: '2017-11-08T04:43:50.806Z',
    startDate: '2016-05-14T00:00:00.000Z',
    title: 'Das Audit, VBA, Drome, Crucifix Trio',
    slug: 'das-audit-vba-drome-crucifix-trio'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '915 Wyckoff Ave.',
      name: 'Trans Pecos'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a028c6541c58900120bc546',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20160418-EveEssex-JamesK-ViaApp-RichardFellyd.jpg',
        aspect: 0.7724609375
      }
    ],
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/113007032429990/'
      }
    ],
    updatedAt: '2017-11-08T04:47:33.026Z',
    createdAt: '2017-11-08T04:47:33.026Z',
    startDate: '2016-04-19T00:00:00.000Z',
    title: 'Eve Essex, Richard Fellyd, Via App, James K',
    description: 'James K Release Show, all live acts.',
    slug: 'eve-essex-richard-fellyd-via-app-james-k'
  },
  {
    venue: {
      name: 'Character Projects',
      address: '6042 Monte Vista St',
      city: 'Los Angeles',
      state: 'CA',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a56ef3c840840f1063b87cf',
    updatedAt: '2018-01-11T04:59:40.615Z',
    startDate: '2016-03-27T00:00:00.000Z',
    links: [],
    images: [],
    createdAt: '2018-01-11T04:59:40.615Z',
    title: 'Eve Essex, Max Markowitz, Rats',
    description: 'Eve Essex West Coast debut!',
    slug: 'eve-essex-max-markowitz-rats'
  },
  {
    venue: {
      name: 'Machines With Magnets',
      address: '400 Main St.',
      city: 'Pawtucket',
      state: 'RI',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5aad819965cdab00141e2f22',
    updatedAt: '2018-03-17T20:59:05.932Z',
    startDate: '2016-03-20T00:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20160319-Essex-Guthrie-Machines.jpg',
        aspect: 0.77294921875
      }
    ],
    createdAt: '2018-03-17T20:59:05.932Z',
    title: 'Eve Essex, Kayla Guthrie, Bridget Feral, Tim Rovinelli',
    slug: 'eve-essex-kayla-guthrie-bridget-feral-tim-rovinelli'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Ridgewood',
      address: '1563 Decatur St.',
      name: 'The Sump'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a028dce41c58900120bc554',
    images: [],
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/586978821453684'
      }
    ],
    updatedAt: '2017-11-08T04:53:34.242Z',
    createdAt: '2017-11-08T04:53:34.242Z',
    startDate: '2016-02-24T01:00:00.000Z',
    title: 'Eve Essex & Dan Fox, David First, Chuck Bettis & Dafna Naphtali ',
    slug: 'eve-essex-and-dan-fox-david-first-chuck-bettis-and-dafna-naphtali'
  },
  {
    venue: {
      country: '',
      state: 'NY',
      city: 'Brooklyn',
      address: '1004 Metropolitan Ave.',
      name: 'Safe Gallery'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a028e8e41c58900120bc57c',
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/201502-EveEssex-SafeGallery.jpg',
        aspect: 0.7727272727272727
      }
    ],
    links: [
      {
        title: 'Facebook event',
        url: 'https://www.facebook.com/events/235101790162104/'
      }
    ],
    updatedAt: '2017-11-08T04:56:46.004Z',
    createdAt: '2017-11-08T04:56:46.004Z',
    startDate: '2016-02-13T01:00:00.000Z',
    title: 'Eve Essex, Liam Baranauskas',
    description: 'Closing party for Gretta Johnson and Andy Cahill&#x27;s exhibition.',
    slug: 'eve-essex-liam-baranauskas'
  },
  {
    venue: {
      name: 'Signal',
      address: '260 Johnson Ave.',
      city: 'Brooklyn',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a5a71e7e54a2a43581b3a9e',
    updatedAt: '2018-01-13T20:53:59.217Z',
    startDate: '2016-01-29T01:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20160128-EveEssex-Intra_Phenom.jpg',
        aspect: 0.8
      }
    ],
    createdAt: '2018-01-13T20:53:59.217Z',
    title: 'Eve Essex, Marcelline, James K, Diamond Stingily',
    description: 'Part of Intra Phenom: Live Presence, organized by Kayla Guthrie.',
    slug: 'eve-essex-marcelline-james-k-diamond-stingily'
  },
  {
    venue: {
      name: 'Trans Pecos',
      address: '815 Wyckoff Ave',
      city: 'Queens',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5a6d2ae30d779300147bd1b3',
    updatedAt: '2018-01-28T01:44:03.384Z',
    startDate: '2015-07-21T00:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/20150720-EveEssexDanFox-TransPecos.jpg',
        aspect: 0.7591240875912408
      }
    ],
    createdAt: '2018-01-28T01:44:03.384Z',
    title: 'Eve Essex & Dan Fox, Aki Onda, KIZU, Subnet, DJ Sean Keenan',
    slug: 'eve-essex-and-dan-fox-aki-onda-kizu-subnet-dj-sean-keenan'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Brooklyn',
      address: '159 Pioneer St.',
      name: 'Pioneer Works'
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c57b136ddb9ea0029d9d06a',
    slug: 'das-audit-featuring-malcolm-mooney-borbetomagus-j-mascis-dead-moon',
    updatedAt: '2019-02-04T03:27:50.804Z',
    startDate: '2015-06-21T00:00:00.000Z',
    links: [
      {
        title: 'ISSUE Project Room',
        url: 'https://issueprojectroom.org/event/dead-moon-j-mascis-borbetomagus-das-audit'
      }
    ],
    images: [],
    createdAt: '2019-02-04T03:27:50.804Z',
    title: 'Das Audit featuring Malcolm Mooney, Borbetomagus, J Mascis, Dead Moon'
  },
  {
    venue: {
      country: undefined,
      state: 'NY',
      city: 'Brooklyn',
      address: '146 Broadway',
      name: "Baby's All Right"
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c57afb0ddb9ea0029d9d068',
    slug: 'das-audit-peter-gordon-directs-arthur-russell-s-instrumentals-blue-jazz-tv-diamond-terrifier-michael-beharie-vhvl',
    updatedAt: '2019-02-04T03:21:20.462Z',
    startDate: '2015-05-20T00:00:00.000Z',
    links: [],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/11159563_674098929122_6956826257947266628_n (1).jpg',
        aspect: 0.647191011235955
      }
    ],
    createdAt: '2019-02-04T03:21:20.462Z',
    title: "Das Audit, Peter Gordon directs Arthur Russell's Instrumentals, Blue Jazz TV, Diamond Terrifier/Michael Beharie/VHVL"
  },
  {
    venue: {
      name: 'SculptureCenter',
      address: '44–19 Purves Street',
      city: 'Long Island City',
      state: 'NY',
    },
    isAllDay: false,
    embedCodes: [],
    projectIds: [],
    isPublished: true,
    _id: '5c57b377ddb9ea0029d9d06c',
    slug: 'das-audit-01',
    updatedAt: '2019-02-04T03:37:27.821Z',
    startDate: '2015-03-07T21:00:00.000Z',
    links: [
      {
        title: 'SculptureCenter',
        url: 'https://www.sculpture-center.org/events/885/das-audit',
      }
    ],
    images: [
      {
        url: 'https://eve-portfolio.s3.amazonaws.com/DasAudit_byRebecca Naegele_2014.jpg',
        aspect: 1.5003750937734435,
        caption: 'Das Audit by Rebecca Naegele',
      }
    ],
    createdAt: '2019-02-04T03:37:27.821Z',
    title: 'Das Audit',
    description: 'New compositions commissioned as part of the &quot;In Practice&quot; program.'
  }
]
