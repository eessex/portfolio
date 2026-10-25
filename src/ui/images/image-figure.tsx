import type { Image } from '@/lib/images/schemas/db'
import { imageAspect, MOBILE_CONTENT_SIZE } from '@/lib/images/util'
import { StoredImage } from '@/ui/images/stored-image'

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
    <StoredImage
      image={image}
      alt={alt}
      title={image.caption || image.caption || undefined}
      width={width}
      height={Math.round(width / imageAspect(image))}
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
