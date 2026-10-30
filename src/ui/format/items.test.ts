import { releaseFixtureAlbum } from '@/lib/releases/fixtures'
import { formattedItemTitle } from '@/ui/format/items'

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
