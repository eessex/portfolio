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
  image
}: {
  image: ThumbnailImage
}) => (
  <StoredImage
    image={image}
    alt={image.alt || image.caption || ''}
    width={Math.round(COVER_IMAGE_HEIGHT * imageAspect(image))}
    height={COVER_IMAGE_HEIGHT}
    unoptimized={isCoverImageThumbnailUrl(image.url)}
    className={styles['cover-image']}
  />
)
