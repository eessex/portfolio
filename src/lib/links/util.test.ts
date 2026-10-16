import {
  compareLinksByDefaultOrder,
  pressLinksFirst
} from '@/lib/links/util'

type OrderedLink = Parameters<
  typeof compareLinksByDefaultOrder
>[0] & {
  id: string
}

describe('compareLinksByDefaultOrder', () => {
  const sortIds = (links: OrderedLink[]) =>
    [...links].sort(compareLinksByDefaultOrder).map(({ id }) => id)

  it('puts press links first, newest first, keeping others in place', () => {
    expect(
      sortIds([
        { id: 'related-a', type: 'default' },
        { id: 'press-old', type: 'press', publishDate: '2020-01-01' },
        { id: 'related-b', type: 'default' },
        { id: 'press-new', type: 'press', publishDate: '2024-01-01' }
      ])
    ).toEqual(['press-new', 'press-old', 'related-a', 'related-b'])
  })

  it('puts quoted press links ahead of unquoted ones, each newest first', () => {
    expect(
      sortIds([
        { id: 'press-new', type: 'press', publishDate: '2024-01-01' },
        {
          id: 'quote-old',
          type: 'press',
          quotation: 'Great',
          publishDate: '2019-01-01'
        },
        { id: 'related', type: 'default' },
        { id: 'press-old', type: 'press', publishDate: '2020-01-01' },
        {
          id: 'quote-new',
          type: 'press',
          quotation: 'Superb',
          publishDate: '2023-01-01'
        }
      ])
    ).toEqual([
      'quote-new',
      'quote-old',
      'press-new',
      'press-old',
      'related'
    ])
  })

  it('falls back to created date for press links with no publish date', () => {
    expect(
      sortIds([
        {
          id: 'published',
          type: 'press',
          publishDate: new Date('2022-01-01')
        },
        {
          id: 'created',
          type: 'press',
          attribution: 'Wire',
          createdAt: new Date('2023-01-01')
        }
      ])
    ).toEqual(['created', 'published'])
  })

  it('treats an undated press draft as newest', () => {
    expect(
      sortIds([
        { id: 'dated', type: 'press', publishDate: '2024-01-01' },
        { id: 'draft-a', type: 'press', attribution: 'Wire' },
        { id: 'draft-b', type: 'press', attribution: 'Mag' }
      ])
    ).toEqual(['draft-a', 'draft-b', 'dated'])
  })

  it('sorts a press link without a quotation, date or attribution as any other', () => {
    expect(
      sortIds([
        { id: 'related', type: 'default' },
        {
          id: 'bare-press',
          type: 'press',
          createdAt: new Date('2024-01-01')
        },
        { id: 'press', type: 'press', publishDate: '2020-01-01' }
      ])
    ).toEqual(['press', 'related', 'bare-press'])
  })
})

describe('pressLinksFirst', () => {
  it('moves press links ahead, keeping saved order within each group', () => {
    expect(
      pressLinksFirst([
        { id: 'press-a', type: 'press', attribution: 'Wire' },
        { id: 'related-a', type: 'default' },
        { id: 'bare-press', type: 'press' },
        { id: 'press-b', type: 'press', quotation: 'Great' },
        { id: 'related-b' }
      ]).map(({ id }) => id)
    ).toEqual([
      'press-a',
      'press-b',
      'related-a',
      'bare-press',
      'related-b'
    ])
  })
})
