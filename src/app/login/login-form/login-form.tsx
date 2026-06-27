'use client'

import type { AuthError } from 'next-auth'

import type { FormResponse } from '@/lib/types'
import { authenticate } from '@/lib/users/actions'
import { Form } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

function authErrorMessage(error: AuthError) {
  if (error.name === 'CredentialsSignin') {
    return 'Invalid credentials.'
  }
}

function getErrorMessage(error: unknown): string | undefined {
  const authError = authErrorMessage(error as AuthError)
  if (authError) return authError
  throw error
}

async function onAuthenticate(
  formData: FormData
): Promise<FormResponse<Record<string, never>>> {
  try {
    return await authenticate(formData)
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error)
    }
  }
}

export function LoginForm() {
  return (
    <Form
      action={onAuthenticate}
      submitButtonText='Log in'
      submitButtonClassName='button-primary button-lg'
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
      <input type='hidden' name='redirectTo' value='/' />
    </Form>
  )
}
