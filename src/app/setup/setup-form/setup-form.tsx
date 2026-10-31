'use client'

import { completeSetup } from '@/lib/users/actions'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

export function SetupForm() {
  return (
    <Form
      action={completeSetup}
      isUnsavedChangesConfirmed={false}
      submitButtonText='Create account'
    >
      <SetupFields />
    </Form>
  )
}

// A separate component so useFormErrors() reads Form's own provider
// (it wraps whatever is passed as its children) rather than whatever
// SetupForm's own ancestors provide.
function SetupFields() {
  const errors = useFormErrors()

  return (
    <>
      <Input
        label='Setup code'
        description='From your build log — see the setup guide if you can’t find it.'
        attributes={{
          name: 'code',
          required: true,
          autoComplete: 'off'
        }}
      />
      <Input
        label='Name'
        errors={errors?.name}
        attributes={{ name: 'name', required: true }}
      />
      <Input
        label='Email'
        errors={errors?.email}
        attributes={{
          type: 'email',
          name: 'email',
          required: true
        }}
      />
      <Input
        label='Password'
        errors={errors?.password}
        attributes={{
          type: 'password',
          name: 'password',
          required: true,
          minLength: 8
        }}
      />
      <Input
        label='Confirm password'
        errors={errors?.confirmPassword}
        attributes={{
          type: 'password',
          name: 'confirmPassword',
          required: true,
          minLength: 8
        }}
      />
    </>
  )
}
