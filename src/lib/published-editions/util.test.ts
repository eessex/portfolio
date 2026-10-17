import {
  comparePublishedEditionsByDate,
  extractPublishedEditionEntries,
  publishedEditionEntryError
} from '@/lib/published-editions/util'

const PUBLISHER_ID = '11111111-1111-4111-8111-111111111111'

describe('#extractPublishedEditionEntries', () => {
  it('returns undefined when the picker was not submitted', () => {
    expect(
      extractPublishedEditionEntries({ title: 'x' })
    ).toBeUndefined()
  })

  it('drops untouched blank create forms', () => {
    const entries = extractPublishedEditionEntries({
      'publishedEditions[]': '',
      'publishedEditions[0].format': '',
      'publishedEditions[0].publishDate': '',
      'publishedEditions[1].id': 'edition-1'
    })

    expect(entries).toEqual([{ kind: 'existing', id: 'edition-1' }])
  })

  it('returns an empty list for a submitted, emptied picker', () => {
    expect(
      extractPublishedEditionEntries({ 'publishedEditions[]': '' })
    ).toEqual([])
  })
})

describe('#publishedEditionEntryError', () => {
  const valid = {
    format: 'LP',
    publishDate: '2020-01-01',
    publisherId: PUBLISHER_ID
  }

  it('accepts an existing entry without checking it', () => {
    expect(
      publishedEditionEntryError({ kind: 'existing', id: 'x' }, 0)
    ).toBeUndefined()
  })

  it('accepts a complete edition', () => {
    expect(
      publishedEditionEntryError({ kind: 'new', fields: valid }, 0)
    ).toBeUndefined()
  })

  it('accepts an inline publisher name', () => {
    const { publisherId: _publisherId, ...rest } = valid
    expect(
      publishedEditionEntryError(
        {
          kind: 'new',
          fields: { ...rest, 'publisher.name': 'Soap' }
        },
        0
      )
    ).toBeUndefined()
  })

  it('names the edition and field that is invalid', () => {
    expect(
      publishedEditionEntryError(
        { kind: 'new', fields: { ...valid, format: '' } },
        1
      )
    ).toBe('Edition 2 has an invalid format.')
  })

  it('requires a publisher', () => {
    const { publisherId: _publisherId, ...rest } = valid
    expect(
      publishedEditionEntryError(
        {
          kind: 'edited',
          id: 'x',
          fields: { ...rest, 'publisher.name': ' ' }
        },
        0
      )
    ).toBe('Edition 1 needs a publisher.')
  })
})

describe('#comparePublishedEditionsByDate', () => {
  it('sorts earliest first, dates or input strings alike', () => {
    const editions = [
      { publishDate: '2021-01-01' },
      { publishDate: new Date('2019-01-01') },
      { publishDate: undefined },
      { publishDate: '2020-01-01' }
    ]

    expect(
      editions
        .sort(comparePublishedEditionsByDate)
        .map(
          (e) =>
            e.publishDate && new Date(e.publishDate).getFullYear()
        )
    ).toEqual([2019, 2020, 2021, undefined])
  })
})
