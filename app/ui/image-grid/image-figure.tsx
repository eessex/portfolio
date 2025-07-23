import type { Image } from '@/lib/definitions'

export const FigureImage = ({
  image,
  isLazy,
  className
}: {
  image: Image,
  isLazy?: boolean,
  className?: string
}) => {
  if (!image) {
    return null
  }
  return (
    <figure className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt={image.alt || ''} style={{ aspectRatio: image.aspect }} loading={isLazy ? 'lazy' : 'eager'} />
      {image.caption && (
        <figcaption>{image.caption}</figcaption>
      )}
    </figure>
  )
}
