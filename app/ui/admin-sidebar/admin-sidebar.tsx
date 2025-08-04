import Link from 'next/link'
import { EditButton } from '@/ui/edit-button/edit-button'
import { LogoutButton } from '@/ui/logout-button'
import styles from './admin-sidebar.module.scss'

export async function AdminSidebar () {
  const buttonClasses = `button button-secondary ${styles['button']}`

  return (
    <section className={`admin-sidebar ${styles['admin-sidebar']}`}>
      <nav>
        <ul>
          <li>
            <EditButton />
          </li>
          <li>
            <Link href='/dashboard' className={buttonClasses}>
              Dashboard
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <LogoutButton className={buttonClasses} />
          </li>
        </ul>
      </nav>
    </section>
  )
}
