'use client'

import { useSearchParams } from 'next/navigation'

import { safeRedirectPath } from '@/lib/auth/redirect'
import { authenticate } from '@/lib/users/actions'
import { Form } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

export function LoginForm() {
  // set by next-auth when it bounces a logged-out visitor to /login
  const redirectTo = safeRedirectPath(
    useSearchParams().get('callbackUrl')
  )

  return (
    <Form
      action={authenticate}
      confirmUnsavedChanges={false}
      submitButtonText='Log in'
    >
      <Input
        label='Email'
        attributes={{
          type: 'email',
          name: 'email',
          required: true
        }}
      />
      <Input
        label='Password'
        attributes={{
          type: 'password',
          name: 'password',
          required: true
        }}
      />
      <input type='hidden' name='redirectTo' value={redirectTo} />
    </Form>
  )
}
