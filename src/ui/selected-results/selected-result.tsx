import { XMarkIcon } from '@heroicons/react/16/solid'
import NextImage from 'next/image'

import type { Image } from '@/lib/images/schemas/db'
import type { EmbeddedItemType, PagePath } from '@/lib/schemas'
import { itemTypeSingulars } from '@/lib/schemas'
import { Input } from '@/ui/form/input'
import styles from '@/ui/selected-results/selected-results.module.scss'
import { itemTypeToLabel } from '@/ui/util'

const COVER_IMAGE_HEIGHT = 24

export type SelectedResultProps = {
  as?: 'div' | 'li'
  isRequired?: boolean
  item: {
    id: string
    coverImage?: Pick<Image, 'alt' | 'aspect' | 'caption' | 'url'>
  }
  itemType: EmbeddedItemType | PagePath
  /**
   * Form field name for the hidden id input. Defaults to
   * `${singular(itemType)}Id` (e.g. `releaseId`); pass explicitly when the
   * field represents a specific-purpose relation rather than the item type
   * itself (e.g. `coverImageId` for an `images` item).
   */
  name?: string
  children: React.ReactNode
  onClick: () => void
}

export const SelectedResult = ({
  as: Component = 'div',
  isRequired,
  item,
  itemType,
  name,
  children,
  onClick
}: SelectedResultProps) => {
  const formattedItemType = itemTypeToLabel(itemType, true, true)
  const formattedIdLabel = `${itemTypeToLabel(itemType, true)} ID`
  const fieldName = name ?? `${itemTypeSingulars[itemType]}Id`

  return (
    <Component className={styles['selected-result']}>
      <span className={styles['title']}>
        {item.coverImage && (
          <NextImage
            src={item.coverImage.url}
            alt={item.coverImage.alt || item.coverImage.caption || ''}
            width={Math.round(
              COVER_IMAGE_HEIGHT * item.coverImage.aspect
            )}
            height={COVER_IMAGE_HEIGHT}
            className={styles['cover-image']}
          />
        )}
        {children}
      </span>

      <button
        aria-label={`Remove ${formattedItemType}`}
        className='button-icon'
        onClick={onClick}
      >
        <XMarkIcon />
      </button>

      <Input
        label={formattedIdLabel}
        value={item.id}
        attributes={{
          name: fieldName,
          readOnly: true,
          type: 'hidden',
          required: isRequired
        }}
      />
    </Component>
  )
}
