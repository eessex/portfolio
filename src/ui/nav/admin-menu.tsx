import NextLink from 'next/link'
import { connection } from 'next/server'

import { currentSession } from '@/lib/auth/guard'
import { dashboardItemTypes } from '@/lib/schemas'
import { camelToSentence, snakeToCamel } from '@/lib/strings'
import { LogoutButton } from '@/ui/buttons/logout-button'
import { IsAdminSync } from '@/ui/is-admin-sync'
import styles from '@/ui/nav/admin-menu.module.scss'
import { AdminMenuDisclosure } from '@/ui/nav/admin-menu-disclosure'
import { NavItemLink } from '@/ui/nav/nav-item-link'
import {
  type NavItem,
  navItems,
  type NavPath
} from '@/ui/nav/nav-items'
import { fetchNavItemStatus } from '@/ui/nav/nav-status'
import { dashboardUrl } from '@/ui/routes'

function AdminMenuGroup({
  id,
  label,
  children
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  const labelId = `admin-menu-${id}`
  return (
    <div role='group' aria-labelledby={labelId}>
      <span id={labelId} className={styles['label']}>
        {label}
      </span>
      <ul>{children}</ul>
    </div>
  )
}

/** Paths left off the bar, so their pages stay one click away */
async function hiddenItems(navPaths: NavPath[]): Promise<NavItem[]> {
  const items = navItems.filter((item) =>
    navPaths.includes(item.navPath)
  )
  const statuses = await Promise.all(
    items.map(({ navPath }) => fetchNavItemStatus(navPath))
  )
  return items.flatMap((item, i) => {
    const status = statuses[i]
    return status ? [{ ...item, status }] : []
  })
}

export async function AdminMenu({
  hiddenNavPaths
}: {
  hiddenNavPaths: NavPath[]
}) {
  // opt out of prerender
  await connection()
  // statuses are cached and session-free, so not a waterfall
  const [session, hidden] = await Promise.all([
    currentSession(),
    hiddenItems(hiddenNavPaths)
  ])
  // re-rendered on login/logout, so it keeps useIsAdmin current
  if (!session?.user) return <IsAdminSync isAdmin={false} />

  return (
    <>
      <IsAdminSync isAdmin />
      <AdminMenuDisclosure>
        {hidden.length > 0 && (
          <AdminMenuGroup id='hidden' label='Hidden pages'>
            {hidden.map((item) => (
              <li
                key={item.navPath}
                className={styles['hidden-item']}
              >
                <NavItemLink
                  item={item}
                  className='button'
                  createClassName='button'
                />
              </li>
            ))}
          </AdminMenuGroup>
        )}

        <AdminMenuGroup id='manage' label='Manage'>
          <li>
            <NextLink href='/dashboard' className='button'>
              Site settings
            </NextLink>
          </li>
          <li>
            <NextLink href='/dashboard/users' className='button'>
              Users
            </NextLink>
          </li>
        </AdminMenuGroup>

        <AdminMenuGroup id='library' label='Library'>
          {dashboardItemTypes.map((itemType) => (
            <li key={itemType}>
              <NextLink
                href={dashboardUrl(itemType)}
                className='button'
              >
                {camelToSentence(snakeToCamel(itemType))}
              </NextLink>
            </li>
          ))}
        </AdminMenuGroup>

        <ul>
          <li>
            <LogoutButton />
          </li>
        </ul>
      </AdminMenuDisclosure>
    </>
  )
}
