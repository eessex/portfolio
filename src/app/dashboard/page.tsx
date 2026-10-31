import type { Metadata } from 'next'
import { Suspense } from 'react'

import { currentUserId } from '@/lib/auth/guard'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { fetchUserById } from '@/lib/users/data'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { EditSettings } from '@/ui/form/edit-settings'
import { Loading } from '@/ui/loading'
import {
  EmailForm,
  NameForm,
  PasswordForm
} from '@/ui/users/account-forms'

const title = 'Dashboard'
export const metadata: Metadata = { title }

export default async function DashboardPage() {
  const settings = await fetchCachedSiteSettings()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        {settings ? (
          <AccordionDropdown title='Edit site settings'>
            <EditSettings settings={settings} />
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

// Reads the session, so it streams in under the static heading
async function AccountSettings() {
  const id = await currentUserId()
  const user = id ? await fetchUserById(id) : null
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
    </>
  )
}
