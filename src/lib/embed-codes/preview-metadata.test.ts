import { resolveOEmbed } from '@/lib/embed-codes/oembed'
import { previewEmbedCodeMetadata } from '@/lib/embed-codes/preview-metadata'
import { EmbedCodeHosts } from '@/lib/embed-codes/schemas/db'

jest.mock('@/lib/embed-codes/oembed', () => ({
  resolveOEmbed: jest.fn()
}))
const resolveOEmbedMock = jest.mocked(resolveOEmbed)

describe('#previewEmbedCodeMetadata', () => {
  beforeEach(() => jest.clearAllMocks())

  it('resolves the title and thumbnail from oEmbed', async () => {
    resolveOEmbedMock.mockResolvedValueOnce({
      title: 'The Real Video Title',
      thumbnailUrl: 'https://img.youtube.com/vi/abc123/hqdefault.jpg'
    })

    const res = await previewEmbedCodeMetadata(
      EmbedCodeHosts.youtube,
      'https://www.youtube.com/embed/abc123'
    )

    expect(resolveOEmbedMock).toHaveBeenCalledWith(
      EmbedCodeHosts.youtube,
      'https://www.youtube.com/embed/abc123'
    )
    expect(res).toEqual({
      title: 'The Real Video Title',
      thumbnailUrl: 'https://img.youtube.com/vi/abc123/hqdefault.jpg'
    })
  })

  it('resolves an empty result when nothing is found', async () => {
    resolveOEmbedMock.mockResolvedValueOnce(undefined)

    const res = await previewEmbedCodeMetadata(
      EmbedCodeHosts.unknown,
      'https://example.com/some-embed'
    )

    expect(res).toEqual({ title: undefined, thumbnailUrl: undefined })
  })

  it('resolves an empty result instead of throwing on unexpected errors', async () => {
    resolveOEmbedMock.mockRejectedValueOnce(
      new Error('network error')
    )

    const res = await previewEmbedCodeMetadata(
      EmbedCodeHosts.soundcloud,
      'https://soundcloud.com/artist/track'
    )

    expect(res).toEqual({})
  })
})
