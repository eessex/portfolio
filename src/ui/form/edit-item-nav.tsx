import PencilIcon from '@heroicons/react/24/outline/PencilIcon'
import TrashIcon from '@heroicons/react/24/outline/TrashIcon'

import type { EmbeddedItemType } from '@/lib/types'
import styles from '@/ui/form/form.module.scss'
import { camelToSnake } from '@/ui/util'

export function EditItemNav({
  id,
  itemType,
  onDelete
}: {
  id: string
  itemType: EmbeddedItemType
  onDelete: (id: string) => void
}) {
  return (
    <div>
      <h3 className='visually-hidden'>Edit Item</h3>
      <ul className={styles['edit-item-nav']}>
        <li>
          <a
            className='button-primary'
            href={`${camelToSnake(itemType)}/${id}/edit`}
          >
            <PencilIcon /> Edit
          </a>
        </li>
        <li>
          <button
            className='button-outline'
            onClick={() => onDelete(id)}
          >
            <TrashIcon /> Delete
          </button>
        </li>
      </ul>
    </div>
  )
}
