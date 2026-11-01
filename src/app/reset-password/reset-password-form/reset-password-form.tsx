'use client'

import { resetPasswordWithLink } from '@/lib/users/actions'
import { Form } from '@/ui/form/form'
import { Loading } from '@/ui/loading'
import { NewPasswordInputs } from '@/ui/users/new-password-inputs'
import {
  INCOMPLETE_LINK_MESSAGE,
  useLinkToken
} from '@/ui/users/one-time-link'

export function ResetPasswordForm() {
  const token = useLinkToken()

  if (token === null) return <Loading />
  if (!token) return <p>{INCOMPLETE_LINK_MESSAGE}</p>

  return (
    <Form
      action={resetPasswordWithLink}
      isUnsavedChangesConfirmed={false}
      isSubmittedUnchanged
      submitButtonText='Set new password'
    >
      <input type='hidden' name='token' value={token} />
      <p>
        Setting a new password signs you out on every other device.
      </p>
      <NewPasswordInputs />
    </Form>
  )
}
