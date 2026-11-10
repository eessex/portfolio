import type { Metadata } from 'next'
import { Suspense } from 'react'

import { currentUserId } from '@/lib/auth/guard'
import { fetchUserById } from '@/lib/users/data'
import { countUnusedRecoveryCodes } from '@/lib/users/recovery-codes'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import {
  EmailForm,
  NameForm,
  PasswordForm
} from '@/ui/users/account-forms'
import { RecoveryCodesForm } from '@/ui/users/recovery-codes'

const title = 'Account'
export const metadata: Metadata = { title }

export default function AccountPage() {
  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <AccountSettings />
      </Suspense>
    </DashboardLayout>
  )
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
      <AccordionDropdown title='Edit user name'>
        <NameForm name={user.name} />
      </AccordionDropdown>
      <AccordionDropdown title='Change email'>
        <EmailForm email={user.email} />
      </AccordionDropdown>
      <AccordionDropdown title='Change password'>
        <PasswordForm />
      </AccordionDropdown>
      <AccordionDropdown title='Recovery codes'>
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
