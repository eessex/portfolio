import {
  embedCodeBandcampFixtureMedium,
  embedCodeMixcloudFixtureRegular,
  embedCodeSoundcloudFixture,
  embedCodeSpotifyFixture,
  embedCodeUnknownFixtureAttrs,
  embedCodeVimeoFixture,
  embedCodeYoutubeFixture
} from '@/ui/embed-codes/fixtures'
import { extractIframeParams } from '@/ui/embed-codes/util'

describe('#extractIframeParams', () => {
  describe('invalid iframe', () => {
    it('returns null if no iframe is found', () => {
      const result = extractIframeParams({
        iframe: '<div>No iframe here</div>'
      })
      expect(result).toBeNull()
    })

    it('returns null if iframe src is invalid', () => {
      const result = extractIframeParams({
        iframe: '<iframe src="invalid"></iframe>'
      })
      expect(result).toBeNull()
    })

    it('throws if isThrowOnError and iframe src is invalid', () => {
      expect(() =>
        extractIframeParams(
          { iframe: '<iframe src="invalid"></iframe>' },
          true
        )
      ).toThrow()
    })
  })

  describe('type', () => {
    it('returns type and host for valid YouTube iframe', () => {
      const result = extractIframeParams({
        iframe: embedCodeYoutubeFixture
      })
      expect(result?.type).toBe('video')
      expect(result?.host).toBe('youtube')
    })

    it('returns type for Bandcamp', () => {
      const result = extractIframeParams({
        iframe: embedCodeBandcampFixtureMedium
      })
      expect(result?.type).toBe('audio')
      expect(result?.host).toBe('bandcamp')
    })

    it('returns type for Mixcloud', () => {
      const result = extractIframeParams({
        iframe: embedCodeMixcloudFixtureRegular
      })
      expect(result?.type).toBe('audio')
      expect(result?.host).toBe('mixcloud')
    })

    it('returns type for SoundCloud', () => {
      const result = extractIframeParams({
        iframe: embedCodeSoundcloudFixture
      })
      expect(result?.type).toBe('audio')
      expect(result?.host).toBe('soundcloud')
    })

    it('returns type for Spotify', () => {
      const result = extractIframeParams({
        iframe: embedCodeSpotifyFixture
      })
      expect(result?.type).toBe('audio')
      expect(result?.host).toBe('spotify')
    })

    it('returns type for Vimeo', () => {
      const result = extractIframeParams({
        iframe: embedCodeVimeoFixture
      })
      expect(result?.type).toBe('video')
      expect(result?.host).toBe('vimeo')
    })

    it('returns type "unknown" for unrecognized host', () => {
      const resultAttrs = extractIframeParams({
        iframe: embedCodeUnknownFixtureAttrs
      })
      expect(resultAttrs?.type).toBe('audio')
      expect(resultAttrs?.host).toBe('unknown')
    })
  })

  describe('title', () => {
    it('returns title for bandcamp iframe', () => {
      const result = extractIframeParams({
        iframe: embedCodeBandcampFixtureMedium
      })
      expect(result?.title).toBe('The Fabulous Truth by Eve Essex')
    })

    it('returns title for soundcloud iframe', () => {
      const result = extractIframeParams({
        iframe: embedCodeSoundcloudFixture
      })
      expect(result?.title).toBe('Eve Essex - Honeypot')
    })

    it('returns title for vimeo iframe', () => {
      const result = extractIframeParams({
        iframe: embedCodeVimeoFixture
      })
      expect(result?.title).toBe('Eve Essex - September 5th, 2019')
    })

    it('returns title for youtube iframe', () => {
      const result = extractIframeParams({
        iframe: embedCodeYoutubeFixture
      })
      expect(result?.title).toBe('YouTube video player')
    })

    it('returns title for valid iframe with title attribute', () => {
      const result = extractIframeParams({
        iframe:
          '<iframe src="https://example.com/embedded-content" title="Example Title"></iframe>'
      })
      expect(result?.title).toBe('Example Title')
    })
  })
})
