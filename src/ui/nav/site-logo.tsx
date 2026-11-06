import type { Image } from '@/lib/images/schemas/db'
import { imageAspect, isSvg } from '@/lib/images/util'
import { StoredImage } from '@/ui/images/stored-image'
import style from '@/ui/nav/nav.module.scss'

/**
 * Decorative: the title beside it (visible or not) names the link.
 * An SVG is drawn as a mask in the link's text color, so it follows
 * the color scheme; a raster logo keeps its own colors.
 */
export function SiteLogo({
  image,
  isLogoOnly
}: {
  image: Image
  isLogoOnly: boolean
}) {
  const aspect = imageAspect(image)
  if (isSvg(image)) {
    const mask = `url("${image.url}")`
    return (
      <span
        aria-hidden
        className={`${style['logo']} ${style['logo-mask']}`}
        style={{
          aspectRatio: aspect,
          maskImage: mask,
          WebkitMaskImage: mask
        }}
      />
    )
  }
  return (
    <StoredImage
      image={image}
      alt=''
      className={style['logo']}
      width={Math.round(100 * aspect)}
      height={100}
      sizes={isLogoOnly ? '400px' : '96px'}
      preload
    />
  )
}
