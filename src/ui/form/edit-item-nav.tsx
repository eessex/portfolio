import PencilIcon from '@heroicons/react/24/outline/PencilIcon'
import TrashIcon from '@heroicons/react/24/outline/TrashIcon'

import styles from '@/ui/form/form.module.scss'

export function EditItemNav ({
  id,
  onEdit,
  onDelete
}: {
  id: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div>
      <h3 className='visually-hidden'>Edit Item</h3>
      <ul className={styles['edit-item-nav']}>
        <li>
          <button
            className='button sm'
            onClick={() => onEdit(id)}
          >
            <PencilIcon /> Edit
          </button>
        </li>
        <li>
          <button
            className='button button-secondary sm'
            onClick={() => onDelete(id)}
          >
            <TrashIcon /> Delete
          </button>
        </li>
      </ul>
    </div>
  )
}
