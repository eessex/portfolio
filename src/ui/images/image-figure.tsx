import NextImage from 'next/image'

import type { Image } from '@/lib/images/schemas/db'
import { MOBILE_CONTENT_SIZE } from '@/lib/images/util'

export const ImageFigure = ({
  image,
  isCaptionHidden,
  isLazy,
  className,
  isPriority,
  width = 680,
  sizes = `(max-width: 768px) ${MOBILE_CONTENT_SIZE}, 680px`,
  onClick
}: {
  image: Image
  isCaptionHidden?: boolean
  isLazy?: boolean
  className?: string
  isPriority?: boolean
  width?: number
  sizes?: string
  /** makes the image a button, e.g. to open a viewer */
  onClick?: () => void
}) => {
  if (!image) {
    return null
  }
  const alt = image.alt || image.caption || ''
  const img = (
    <NextImage
      src={image.url}
      alt={alt}
      title={image.caption || image.caption || undefined}
      width={width}
      height={Math.round(width / image.aspect)}
      loading={isLazy ? 'lazy' : undefined}
      priority={isPriority}
      fetchPriority={isPriority ? 'high' : 'auto'}
      sizes={sizes}
    />
  )
  return (
    <figure className={className}>
      {onClick ? (
        <button
          type='button'
          aria-label={alt ? undefined : 'View image'}
          onClick={onClick}
        >
          {img}
        </button>
      ) : (
        img
      )}
      {image.caption && !isCaptionHidden && (
        <figcaption>{image.caption}</figcaption>
      )}
    </figure>
  )
}
