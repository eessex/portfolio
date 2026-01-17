import NextLink from 'next/link'

import { AddItemButton } from '@/ui/admin-sidebar/add-item-button'
import styles from '@/ui/admin-sidebar/admin-sidebar.module.scss'
import { EditButton } from '@/ui/admin-sidebar/edit-button'
import { LogoutButton } from '@/ui/logout-button'
import {
  camelToSentence,
  snakeToCamel
} from '@/ui/util'

export async function AdminSidebar () {
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
                className='button'
              >
                {camelToSentence(snakeToCamel(link))}
              </NextLink>
            </li>
          ))}
        </ul>

        <ul>
          <li>
            <LogoutButton />
          </li>
        </ul>
      </nav>
    </section>
  )
}
