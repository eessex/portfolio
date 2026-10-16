'use client'

import { useState } from 'react'

import type { Image } from '@/lib/images/schemas/db'
import type { CarouselMediaHeights } from '@/ui/carousel/carousel'
import {
  Carousel,
  CarouselItem,
  mediaSlideSize
} from '@/ui/carousel/carousel'
import { ImageFigure } from '@/ui/images/image-figure'
import {
  DownloadImageLink,
  ImageLightbox,
  isPressImage
} from '@/ui/images/image-lightbox'
import styles from '@/ui/images/images-carousel.module.scss'

const MEDIA_HEIGHTS: CarouselMediaHeights = {
  height: 380,
  narrowHeight: 260
}

/** "Press images" only when every image is tagged press. */
function imagesTitle(images: Image[]) {
  return images.every(isPressImage) ? 'Press images' : 'Images'
}

/** Carousel of images, each opening the full-screen viewer. */
export function ImagesCarousel({
  images,
  title = imagesTitle(images)
}: {
  images: Image[]
  title?: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <Carousel
        id='images'
        title={title}
        count={images.length}
        mediaHeights={MEDIA_HEIGHTS}
      >
        {images.map((image, i) => {
          const { width, sizes } = mediaSlideSize(
            MEDIA_HEIGHTS,
            image.aspect
          )
          return (
            <CarouselItem key={image.id}>
              <ImageFigure
                image={image}
                className={styles['carousel-image']}
                width={width}
                sizes={sizes}
                isLazy
                onClick={() => setOpenIndex(i)}
              />
            </CarouselItem>
          )
        })}
      </Carousel>

      {openIndex !== null && (
        <ImageLightbox
          images={images}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  )
}

/** A lone image, inline in the text column, opening the viewer. */
export function ImageInline({ image }: { image: Image }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section id='images' className={styles.inline}>
      <h2 className='visually-hidden'>{imagesTitle([image])}</h2>
      <ImageFigure
        image={image}
        className={styles['inline-image']}
        isLazy
        onClick={() => setIsOpen(true)}
      />
      {isPressImage(image) && (
        <p className={styles.download}>
          <DownloadImageLink image={image} />
        </p>
      )}

      {isOpen && (
        <ImageLightbox
          images={[image]}
          index={0}
          onIndexChange={() => {}}
          onClose={() => setIsOpen(false)}
        />
      )}
    </section>
  )
}
