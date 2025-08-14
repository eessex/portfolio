import TrashIcon from '@heroicons/react/24/outline/TrashIcon'
import PencilIcon from '@heroicons/react/24/solid/PencilIcon'
import styles from '@/ui/form/form.module.scss'

export function EditItemNav ({ id, onEdit, onDelete }: { id: string, onEdit: (id: string) => void, onDelete: (id: string) => void }) {
  return (
    <ul className={styles['edit-item-nav']}>
      <li>
        <button className='button sm' onClick={() => onEdit(id)}>
          <PencilIcon /> Edit
        </button>
      </li>
      <li>
        <button className='button button-secondary sm' onClick={() => onDelete(id)}>
          <TrashIcon /> Delete
        </button>
      </li>
    </ul>
  )
}
