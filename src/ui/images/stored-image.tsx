'use client'

import NextImage, { type ImageProps } from 'next/image'

import {
  hasVariants,
  imageVariantUrl,
  isSvg
} from '@/lib/images/util'

export interface StoredImageSource {
  url: string
  format?: string
  variantVersion?: number
  blurDataUrl?: string
}

/**
 * next/image for an uploaded image. With variants, a per-component
 * loader serves its WebP widths straight from storage (not a
 * global loader, so files in public/ are untouched); without them,
 * the optimizer resizes the original until the backfill runs.
 * SVGs are served as uploaded (sanitized), skipping the optimizer.
 */
export function StoredImage({
  image,
  ...props
}: Omit<
  ImageProps,
  'src' | 'loader' | 'placeholder' | 'blurDataURL'
> & {
  image: StoredImageSource
}) {
  if (isSvg(image)) {
    return <NextImage src={image.url} unoptimized {...props} />
  }
  if (!hasVariants(image)) {
    return <NextImage src={image.url} {...props} />
  }
  return (
    <NextImage
      src={image.url}
      loader={({ src, width }) =>
        imageVariantUrl(src, width, image.variantVersion!)
      }
      placeholder={image.blurDataUrl ? 'blur' : 'empty'}
      blurDataURL={image.blurDataUrl}
      {...props}
    />
  )
}
