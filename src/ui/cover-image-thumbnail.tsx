import { isCoverImageThumbnailUrl } from '@/lib/embed-codes/cover-image-url'
import type { Image } from '@/lib/images/schemas/db'
import { imageAspect } from '@/lib/images/util'
import styles from '@/ui/cover-image-thumbnail.module.scss'
import { StoredImage } from '@/ui/images/stored-image'

const COVER_IMAGE_HEIGHT = 32

export type ThumbnailImage = Pick<
  Image,
  | 'url'
  | 'aspect'
  | 'width'
  | 'height'
  | 'format'
  | 'variantVersion'
  | 'blurDataUrl'
  | 'alt'
  | 'caption'
>

export const CoverImageThumbnail = ({
  image,
  isSquare
}: {
  image: ThumbnailImage
  /** center-cropped, as a site icon is */
  isSquare?: boolean
}) => (
  <StoredImage
    image={image}
    alt={image.alt || image.caption || ''}
    width={
      isSquare
        ? COVER_IMAGE_HEIGHT
        : Math.round(COVER_IMAGE_HEIGHT * imageAspect(image))
    }
    height={COVER_IMAGE_HEIGHT}
    unoptimized={isCoverImageThumbnailUrl(image.url)}
    className={`${styles['cover-image']} ${isSquare ? styles['square'] : ''}`}
  />
)
