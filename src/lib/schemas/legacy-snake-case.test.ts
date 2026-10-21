import { embedCodeContentTypeSchema } from '@/lib/embed-codes/schemas/db'
import { linkTypeSchema } from '@/lib/links/schemas/db'
import { releaseTypeSchema } from '@/lib/releases/schemas'

// TODO: remove with `withLegacySnakeCase`
describe('legacy snake_case enum values', () => {
  it.each([
    ['buy_link', 'buyLink', linkTypeSchema],
    ['stream_link', 'streamLink', linkTypeSchema],
    [
      'collaborative_release',
      'collaborativeRelease',
      releaseTypeSchema
    ],
    ['dj_set', 'djSet', embedCodeContentTypeSchema],
    [
      'live_performance',
      'livePerformance',
      embedCodeContentTypeSchema
    ],
    ['official_audio', 'officialAudio', embedCodeContentTypeSchema],
    [
      'official_music_video',
      'officialMusicVideo',
      embedCodeContentTypeSchema
    ],
    ['radio_show', 'radioShow', embedCodeContentTypeSchema]
  ])('reads %p as %p', (legacy, value, schema) => {
    expect(schema.parse(legacy)).toBe(value)
    expect(schema.parse(value)).toBe(value)
  })

  it('still rejects unknown values', () => {
    expect(linkTypeSchema.safeParse('not_a_type').success).toBe(false)
  })
})
