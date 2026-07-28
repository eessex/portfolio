'use client'

import { authenticate } from '@/lib/users/actions'
import { Form } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

export function LoginForm() {
  return (
    <Form
      action={authenticate}
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
