import { releaseFixtureAlbum } from '@/lib/releases/fixtures'
import {
  formattedItemTitle,
  formattedItemType
} from '@/ui/format/items'

describe('formattedItemTitle', () => {
  it("prefers a release's display artist (its override or project name)", () => {
    expect(
      formattedItemTitle({
        ...releaseFixtureAlbum,
        artist: undefined,
        displayArtist: 'Joe Smith'
      })
    ).toBe(`Joe Smith: ${releaseFixtureAlbum.title}`)
  })

  it('falls back to the stored artist', () => {
    expect(formattedItemTitle(releaseFixtureAlbum)).toBe(
      `${releaseFixtureAlbum.artist}: ${releaseFixtureAlbum.title}`
    )
  })

  it('is just the title without an artist', () => {
    expect(
      formattedItemTitle({
        ...releaseFixtureAlbum,
        artist: undefined
      })
    ).toBe(releaseFixtureAlbum.title)
  })
})

describe('formattedItemType', () => {
  it('keeps the s on a series, singular or plural', () => {
    expect(formattedItemType('eventSeries').trim()).toBe(
      'Event Series'
    )
    expect(formattedItemType('eventSeries', false, true).trim()).toBe(
      'Event Series'
    )
  })

  it('still singularizes other types', () => {
    expect(formattedItemType('radioShow').trim()).toBe('Radio Show')
    expect(formattedItemType('projects').trim()).toBe('Project')
  })
})
