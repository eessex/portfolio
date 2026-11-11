'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { acceptInvite } from '@/lib/users/actions'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { Loading } from '@/ui/loading'
import { NewPasswordInputs } from '@/ui/users/new-password-inputs'
import {
  INCOMPLETE_LINK_MESSAGE,
  useLinkToken
} from '@/ui/users/one-time-link'
import { RecoveryCodesList } from '@/ui/users/recovery-codes'

export function AcceptInviteForm() {
  const token = useLinkToken()
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>()
  const router = useRouter()

  // The account exists and is signed in by now
  if (recoveryCodes) {
    return (
      <RecoveryCodesList
        codes={recoveryCodes}
        onDone={() => router.push('/settings')}
      />
    )
  }

  if (token === null) return <Loading />
  if (!token) return <p>{INCOMPLETE_LINK_MESSAGE}</p>

  return (
    <Form
      action={acceptInvite}
      isUnsavedChangesConfirmed={false}
      isSubmittedUnchanged
      submitButtonText='Create account'
      onSuccess={(res) => setRecoveryCodes(res?.recoveryCodes)}
    >
      <input type='hidden' name='token' value={token} />
      <AcceptInviteFields />
    </Form>
  )
}

// Separate so useFormErrors() reads the Form's provider
function AcceptInviteFields() {
  const errors = useFormErrors()

  return (
    <>
      <Input
        label='Name'
        errors={errors?.name}
        attributes={{
          name: 'name',
          required: true,
          autoComplete: 'name'
        }}
      />
      <Input
        label='Email'
        description='You’ll log in with this.'
        errors={errors?.email}
        attributes={{
          type: 'email',
          name: 'email',
          required: true,
          autoComplete: 'email'
        }}
      />
      <NewPasswordInputs label='Password' />
    </>
  )
}
