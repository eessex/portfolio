import type { Image } from '@/lib/definitions'

export const FigureImage = ({
  image,
  isCaptionHidden,
  isLazy,
  className
}: {
  image: Image,
  isCaptionHidden?: boolean,
  isLazy?: boolean,
  className?: string
}) => {
  if (!image) {
    return null
  }
  return (
    <figure className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt || ''}
        title={!isCaptionHidden && image.caption ? image.caption : undefined}
        style={{ aspectRatio: image.aspect }}
        loading={isLazy ? 'lazy' : 'eager'}
      />
      {image.caption && !isCaptionHidden && (
        <figcaption>{image.caption}</figcaption>
      )}
    </figure>
  )
}
