import NextLink from 'next/link'
import { connection } from 'next/server'

import { auth } from '@/auth'
import { dashboardItemTypes } from '@/lib/schemas'
import { camelToSentence, snakeToCamel } from '@/lib/strings'
import styles from '@/ui/admin-sidebar/admin-sidebar.module.scss'
import { CreateItemFromPathnameButton } from '@/ui/buttons/create-item-button'
import { EditButton } from '@/ui/buttons/edit-button'
import { LogoutButton } from '@/ui/buttons/logout-button'
import { IsAdminSync } from '@/ui/is-admin-sync'
import { dashboardUrl } from '@/ui/routes'

const links = ['dashboard' as const, ...dashboardItemTypes]

export async function AdminSidebar() {
  // opt out of prerender
  await connection()
  const session = await auth()
  // re-rendered on login/logout, so it keeps useIsAdmin current
  if (!session?.user) return <IsAdminSync isAdmin={false} />

  return (
    <section className={`admin-sidebar ${styles['admin-sidebar']}`}>
      <IsAdminSync isAdmin />
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
                href={
                  link === 'dashboard'
                    ? '/dashboard'
                    : dashboardUrl(link)
                }
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
