import NextLink from 'next/link'
import { connection } from 'next/server'

import { auth } from '@/auth'
import { embeddedItemTypes } from '@/lib/schemas'
import {
  camelToSentence,
  camelToSnake,
  snakeToCamel
} from '@/lib/strings'
import styles from '@/ui/admin-sidebar/admin-sidebar.module.scss'
import { CreateItemFromPathnameButton } from '@/ui/buttons/create-item-button'
import { EditButton } from '@/ui/buttons/edit-button'
import { LogoutButton } from '@/ui/buttons/logout-button'

const links = ['dashboard', ...embeddedItemTypes]

export async function AdminSidebar() {
  // opt out of prerender
  await connection()
  const session = await auth()
  if (!session?.user) return null

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
