'use client'

import { recoverAccount } from '@/lib/users/actions'
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '@/lib/users/schemas'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

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
      <Input
        label='New password'
        description={`${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters. A passphrase of a few unrelated words works well.`}
        errors={errors?.newPassword}
        attributes={{
          type: 'password',
          name: 'newPassword',
          required: true,
          autoComplete: 'new-password',
          minLength: MIN_PASSWORD_LENGTH
        }}
      />
      <Input
        label='Confirm new password'
        errors={errors?.confirmPassword}
        attributes={{
          type: 'password',
          name: 'confirmPassword',
          required: true,
          autoComplete: 'new-password',
          minLength: MIN_PASSWORD_LENGTH
        }}
      />
    </>
  )
}
