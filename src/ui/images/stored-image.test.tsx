import { render, screen } from '@testing-library/react'

import { StoredImage } from '@/ui/images/stored-image'

const url = 'https://bucket.example/images/abc.svg'

describe('StoredImage', () => {
  it('serves an SVG as uploaded, skipping the optimizer', () => {
    render(
      <StoredImage
        image={{ url, format: 'svg' }}
        alt='Logo'
        width={100}
        height={40}
      />
    )
    expect(screen.getByAltText('Logo')).toHaveAttribute('src', url)
  })

  it('sends a raster image without variants through the optimizer', () => {
    render(
      <StoredImage
        image={{
          url: 'https://bucket.example/images/abc.jpg',
          format: 'jpeg'
        }}
        alt='Photo'
        width={100}
        height={40}
      />
    )
    expect(screen.getByAltText('Photo').getAttribute('src')).toMatch(
      /^\/_next\/image\?url=/
    )
  })
})
