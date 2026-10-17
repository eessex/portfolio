'use client'

import { createContext, useContext, useState } from 'react'

import type { Image } from '@/lib/images/schemas/db'
import { ImageFigure } from '@/ui/images/image-figure'
import { ImageLightbox } from '@/ui/images/image-lightbox'

type Gallery = { open: (image: Image) => void }

const GalleryContext = createContext<Gallery | null>(null)

/**
 * One lightbox for every image on a page, in `images` order, so
 * navigating from one image continues through the rest (e.g. the
 * cover, then the carousel). Clickable images inside open it via
 * `useImageGallery`.
 */
export function ImageGallery({
  images,
  children
}: {
  images: Image[]
  children: React.ReactNode
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function open(image: Image) {
    const index = images.findIndex(({ id }) => id === image.id)
    if (index !== -1) setOpenIndex(index)
  }

  return (
    <GalleryContext.Provider value={{ open }}>
      {children}

      {openIndex !== null && (
        <ImageLightbox
          images={images}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </GalleryContext.Provider>
  )
}

export function useImageGallery() {
  return useContext(GalleryContext)
}

/**
 * Provides a gallery of just `images` when none encloses this, so a
 * carousel or inline image still opens the viewer on its own.
 */
export function WithImageGallery({
  images,
  children
}: {
  images: Image[]
  children: React.ReactNode
}) {
  return useImageGallery() ? (
    children
  ) : (
    <ImageGallery images={images}>{children}</ImageGallery>
  )
}

/** An `ImageFigure` that opens the enclosing gallery on click. */
export function GalleryImageFigure(
  props: Omit<React.ComponentProps<typeof ImageFigure>, 'onClick'>
) {
  const gallery = useImageGallery()
  return (
    <ImageFigure
      {...props}
      onClick={gallery ? () => gallery.open(props.image) : undefined}
    />
  )
}
