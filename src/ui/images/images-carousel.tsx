'use client'

import type { Image } from '@/lib/images/schemas/db'
import { imageAspect } from '@/lib/images/util'
import type { CarouselMediaHeights } from '@/ui/carousel/carousel'
import {
  Carousel,
  CarouselItem,
  mediaSlideSize
} from '@/ui/carousel/carousel'
import {
  GalleryImageFigure,
  WithImageGallery
} from '@/ui/images/image-gallery'
import {
  DownloadImageLink,
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

/**
 * Carousel of images, each opening the full-screen viewer: the page's
 * `ImageGallery` if one encloses it, else a viewer of just these.
 */
export function ImagesCarousel({
  images,
  title = imagesTitle(images)
}: {
  images: Image[]
  title?: string
}) {
  return (
    <WithImageGallery images={images}>
      <Carousel
        id='images'
        title={title}
        count={images.length}
        mediaHeights={MEDIA_HEIGHTS}
      >
        {images.map((image) => {
          const { width, sizes } = mediaSlideSize(
            MEDIA_HEIGHTS,
            imageAspect(image)
          )
          return (
            <CarouselItem key={image.id}>
              <GalleryImageFigure
                image={image}
                className={styles['carousel-image']}
                width={width}
                sizes={sizes}
                isLazy
              />
            </CarouselItem>
          )
        })}
      </Carousel>
    </WithImageGallery>
  )
}

/** An image inline in the text column, opening the viewer. */
export function ImageInline({ image }: { image: Image }) {
  return (
    <WithImageGallery images={[image]}>
      <section id='images' className={styles.inline}>
        <h2 className='visually-hidden'>{imagesTitle([image])}</h2>
        <GalleryImageFigure
          image={image}
          className={styles['inline-image']}
          isLazy
        />
        {isPressImage(image) && (
          <p className={styles.download}>
            <DownloadImageLink image={image} />
          </p>
        )}
      </section>
    </WithImageGallery>
  )
}
