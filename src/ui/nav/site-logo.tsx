import type { Image } from '@/lib/images/schemas/db'
import { imageAspect, isSvg } from '@/lib/images/util'
import { StoredImage } from '@/ui/images/stored-image'
import style from '@/ui/nav/nav.module.scss'

/**
 * Decorative: the title beside it (visible or not) names the link.
 * An inlined SVG is a mask in the text color, following the scheme;
 * anything else is an <img>, since a cross-origin mask needs CORS.
 */
export function SiteLogo({
  image,
  maskUrl,
  isLogoOnly
}: {
  image: Image
  /** An SVG logo inlined as a `data:` URL, for its mask */
  maskUrl?: string
  isLogoOnly: boolean
}) {
  const aspect = imageAspect(image)
  if (isSvg(image) && maskUrl) {
    const mask = `url("${maskUrl}")`
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
