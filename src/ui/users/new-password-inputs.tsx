'use client'

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '@/lib/users/schemas'
import { useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

/** A password being set plus its confirmation, under a Form */
export function NewPasswordInputs({
  name = 'newPassword',
  label = 'New password'
}: {
  name?: string
  label?: string
}) {
  const errors = useFormErrors()
  // minLength/maxLength count UTF-16 units, the server code points:
  // minLength is only ever looser (emoji pass early), but maxLength
  // would block emoji passwords the server accepts, so it's left off
  const attributes = {
    type: 'password',
    required: true,
    autoComplete: 'new-password',
    minLength: MIN_PASSWORD_LENGTH
  }

  return (
    <>
      <Input
        label={label}
        description={`${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters. A passphrase of a few unrelated words works well.`}
        errors={errors?.[name]}
        attributes={{ ...attributes, name }}
      />
      <Input
        label={`Confirm ${label.toLowerCase()}`}
        errors={errors?.confirmPassword}
        attributes={{ ...attributes, name: 'confirmPassword' }}
      />
    </>
  )
}
