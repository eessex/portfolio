import { extractIframeParams } from '@/ui/embed-codes/util'

import {
  embedCodeBandcampFixtureArt,
  embedCodeBandcampFixtureMedium,
  embedCodeBandcampFixtureSlim,
  embedCodeBandcampFixtureVideo,
  embedCodeMixcloudFixtureMini,
  embedCodeMixcloudFixtureRegular,
  embedCodeSoundcloudFixture,
  embedCodeSpotifyFixture,
  embedCodeSpotifyFixtureCompact,
  embedCodeUnknownFixtureAttrs,
  embedCodeUnknownFixtureStyles,
  embedCodeVimeoFixture,
  embedCodeYoutubeFixture,
  embedCodeYoutubePrivacyEnhancedFixture
} from './fixtures'

describe('#extractIframeParams', () => {
  describe('invalid iframe', () => {
    it('returns null if no iframe is found', () => {
      const result = extractIframeParams({ iframe: '<div>No iframe here</div>' })
      expect(result).toBeNull()
    })

    it('returns null if iframe src is invalid', () => {
      const result = extractIframeParams({ iframe: '<iframe src="invalid"></iframe>' })
      expect(result).toBeNull()
    })

    it('throws if isThrowOnError and iframe src is invalid', () => {
      expect(() => extractIframeParams({ iframe: '<iframe src="invalid"></iframe>' }, true)).toThrow()
    })
  })

  describe('type', () => {
    it('returns type and host for valid YouTube iframe', () => {
      const result = extractIframeParams({ iframe: embedCodeYoutubeFixture })
      expect(result?.type).toBe('video')
      expect(result?.host).toBe('youtube')
    })

    it('returns type for Bandcamp', () => {
      const result = extractIframeParams({ iframe: embedCodeBandcampFixtureMedium })
      expect(result?.type).toBe('audio')
      expect(result?.host).toBe('bandcamp')
    })

    it('returns type for Mixcloud', () => {
      const result = extractIframeParams({ iframe: embedCodeMixcloudFixtureRegular })
      expect(result?.type).toBe('audio')
      expect(result?.host).toBe('mixcloud')
    })

    it('returns type for SoundCloud', () => {
      const result = extractIframeParams({ iframe: embedCodeSoundcloudFixture })
      expect(result?.type).toBe('audio')
      expect(result?.host).toBe('soundcloud')
    })

    it('returns type for Spotify', () => {
      const result = extractIframeParams({ iframe: embedCodeSpotifyFixture })
      expect(result?.type).toBe('audio')
      expect(result?.host).toBe('spotify')
    })

    it('returns type for Vimeo', () => {
      const result = extractIframeParams({ iframe: embedCodeVimeoFixture })
      expect(result?.type).toBe('video')
      expect(result?.host).toBe('vimeo')
    })
  })

  describe('width and height', () => {
    describe('returns width and height for valid iframe with attributes', () => {
      describe('audio', () => {
        describe('bandcamp', () => {
          it('handles slim plyer', () => {
            const result = extractIframeParams({ iframe: embedCodeBandcampFixtureSlim })
            expect(result?.width).toBe('100%')
            expect(result?.height).toBeCloseTo(42)
            expect(result?.aspectRatio).toBeUndefined()
          })

          it('handles regular player', () => {
            const result = extractIframeParams({ iframe: embedCodeBandcampFixtureMedium })
            expect(result?.width).toBe('100%')
            expect(result?.height).toBeCloseTo(120)
            expect(result?.aspectRatio).toBeUndefined()
          })

          it('handles artwork player', () => {
            const result = extractIframeParams({ iframe: embedCodeBandcampFixtureArt })
            expect(result?.aspectRatio).toBeCloseTo(1)
            expect(result?.width).toBeUndefined()
            expect(result?.height).toBeUndefined()
          })

          it('handles video player', () => {
            const result = extractIframeParams({ iframe: embedCodeBandcampFixtureVideo })
            expect(result?.aspectRatio).toBeCloseTo(1.2873)
            expect(result?.width).toBeUndefined()
            expect(result?.height).toBeUndefined()
          })
        })

        describe('mixcloud', () => {
          it('handles regular player', () => {
            const result = extractIframeParams({ iframe: embedCodeMixcloudFixtureRegular })
            expect(result?.width).toBe('100%')
            expect(result?.height).toBeCloseTo(120)
            expect(result?.aspectRatio).toBeUndefined()
          })

          it('handles mini player', () => {
            const result = extractIframeParams({ iframe: embedCodeMixcloudFixtureMini })
            expect(result?.width).toBe('100%')
            expect(result?.height).toBeCloseTo(60)
            expect(result?.aspectRatio).toBeUndefined()
          })
        })

        describe('soundcloud', () => {
          it('handles regular player', () => {
            const result = extractIframeParams({ iframe: embedCodeSoundcloudFixture })
            expect(result?.width).toBe('100%')
            expect(result?.height).toBeCloseTo(166)
            expect(result?.aspectRatio).toBeUndefined()
          })
        })

        describe('spotify', () => {
          it('handles regular player', () => {
            const result = extractIframeParams({ iframe: embedCodeSpotifyFixture })
            expect(result?.width).toBe('100%')
            expect(result?.height).toBeCloseTo(352)
            expect(result?.aspectRatio).toBeUndefined()
          })

          it('handles compact player', () => {
            const result = extractIframeParams({ iframe: embedCodeSpotifyFixtureCompact })
            expect(result?.width).toBe('100%')
            expect(result?.height).toBeCloseTo(152)
            expect(result?.aspectRatio).toBeUndefined()
          })
        })
      })
    })

    describe('video', () => {
      describe('youtube', () => {
        it('handles regular video', () => {
          const result = extractIframeParams({ iframe: embedCodeYoutubeFixture })
          expect(result?.width).toBe(undefined)
          expect(result?.height).toBe(undefined)
          expect(result?.aspectRatio).toBeCloseTo(16 / 9)
        })

        it('handles privacy-enhanced mode video', () => {
          const result = extractIframeParams({ iframe: embedCodeYoutubePrivacyEnhancedFixture })
          expect(result?.width).toBe(undefined)
          expect(result?.height).toBe(undefined)
          expect(result?.aspectRatio).toBeCloseTo(16 / 9)
        })
      })

      describe('vimeo', () => {
        it('handles regular video', () => {
          const result = extractIframeParams({ iframe: embedCodeVimeoFixture })
          expect(result?.width).toBe(undefined)
          expect(result?.height).toBe(undefined)
          expect(result?.aspectRatio).toBeCloseTo(16 / 9)
        })
      })
    })

    describe('returns width and height for valid iframe with dimension attributes', () => {
      it('handles unknown iframe with dimension attributes', () => {
        const result = extractIframeParams({ iframe: embedCodeUnknownFixtureAttrs })
        expect(result?.width).toBe('100%')
        expect(result?.height).toBeCloseTo(166)
        expect(result?.aspectRatio).toBeUndefined()
      })
    })

    describe('returns width and height for valid iframe with dimension styles', () => {
      it('handles unknown iframe with dimension styles', () => {
        const result = extractIframeParams({ iframe: embedCodeUnknownFixtureStyles })
        expect(result?.width).toBe('100%')
        expect(result?.height).toBeCloseTo(166)
        expect(result?.aspectRatio).toBeUndefined()
      })
    })

    describe('returns default width and height for valid iframe without dimension attributes or styles', () => {
      it('handles unknown iframe without dimension attributes or styles', () => {
        const result = extractIframeParams({ iframe: '<iframe src="https://example.com/embedded-content"></iframe>' })
        expect(result?.width).toBe(undefined)
        expect(result?.height).toBe(undefined)
        expect(result?.aspectRatio).toBeCloseTo(16 / 9)
      })
    })
  })

  describe('title', () => {
    it('returns title for bandcamp iframe', () => {
      const result = extractIframeParams({ iframe: embedCodeBandcampFixtureMedium })
      expect(result?.title).toBe('The Fabulous Truth by Eve Essex')
    })

    it('returns title for soundcloud iframe', () => {
      const result = extractIframeParams({ iframe: embedCodeSoundcloudFixture })
      expect(result?.title).toBe('Eve Essex - Honeypot')
    })

    it('returns title for vimeo iframe', () => {
      const result = extractIframeParams({ iframe: embedCodeVimeoFixture })
      expect(result?.title).toBe('Eve Essex - September 5th, 2019')
    })

    it('returns title for youtube iframe', () => {
      const result = extractIframeParams({ iframe: embedCodeYoutubeFixture })
      expect(result?.title).toBe('YouTube video player')
    })

    it('returns title for valid iframe with title attribute', () => {
      const result = extractIframeParams({ iframe: '<iframe src="https://example.com/embedded-content" title="Example Title"></iframe>' })
      expect(result?.title).toBe('Example Title')
    })
  })
})
