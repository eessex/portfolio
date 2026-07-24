import { resolveOEmbed } from '@/lib/embed-codes/oembed'
import { EmbedCodeHosts } from '@/lib/embed-codes/schemas/db'

describe('resolveOEmbed', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  describe('youtube', () => {
    it('resolves a thumbnail and title via oEmbed, using the canonical watch url', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          thumbnail_url:
            'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          title: 'The Real Video Title'
        })
      )

      const res = await resolveOEmbed(
        EmbedCodeHosts.youtube,
        'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0'
      )

      expect(fetchMock).toHaveBeenCalledWith(
        `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}&format=json`
      )
      expect(res).toEqual({
        thumbnailUrl:
          'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        title: 'The Real Video Title'
      })
    })

    it('extracts the video id from a youtu.be short link', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          thumbnail_url: 'https://i.ytimg.com/art.jpg'
        })
      )

      await resolveOEmbed(
        EmbedCodeHosts.youtube,
        'https://youtu.be/dQw4w9WgXcQ?si=abc123'
      )

      expect(fetchMock).toHaveBeenCalledWith(
        `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}&format=json`
      )
    })

    it('resolves undefined without fetching when no video id can be extracted', async () => {
      const res = await resolveOEmbed(
        EmbedCodeHosts.youtube,
        'https://www.youtube.com/not-a-video-url'
      )

      expect(res).toBeUndefined()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('resolves undefined when oEmbed responds non-ok', async () => {
      fetchMock.mockResponseOnce('', { status: 404 })

      const res = await resolveOEmbed(
        EmbedCodeHosts.youtube,
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
      )

      expect(res).toBeUndefined()
    })
  })

  describe('soundcloud', () => {
    it('resolves a thumbnail and title via oEmbed for a canonical url', async () => {
      const src = 'https://api.soundcloud.com/tracks/293'
      fetchMock.mockResponseOnce(
        JSON.stringify({
          thumbnail_url: 'https://i1.sndcdn.com/art.jpg',
          title: 'Some Track'
        })
      )

      const res = await resolveOEmbed(EmbedCodeHosts.soundcloud, src)

      expect(fetchMock).toHaveBeenCalledWith(
        `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(src)}`
      )
      expect(res).toEqual({
        thumbnailUrl: 'https://i1.sndcdn.com/art.jpg',
        title: 'Some Track'
      })
    })

    it('unwraps a widget src to the canonical url', async () => {
      const widgetSrc =
        'https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F293&show_artwork=true'
      fetchMock.mockResponseOnce(
        JSON.stringify({
          thumbnail_url: 'https://i1.sndcdn.com/art.jpg'
        })
      )

      await resolveOEmbed(EmbedCodeHosts.soundcloud, widgetSrc)

      expect(fetchMock).toHaveBeenCalledWith(
        `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent('https://api.soundcloud.com/tracks/293')}`
      )
    })

    it('unwraps a double-encoded URN src to a bare track id', async () => {
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

      await resolveOEmbed(EmbedCodeHosts.soundcloud, widgetSrc)

      expect(fetchMock).toHaveBeenCalledWith(
        `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent('https://api.soundcloud.com/tracks/649527206')}`
      )
    })

    it('resolves undefined when oEmbed responds non-ok', async () => {
      fetchMock.mockResponseOnce('', { status: 404 })

      const res = await resolveOEmbed(
        EmbedCodeHosts.soundcloud,
        'https://api.soundcloud.com/tracks/293'
      )

      expect(res).toBeUndefined()
    })

    it('falls back to using a malformed src as-is rather than throwing', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          thumbnail_url: 'https://i1.sndcdn.com/art.jpg'
        })
      )

      await resolveOEmbed(
        EmbedCodeHosts.soundcloud,
        'not-a-valid-url'
      )

      expect(fetchMock).toHaveBeenCalledWith(
        `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent('not-a-valid-url')}`
      )
    })
  })

  describe('mixcloud', () => {
    it('unwraps a widget src to the canonical url and reads the image field', async () => {
      const pageUrl = 'https://www.mixcloud.com/NTSRadio/some-show/'
      const widgetSrc = `https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(pageUrl)}&hide_cover=1`
      fetchMock.mockResponseOnce(
        JSON.stringify({
          image: 'https://thumbnailer.mixcloud.com/art.jpg',
          title: 'Some Show'
        })
      )

      const res = await resolveOEmbed(
        EmbedCodeHosts.mixcloud,
        widgetSrc
      )

      expect(fetchMock).toHaveBeenCalledWith(
        `https://www.mixcloud.com/oembed/?format=json&url=${encodeURIComponent(pageUrl)}`
      )
      // Mixcloud's oEmbed puts the thumbnail in `image`, not
      // `thumbnail_url` like the other hosts.
      expect(res).toEqual({
        thumbnailUrl: 'https://thumbnailer.mixcloud.com/art.jpg',
        title: 'Some Show'
      })
    })

    it('resolves undefined when oEmbed responds non-ok', async () => {
      fetchMock.mockResponseOnce('', { status: 404 })

      const res = await resolveOEmbed(
        EmbedCodeHosts.mixcloud,
        'https://www.mixcloud.com/NTSRadio/some-show/'
      )

      expect(res).toBeUndefined()
    })
  })

  describe('spotify', () => {
    it('strips the /embed/ path to the canonical url', async () => {
      const embedSrc =
        'https://open.spotify.com/embed/track/7GhIk7Il098yCjg4BQjzvb?utm_source=oembed'
      fetchMock.mockResponseOnce(
        JSON.stringify({
          thumbnail_url:
            'https://image-cdn-fa.spotifycdn.com/art.jpg',
          title: 'Some Song'
        })
      )

      const res = await resolveOEmbed(
        EmbedCodeHosts.spotify,
        embedSrc
      )

      expect(fetchMock).toHaveBeenCalledWith(
        `https://open.spotify.com/oembed?url=${encodeURIComponent('https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb?utm_source=oembed')}`
      )
      expect(res).toEqual({
        thumbnailUrl: 'https://image-cdn-fa.spotifycdn.com/art.jpg',
        title: 'Some Song'
      })
    })

    it('resolves undefined when oEmbed responds non-ok', async () => {
      fetchMock.mockResponseOnce('', { status: 404 })

      const res = await resolveOEmbed(
        EmbedCodeHosts.spotify,
        'https://open.spotify.com/embed/track/7GhIk7Il098yCjg4BQjzvb'
      )

      expect(res).toBeUndefined()
    })
  })

  describe('vimeo', () => {
    it('resolves a thumbnail and title using the player src as-is', async () => {
      const src = 'https://player.vimeo.com/video/1211576198'
      fetchMock.mockResponseOnce(
        JSON.stringify({
          thumbnail_url: 'https://i.vimeocdn.com/video/art.jpg',
          title: 'Some Video'
        })
      )

      const res = await resolveOEmbed(EmbedCodeHosts.vimeo, src)

      expect(fetchMock).toHaveBeenCalledWith(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(src)}`
      )
      expect(res).toEqual({
        thumbnailUrl: 'https://i.vimeocdn.com/video/art.jpg',
        title: 'Some Video'
      })
    })

    it('resolves undefined when oEmbed responds non-ok', async () => {
      fetchMock.mockResponseOnce('', { status: 404 })

      const res = await resolveOEmbed(
        EmbedCodeHosts.vimeo,
        'https://player.vimeo.com/video/1211576198'
      )

      expect(res).toBeUndefined()
    })
  })

  describe('bandcamp', () => {
    it('scrapes the artwork url from the embed page html, with no title', async () => {
      fetchMock.mockResponseOnce(
        '<html>...https://f4.bcbits.com/img/a123456789_7.jpg...</html>'
      )

      const res = await resolveOEmbed(
        EmbedCodeHosts.bandcamp,
        'https://bandcamp.com/EmbeddedPlayer/album=123/size=large/'
      )

      expect(fetchMock).toHaveBeenCalledWith(
        'https://bandcamp.com/EmbeddedPlayer/album=123/size=large/'
      )
      // Bandcamp has no oEmbed endpoint, so there's never a title.
      expect(res).toEqual({
        thumbnailUrl: 'https://f4.bcbits.com/img/a123456789_7.jpg',
        title: undefined
      })
    })

    it('resolves an undefined thumbnail and warns when no artwork url is found', async () => {
      const warnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {})
      fetchMock.mockResponseOnce('<html>no artwork here</html>')

      const res = await resolveOEmbed(
        EmbedCodeHosts.bandcamp,
        'https://bandcamp.com/EmbeddedPlayer/album=123/size=large/'
      )

      expect(res).toEqual({ thumbnailUrl: undefined })
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'bandcamp embed page had no matching artwork url'
        )
      )
      warnSpy.mockRestore()
    })

    it('resolves an undefined thumbnail when the embed page fetch responds non-ok', async () => {
      fetchMock.mockResponseOnce('', { status: 404 })

      const res = await resolveOEmbed(
        EmbedCodeHosts.bandcamp,
        'https://bandcamp.com/EmbeddedPlayer/album=123/size=large/'
      )

      expect(res).toEqual({ thumbnailUrl: undefined })
    })
  })

  describe('unsupported hosts', () => {
    it('resolves undefined for unknown, without fetching', async () => {
      const res = await resolveOEmbed(
        EmbedCodeHosts.unknown,
        'https://example.com/some-embed'
      )

      expect(res).toBeUndefined()
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })
})
