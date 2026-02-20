import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoginForm } from '@/app/login/login-form/login-form'

const title = 'Log in'
export const metadata: Metadata = { title }

export default function LoginPage () {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense>
        <LoginForm />
      </Suspense>
    </article>
  )
}
