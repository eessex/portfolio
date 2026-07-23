import NextImage from 'next/image'

import type { Image } from '@/lib/images/schemas/db'
import styles from '@/ui/cover-image-thumbnail.module.scss'

const COVER_IMAGE_HEIGHT = 32

export const CoverImageThumbnail = ({ image }: { image: Image }) => (
  <NextImage
    src={image.url}
    alt={image.alt || image.caption || ''}
    width={Math.round(COVER_IMAGE_HEIGHT * image.aspect)}
    height={COVER_IMAGE_HEIGHT}
    className={styles['cover-image']}
  />
)
