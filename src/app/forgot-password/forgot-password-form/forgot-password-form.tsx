'use client'

import { recoverAccount } from '@/lib/users/actions'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { NewPasswordInputs } from '@/ui/users/new-password-inputs'

export function ForgotPasswordForm() {
  return (
    <Form
      action={recoverAccount}
      isUnsavedChangesConfirmed={false}
      submitButtonText='Set new password'
    >
      <ForgotPasswordFields />
    </Form>
  )
}

// Separate so useFormErrors() reads the Form's provider
function ForgotPasswordFields() {
  const errors = useFormErrors()

  return (
    <>
      <Input
        label='Email'
        errors={errors?.email}
        attributes={{
          type: 'email',
          name: 'email',
          required: true,
          autoComplete: 'username'
        }}
      />
      <Input
        label='Recovery code'
        description='One of the codes you saved when you set up your account. Each works once.'
        errors={errors?.code}
        attributes={{
          name: 'code',
          required: true,
          autoComplete: 'off'
        }}
      />
      <NewPasswordInputs />
    </>
  )
}
