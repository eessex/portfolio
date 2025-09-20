import NextImage from 'next/image'

import type { Image } from '@/lib/images/types'

export const FigureImage = ({
  image,
  isCaptionHidden,
  isLazy,
  className,
  isPriority
}: {
  image: Image
  isCaptionHidden?: boolean
  isLazy?: boolean
  className?: string
  isPriority?: boolean
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
        width={500 * image.aspect}
        height={500}
        loading={isLazy ? 'lazy' : undefined}
        priority={isPriority}
      />
      {image.caption && !isCaptionHidden && (
        <figcaption>{image.caption}</figcaption>
      )}
    </figure>
  )
}
