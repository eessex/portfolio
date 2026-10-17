import { render, screen } from '@testing-library/react'

import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import { EmbedCodeTypes } from '@/lib/embed-codes/schemas/db'
import { EmbedCodesCarousel } from '@/ui/embed-codes/embed-codes-carousel'

const video = { ...embedCodeFixture, type: EmbedCodeTypes.video }
const audio = {
  ...embedCodeFixture,
  id: 'd7c2e3f0-3333-4444-8555-b66677778888',
  type: EmbedCodeTypes.audio
}

describe('EmbedCodesCarousel', () => {
  it.each([
    ['Video', [video, { ...video, id: audio.id }]],
    ['Audio', [{ ...audio, id: video.id }, audio]],
    ['Video & audio', [video, audio]]
  ])('is titled "%s" for the embed types present', (title, codes) => {
    render(<EmbedCodesCarousel embedCodes={codes} />)

    expect(
      screen.getByRole('heading', {
        name: new RegExp(`^${title}\\s*\\d*$`)
      })
    ).toBeInTheDocument()
  })
})
