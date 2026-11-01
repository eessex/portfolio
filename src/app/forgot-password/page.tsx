import type { Metadata } from 'next'
import Link from 'next/link'

import { ForgotPasswordForm } from '@/app/forgot-password/forgot-password-form/forgot-password-form'
import { FormPageLayout } from '@/ui/form/form-page-layout'

const title = 'Forgot password'
export const metadata: Metadata = { title }

export default function ForgotPasswordPage() {
  return (
    <FormPageLayout
      title={title}
      note={
        <>
          No codes left? The setup guide explains other ways back in.{' '}
          <Link href='/login'>Back to log in</Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </FormPageLayout>
  )
}
