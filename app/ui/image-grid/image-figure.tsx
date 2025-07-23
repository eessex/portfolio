import type { Image } from '@/lib/definitions'

export const FigureImage = ({ image }: { image: Image }) => {
  if (!image) {
    return null
  }
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt={image.caption} style={{ aspectRatio: image.aspect }} />
      <figcaption>{image.caption}</figcaption>
    </figure>
  )
}
