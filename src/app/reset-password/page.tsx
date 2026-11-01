import type { Metadata } from 'next'

import { ResetPasswordForm } from '@/app/reset-password/reset-password-form/reset-password-form'
import { FormPageLayout } from '@/ui/form/form-page-layout'

const title = 'Set a new password'
export const metadata: Metadata = { title }

export default function ResetPasswordPage() {
  return (
    <FormPageLayout title={title}>
      <ResetPasswordForm />
    </FormPageLayout>
  )
}
