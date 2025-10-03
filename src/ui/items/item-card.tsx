'use client'

import clsx from 'clsx'
import NextImage from 'next/image'
import NextLink from 'next/link'
import React from 'react'

import type { PageItemClient } from '@/lib/types'
import { DraftBadge } from '@/ui/draft-badge'
import styles from '@/ui/items/items.module.scss'
import {
  formattedItemTitle,
  formattedItemType,
  itemUrl
} from '@/ui/util'

export function ItemCard ({
  item,
  index,
  children,
  isFeatured,
  isTextOnly,
  isPathTypeVisible,
  externalLink
}: {
  item: PageItemClient
  index?: number
  children?: React.ReactNode
  isFeatured?: boolean
  isTextOnly?: boolean
  isPathTypeVisible?: boolean
  externalLink?: React.ReactNode
}) {
  if (!item) return null
  const linkTarget = itemUrl(item)

  return (
    <article
      className={clsx(styles.card, isFeatured && styles['featured-card'])}
    >
      {item.coverImage && !isTextOnly && (
        <NextLink
          href={linkTarget}
          aria-hidden='true'
          tabIndex={-1}
        >
          <NextImage
            src={item.coverImage.url}
            alt={item.coverImage.alt || item.coverImage.caption || ''}
            title={item.coverImage.caption || item.coverImage.alt || undefined}
            width={500 * item.coverImage.aspect}
            height={500}
            loading={(index || 0) > 4 ? 'lazy' : undefined}
            priority={!!(isFeatured || (index || 0) < 2)}
            aria-hidden='true'
          />
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
            {formattedItemTitle(item)}
            {!item.isPublished && <DraftBadge />}
          </NextLink>
        </h3>

        {children}

        <p className={styles['card-external-link']}>
          {externalLink}
        </p>
      </div>
    </article>
  )
}
