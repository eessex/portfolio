import { AddItemButton } from '@/ui/admin-sidebar/add-item-button'
import styles from '@/ui/admin-sidebar/admin-sidebar.module.scss'
import { EditButton } from '@/ui/edit-button/edit-button'
import { LogoutButton } from '@/ui/logout-button'
import NextLink from 'next/link'
import { camelToSentence, snakeToCamel } from '../util'

export async function AdminSidebar () {
  const buttonClasses = `button button-secondary ${styles['button']}`

  const links = [
    'dashboard',
    'embed_codes',
    'images',
    'links',
    'venues'
  ]

  return (
    <section className={`admin-sidebar ${styles['admin-sidebar']}`}>
      <nav>
        <ul>
          <AddItemButton />
          <EditButton />
          {links.map(link => (
            <li key={link}>
              <NextLink
                href={`/dashboard${link === 'dashboard' ? '' : `/${link}`}`}
                className={buttonClasses}
              >
                {camelToSentence(snakeToCamel(link))}
              </NextLink>
            </li>
          ))}
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
