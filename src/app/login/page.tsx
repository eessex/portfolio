import LoginForm from '@/ui/login-form'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Log in'
export const metadata: Metadata = { title }

export default function LoginPage () {
  return (
    <div className='p-4 md:2'>
      <h1>{title}</h1>

      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
