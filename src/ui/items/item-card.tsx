'use client'

import clsx from 'clsx'
import NextImage from 'next/image'
import NextLink from 'next/link'
import React from 'react'

import type { EventClient } from '@/lib/events/types'
import type { ProjectClient } from '@/lib/projects/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PageItemClient } from '@/lib/types'
import { DraftBadge } from '@/ui/draft-badge'
import { FormattedItemDate } from '@/ui/items/item-date'
import styles from '@/ui/items/items.module.scss'
import {
  formattedItemTitle,
  formattedItemType,
  itemUrl
} from '@/ui/util'

export function ItemCard ({
  children,
  externalLink,
  index,
  isFeatured,
  isCategoryVisible,
  isPathTypeVisible,
  isTextOnly,
  item
}: {
  children?: React.ReactNode
  externalLink?: React.ReactNode
  index?: number
  isFeatured?: boolean
  isCategoryVisible?: boolean
  isPathTypeVisible?: boolean
  isTextOnly?: boolean
  item: PageItemClient
}) {
  if (!item) return null
  const linkTarget = itemUrl(item)
  const imageSize = isFeatured ? 680 : 350
  const isPriorityImage = !!(isFeatured || (index || 0) < 2)
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
            width={imageSize}
            height={imageSize / item.coverImage.aspect}
            loading={(index || 0) > 4 ? 'lazy' : undefined}
            priority={isPriorityImage}
            fetchPriority={isPriorityImage ? 'high' : 'auto'}
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

        {isCategoryVisible && (item as ReleaseClient | ProjectClient).type && (
          <p className={styles['card-item-type'] + ' category'}>
            {formattedItemType((item as ReleaseClient | ProjectClient).type!)}
          </p>
        )}

        <p className={styles['card-item-date']}>
          <FormattedItemDate
            item={item}
            timezone={(item as EventClient).venue?.timezone}
          />
        </p>

        {children}

        <p className={styles['card-external-link']}>
          {externalLink}
        </p>
      </div>
    </article>
  )
}
