import type { Metadata } from 'next'
import { Suspense } from 'react'

import { currentUserId } from '@/lib/auth/guard'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { navPaths } from '@/lib/site-settings/nav-paths'
import { fetchUserById } from '@/lib/users/data'
import { countUnusedRecoveryCodes } from '@/lib/users/recovery-codes'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { EditSettings } from '@/ui/form/edit-settings'
import { Loading } from '@/ui/loading'
import type { NavItemStatuses } from '@/ui/nav/nav-items-fields'
import { fetchNavItemStatus } from '@/ui/nav/nav-status'
import {
  EmailForm,
  NameForm,
  PasswordForm
} from '@/ui/users/account-forms'
import { RecoveryCodesForm } from '@/ui/users/recovery-codes'

const title = 'Dashboard'
export const metadata: Metadata = { title }

export default async function DashboardPage() {
  const [settings, navStatuses] = await Promise.all([
    fetchCachedSiteSettings(),
    fetchNavStatuses()
  ])

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        {settings ? (
          <AccordionDropdown title='Edit site settings'>
            <EditSettings
              settings={settings}
              navStatuses={navStatuses}
            />
          </AccordionDropdown>
        ) : (
          <section className={styles['dashboard-inner']}>
            <h2>Welcome! Let&apos;s set up your site:</h2>
            <EditSettings />
          </section>
        )}
      </Suspense>

      <section
        aria-labelledby='account-heading'
        className={styles['dashboard-section']}
      >
        <h2 id='account-heading'>Account</h2>
        <Suspense fallback={<Loading />}>
          <AccountSettings />
        </Suspense>
      </section>
    </DashboardLayout>
  )
}

async function fetchNavStatuses(): Promise<NavItemStatuses> {
  const statuses = await Promise.all(navPaths.map(fetchNavItemStatus))
  return Object.fromEntries(
    navPaths.map((path, i) => [path, statuses[i]])
  ) as NavItemStatuses
}

// Reads the session, so it streams in under the static heading
async function AccountSettings() {
  const id = await currentUserId()
  if (!id) return null
  const [user, unusedRecoveryCodes] = await Promise.all([
    fetchUserById(id),
    // A failed count shouldn't take down the other account forms
    countUnusedRecoveryCodes(id).catch((error) => {
      console.error('Failed to count recovery codes', error)
      return null
    })
  ])
  if (!user) return null

  return (
    <>
      <AccordionDropdown title='Edit user name' headingLevel={3}>
        <NameForm name={user.name} />
      </AccordionDropdown>
      <AccordionDropdown title='Change email' headingLevel={3}>
        <EmailForm email={user.email} />
      </AccordionDropdown>
      <AccordionDropdown title='Change password' headingLevel={3}>
        <PasswordForm />
      </AccordionDropdown>
      <AccordionDropdown title='Recovery codes' headingLevel={3}>
        {unusedRecoveryCodes === null ? (
          <p>
            Couldn&apos;t load recovery codes — reload to try again.
          </p>
        ) : (
          <RecoveryCodesForm unusedCount={unusedRecoveryCodes} />
        )}
      </AccordionDropdown>
    </>
  )
}
