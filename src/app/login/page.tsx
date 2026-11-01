import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { LoginForm } from '@/app/login/login-form/login-form'
import { FormPageLayout } from '@/ui/form/form-page-layout'

const title = 'Log in'
export const metadata: Metadata = { title }

export default function LoginPage() {
  return (
    <FormPageLayout
      title={title}
      note={<Link href='/forgot-password'>Forgot password?</Link>}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </FormPageLayout>
  )
}
