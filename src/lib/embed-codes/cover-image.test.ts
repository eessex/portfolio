import { fetchEmbedCodeMetadata } from '@/lib/embed-codes/cover-image'
import { EmbedCodeHosts } from '@/lib/embed-codes/schemas/db'
import { uploadBufferToS3 } from '@/lib/images/s3-client'

jest.mock('@/lib/images/s3-client', () => ({
  uploadBufferToS3: jest.fn()
}))
const uploadBufferToS3Mock = jest.mocked(uploadBufferToS3)

// Real resizing is exercised by sharp's own test suite — here we only
// verify our orchestration (both variants get uploaded), so the source
// bytes don't need to be a decodable image.
jest.mock('sharp', () =>
  jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('thumb-bytes'))
  }))
)

describe('fetchEmbedCodeMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetchMock.resetMocks()
  })

  it('resolves a youtube thumbnail via maxresdefault (true aspect, no letterboxing) when available', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        thumbnail_url:
          'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        title: 'The Real Video Title'
      })
    )
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.youtube,
      'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0'
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}&format=json`
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(res.coverImageId).toMatch(/^[\w-]+$/)
    expect(res.title).toBe('The Real Video Title')
    expect(uploadBufferToS3Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'image/jpeg',
        key: `embedCodeCoverImages/${res.coverImageId}.jpg`
      })
    )
    expect(uploadBufferToS3Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'image/jpeg',
        key: `embedCodeCoverImages/${res.coverImageId}_96.jpg`
      })
    )
  })

  it('falls back to the letterboxed hqdefault when youtube has no maxresdefault', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        thumbnail_url:
          'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        title: 'The Real Video Title'
      })
    )
    fetchMock.mockResponseOnce('', { status: 404 })
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.youtube,
      'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0'
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    )
    expect(res.coverImageId).toMatch(/^[\w-]+$/)
    expect(res.title).toBe('The Real Video Title')
  })

  it('resolves a soundcloud thumbnail and title via oEmbed', async () => {
    const src = 'https://api.soundcloud.com/tracks/293'
    fetchMock.mockResponseOnce(
      JSON.stringify({
        thumbnail_url: 'https://i1.sndcdn.com/art.jpg',
        title: 'Some Track'
      })
    )
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.soundcloud,
      src
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(src)}`
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://i1.sndcdn.com/art.jpg'
    )
    expect(res.coverImageId).toMatch(/^[\w-]+$/)
    expect(res.title).toBe('Some Track')
  })

  it('unwraps a soundcloud widget src to the canonical url for oEmbed', async () => {
    const widgetSrc =
      'https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F293&show_artwork=true'
    fetchMock.mockResponseOnce(
      JSON.stringify({
        thumbnail_url: 'https://i1.sndcdn.com/art.jpg'
      })
    )
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.soundcloud,
      widgetSrc
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent('https://api.soundcloud.com/tracks/293')}`
    )
    expect(res.coverImageId).toMatch(/^[\w-]+$/)
  })

  it('unwraps a double-encoded soundcloud URN src to a bare track id', async () => {
    // Real-world src from an older embed: the wrapped url is double
    // percent-encoded and points at a `soundcloud:tracks:{id}` URN
    // rather than a bare numeric id.
    const widgetSrc =
      'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A649527206&color=%23565656&auto_play=false'
    fetchMock.mockResponseOnce(
      JSON.stringify({
        thumbnail_url: 'https://i1.sndcdn.com/art-649527206.jpg'
      })
    )
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.soundcloud,
      widgetSrc
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent('https://api.soundcloud.com/tracks/649527206')}`
    )
    expect(res.coverImageId).toMatch(/^[\w-]+$/)
  })

  it('unwraps a mixcloud widget src to the canonical url for oEmbed', async () => {
    const pageUrl = 'https://www.mixcloud.com/NTSRadio/some-show/'
    const widgetSrc = `https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(pageUrl)}&hide_cover=1`
    fetchMock.mockResponseOnce(
      JSON.stringify({
        image: 'https://thumbnailer.mixcloud.com/art.jpg',
        title: 'Some Show'
      })
    )
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.mixcloud,
      widgetSrc
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `https://www.mixcloud.com/oembed/?format=json&url=${encodeURIComponent(pageUrl)}`
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://thumbnailer.mixcloud.com/art.jpg'
    )
    expect(res.coverImageId).toMatch(/^[\w-]+$/)
    expect(res.title).toBe('Some Show')
  })

  it('unwraps a spotify embed src to the canonical url for oEmbed', async () => {
    const embedSrc =
      'https://open.spotify.com/embed/track/7GhIk7Il098yCjg4BQjzvb?utm_source=oembed'
    fetchMock.mockResponseOnce(
      JSON.stringify({
        thumbnail_url: 'https://image-cdn-fa.spotifycdn.com/art.jpg',
        title: 'Some Song'
      })
    )
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.spotify,
      embedSrc
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `https://open.spotify.com/oembed?url=${encodeURIComponent('https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb?utm_source=oembed')}`
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://image-cdn-fa.spotifycdn.com/art.jpg'
    )
    expect(res.coverImageId).toMatch(/^[\w-]+$/)
    expect(res.title).toBe('Some Song')
  })

  it('resolves a vimeo thumbnail and title via oEmbed, using the iframe src as-is', async () => {
    const src = 'https://player.vimeo.com/video/1211576198'
    fetchMock.mockResponseOnce(
      JSON.stringify({
        thumbnail_url: 'https://i.vimeocdn.com/video/art.jpg',
        title: 'Some Video'
      })
    )
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.vimeo,
      src
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(src)}`
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://i.vimeocdn.com/video/art.jpg'
    )
    expect(res.coverImageId).toMatch(/^[\w-]+$/)
    expect(res.title).toBe('Some Video')
  })

  it('resolves a bandcamp thumbnail by scraping the embed html, with no title when there is no player data', async () => {
    fetchMock.mockResponseOnce(
      '<html>...https://f4.bcbits.com/img/a123456789_7.jpg...</html>'
    )
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.bandcamp,
      'https://bandcamp.com/EmbeddedPlayer/album=123/size=large/'
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://f4.bcbits.com/img/a123456789_7.jpg'
    )
    expect(res.coverImageId).toMatch(/^[\w-]+$/)
    // Bandcamp has no oEmbed endpoint — title comes from scraping its
    // embed page's data-player-data blob instead (see oembed.test.ts),
    // which this bare-html fixture doesn't have.
    expect(res.title).toBeUndefined()
  })

  it('resolves a bandcamp track title from the embed page player data', async () => {
    const playerData = JSON.stringify({
      album_title: 'Das Audit',
      artist: 'Das Audit',
      tracks: [
        { id: 30637727, title: 'Arpeggio', artist: 'Das Audit' }
      ]
    }).replace(/"/g, '&quot;')
    fetchMock.mockResponseOnce(
      `<html>...https://f4.bcbits.com/img/a123456789_7.jpg...<script data-player-data="${playerData}"></script></html>`
    )
    fetchMock.mockResponseOnce('binary-image-data', {
      headers: { 'content-type': 'image/jpeg' }
    })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.bandcamp,
      'https://bandcamp.com/EmbeddedPlayer/album=1806446448/size=large/track=30637727/'
    )

    expect(res.coverImageId).toMatch(/^[\w-]+$/)
    expect(res.title).toBe('Arpeggio by Das Audit')
  })

  it('resolves an empty result for unsupported hosts', async () => {
    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.unknown,
      'https://example.com/some-embed'
    )

    expect(res).toEqual({})
    expect(fetchMock).not.toHaveBeenCalled()
    expect(uploadBufferToS3Mock).not.toHaveBeenCalled()
  })

  it('still returns a title from oEmbed even when the thumbnail fetch fails', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        thumbnail_url: 'https://i1.sndcdn.com/art.jpg',
        title: 'Some Track'
      })
    )
    fetchMock.mockResponseOnce('', { status: 404 })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.soundcloud,
      'https://api.soundcloud.com/tracks/293'
    )

    expect(res.coverImageId).toBeUndefined()
    expect(res.title).toBe('Some Track')
    expect(uploadBufferToS3Mock).not.toHaveBeenCalled()
  })

  it('resolves an empty result when a host oEmbed call fails outright', async () => {
    fetchMock.mockResponseOnce('', { status: 404 })

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.youtube,
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    )

    expect(res).toEqual({})
    expect(uploadBufferToS3Mock).not.toHaveBeenCalled()
  })

  it('resolves an empty result on unexpected errors instead of throwing', async () => {
    fetchMock.mockRejectOnce(new Error('network error'))

    const res = await fetchEmbedCodeMetadata(
      EmbedCodeHosts.soundcloud,
      'https://soundcloud.com/artist/track'
    )

    expect(res).toEqual({})
  })
})
