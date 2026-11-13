import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'

import { SetupForm } from '@/app/setup/setup-form/setup-form'
import { isAuthed } from '@/lib/auth/guard'
import { hasUsers } from '@/lib/users/data'
import { FormPageLayout } from '@/ui/form/form-page-layout'

const title = 'Set up your site'
export const metadata: Metadata = { title }

/**
 * No Suspense boundary, so there's no shell to flash before the 404.
 * connection(): a submit can create the user at any moment.
 */
export default async function SetupPage() {
  await connection()
  const isAccountCreated = await hasUsers()
  if (isAccountCreated && !(await isAuthed())) notFound()

  return (
    <FormPageLayout title={title}>
      {/* Same tree once signed in: completeSetup's cookie re-renders
          this page, and SetupForm must keep the codes it holds */}
      <SetupForm isAccountCreated={isAccountCreated} />
    </FormPageLayout>
  )
}
