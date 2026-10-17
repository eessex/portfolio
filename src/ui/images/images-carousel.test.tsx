import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { imageFixture } from '@/lib/images/fixtures'
import { ImageTypes } from '@/lib/images/schemas/db'
import {
  ImageInline,
  ImagesCarousel
} from '@/ui/images/images-carousel'

const images = ['one', 'two', 'three'].map((name, i) => ({
  ...imageFixture,
  type: ImageTypes.press,
  id: `00000000-0000-4000-8000-00000000000${i}`,
  url: `https://example.com/${name}.jpg`,
  caption: `Photo by ${name}`
}))

function openAt(caption: string) {
  const opener = screen
    .getByText(caption)
    .closest('figure')!
    .querySelector('button')!
  opener.focus()
  fireEvent.click(opener)
  return opener
}

const mixed = [
  images[0],
  { ...images[1], type: ImageTypes.artwork },
  { ...images[2], type: undefined }
]

describe('ImagesCarousel', () => {
  it('is titled "Press images" when every image is press', () => {
    render(<ImagesCarousel images={images} />)

    expect(
      screen.getByRole('heading', { name: 'Press images' })
    ).toBeInTheDocument()
  })

  it('is titled "Images" when any image is not press', () => {
    render(<ImagesCarousel images={mixed} />)

    expect(
      screen.getByRole('heading', { name: 'Images' })
    ).toBeInTheDocument()
  })

  it('offers a download only for press images', () => {
    render(<ImagesCarousel images={mixed} />)

    openAt('Photo by two')
    expect(
      screen.queryByRole('link', { name: 'Download high-res' })
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Previous image' })
    )
    expect(
      screen.getByRole('link', { name: 'Download high-res' })
    ).toHaveAttribute('href', images[0].url)
  })

  it('opens the viewer at the clicked image', () => {
    render(<ImagesCarousel images={images} />)

    openAt('Photo by two')

    const dialog = screen.getByRole('dialog', { name: 'Image 2 / 3' })
    expect(dialog).toHaveTextContent('Photo by two')
    expect(
      screen.getByRole('link', { name: 'Download high-res' })
    ).toHaveAttribute('href', images[1].url)
    expect(
      screen.getByRole('button', { name: 'Close' })
    ).toHaveFocus()
  })

  it('wraps navigation with the arrow buttons and keys', () => {
    render(<ImagesCarousel images={images} />)
    openAt('Photo by three')

    fireEvent.click(
      screen.getByRole('button', { name: 'Next image' })
    )
    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      'Image 1 / 3'
    )

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'ArrowLeft'
    })
    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      'Image 3 / 3'
    )
  })

  it('closes on Escape and returns focus to the thumbnail', () => {
    render(<ImagesCarousel images={images} />)
    const opener = openAt('Photo by one')

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})

describe('ImageLightbox', () => {
  it('shows a spinner until the image loads, and again on the next', async () => {
    render(<ImagesCarousel images={images} />)
    openAt('Photo by one')
    const dialog = screen.getByRole('dialog')

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading image'
    )
    fireEvent.load(dialog.querySelector('img')!)
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Next image' })
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('closes on a backdrop click but not on the image', () => {
    render(<ImagesCarousel images={images} />)
    openAt('Photo by one')
    const dialog = screen.getByRole('dialog')

    fireEvent.click(dialog.querySelector('img')!)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(dialog)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('ImageInline', () => {
  it('leaves off the download link and press title for other images', () => {
    render(<ImageInline image={mixed[1]} />)

    expect(
      screen.queryByRole('link', { name: 'Download high-res' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Images' })
    ).toBeInTheDocument()
  })

  it('shows the credit and download link, and opens the viewer without arrows', () => {
    render(<ImageInline image={images[0]} />)

    expect(
      screen.getByRole('link', { name: 'Download high-res' })
    ).toHaveAttribute('href', images[0].url)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      'Image 1 / 1'
    )
    expect(
      screen.queryByRole('button', { name: 'Next image' })
    ).not.toBeInTheDocument()
  })
})
