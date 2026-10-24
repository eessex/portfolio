'use client'

import clsx from 'clsx'
import NextLink from 'next/link'
import React from 'react'

import { MOBILE_CONTENT_SIZE } from '@/lib/images/util'
import type { PageItemClient } from '@/lib/types'
import { FormattedItemDate } from '@/ui/items/item-date'
import {
  itemCategory,
  ItemCoverImage,
  ItemImageBadge,
  itemMedia,
  ItemMediaIcons,
  ItemTitle
} from '@/ui/items/item-parts'
import styles from '@/ui/items/items.module.scss'
import { formattedItemType, itemUrl } from '@/ui/util'

export function ItemCard({
  children,
  className,
  externalLink,
  imageSize,
  index,
  isBadgeOnImage,
  isFeatured,
  isCategoryVisible,
  isLazy,
  isMediaIconsVisible,
  isPathTypeVisible,
  isTextOnly,
  item
}: {
  children?: React.ReactNode
  className?: string
  externalLink?: React.ReactNode
  /** overrides the list/featured image width, e.g. a carousel's row height × aspect */
  imageSize?: { width: number; sizes: string }
  index?: number
  /**
   * Shows the unpublished badge on the image's corner, and a square
   * placeholder (to hold it) when there's no cover
   */
  isBadgeOnImage?: boolean
  isFeatured?: boolean
  isCategoryVisible?: boolean
  /** lazy-loads the image, never prioritized (e.g. below the fold) */
  isLazy?: boolean
  /** audio/video icons in the card's bottom-right corner */
  isMediaIconsVisible?: boolean
  isPathTypeVisible?: boolean
  isTextOnly?: boolean
  item: PageItemClient
}) {
  if (!item) return null
  const linkTarget = itemUrl(item)
  const category = isCategoryVisible && itemCategory(item)
  const media = itemMedia(item)
  return (
    <article
      className={clsx(
        styles.card,
        isFeatured && styles['featured-card'],
        className
      )}
    >
      {(item.coverImage || isBadgeOnImage) && !isTextOnly && (
        <NextLink
          href={linkTarget}
          aria-hidden='true'
          tabIndex={-1}
          className={styles['card-media']}
        >
          {item.coverImage ? (
            <ItemCoverImage
              image={item.coverImage}
              width={imageSize?.width ?? (isFeatured ? 680 : 350)}
              sizes={
                imageSize?.sizes ??
                (isFeatured
                  ? `(max-width: 768px) ${MOBILE_CONTENT_SIZE}, 680px`
                  : '(max-width: 768px) 50vw, 350px')
              }
              index={index}
              isFeatured={isFeatured}
              isLazy={isLazy}
              priorityBefore={2}
              lazyAfter={4}
            />
          ) : (
            <span className={styles['card-placeholder']} />
          )}
          {isBadgeOnImage && <ItemImageBadge item={item} />}
        </NextLink>
      )}
      <div className={styles['card-meta']}>
        {isPathTypeVisible && (
          <p className={styles['card-item-type']}>
            {formattedItemType(item.path)}
          </p>
        )}

        <h3 className={styles['card-title']}>
          <NextLink href={linkTarget}>
            <ItemTitle item={item} isBadgeOnImage={isBadgeOnImage} />
          </NextLink>
        </h3>

        {category && (
          <p className={styles['card-item-type'] + ' category'}>
            {category}
          </p>
        )}

        <p className={styles['card-item-date']}>
          <FormattedItemDate item={item} />
        </p>

        {isMediaIconsVisible &&
          (media.hasAudio || media.hasVideo) && (
            <p className={styles['card-media-icons']}>
              <ItemMediaIcons {...media} />
            </p>
          )}

        {children}

        <p className={styles['card-external-link']}>{externalLink}</p>
      </div>
    </article>
  )
}
