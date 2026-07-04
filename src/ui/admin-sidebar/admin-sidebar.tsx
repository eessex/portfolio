import NextLink from 'next/link'

import { embeddedItemTypes } from '@/lib/schemas'
import styles from '@/ui/admin-sidebar/admin-sidebar.module.scss'
import { CreateItemFromPathnameButton } from '@/ui/buttons/create-item-button'
import { EditButton } from '@/ui/buttons/edit-button'
import { LogoutButton } from '@/ui/buttons/logout-button'
import {
  camelToSentence,
  camelToSnake,
  snakeToCamel
} from '@/ui/util'

const links = [
  'dashboard',
  ...embeddedItemTypes.filter(
    // FIXME: editing not yet supported
    (itemType) => itemType !== 'publishedEditions'
  )
]

export async function AdminSidebar() {
  return (
    <section className={`admin-sidebar ${styles['admin-sidebar']}`}>
      <nav>
        <ul>
          <li>
            <CreateItemFromPathnameButton />
          </li>
          <li>
            <EditButton />
          </li>
          {links.map((link) => (
            <li key={link}>
              <NextLink
                href={`/dashboard${link === 'dashboard' ? '' : `/${camelToSnake(link)}`}`}
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
