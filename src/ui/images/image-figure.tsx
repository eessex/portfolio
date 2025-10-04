import NextImage from 'next/image'

import type { Image } from '@/lib/images/types'

export const ImageFigure = ({
  image,
  isCaptionHidden,
  isLazy,
  className,
  isPriority,
  width = 680
}: {
  image: Image
  isCaptionHidden?: boolean
  isLazy?: boolean
  className?: string
  isPriority?: boolean
  width?: number
}) => {
  if (!image) {
    return null
  }
  return (
    <figure className={className}>
      <NextImage
        src={image.url}
        alt={image.alt || image.caption || ''}
        title={image.caption || image.caption || undefined}
        width={width}
        height={width / image.aspect}
        loading={isLazy ? 'lazy' : undefined}
        priority={isPriority}
        fetchPriority={isPriority ? 'high' : 'auto'}
      />
      {image.caption && !isCaptionHidden && (
        <figcaption>{image.caption}</figcaption>
      )}
    </figure>
  )
}
