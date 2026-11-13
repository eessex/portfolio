'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ABOUT_EDIT_URL } from '@/lib/auth/paths'
import { completeSetup } from '@/lib/users/actions'
import { Form, useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'
import { NewPasswordInputs } from '@/ui/users/new-password-inputs'
import { RecoveryCodesList } from '@/ui/users/recovery-codes'

export function SetupForm({
  isAccountCreated = false
}: {
  isAccountCreated?: boolean
}) {
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>()
  // Only a visit after setup redirects, not this form's own submit
  const [isCreatedOnLoad] = useState(isAccountCreated)
  const router = useRouter()

  useEffect(() => {
    if (isCreatedOnLoad) router.replace(ABOUT_EDIT_URL)
  }, [isCreatedOnLoad, router])

  // The account exists and is signed in by now
  if (recoveryCodes) {
    return (
      <RecoveryCodesList
        codes={recoveryCodes}
        onDone={() => router.push(ABOUT_EDIT_URL)}
      />
    )
  }

  if (isAccountCreated) {
    return (
      <p>
        Your account is set up.{' '}
        <Link href={ABOUT_EDIT_URL}>Set up your About page</Link>
      </p>
    )
  }

  return (
    <Form
      action={completeSetup}
      isUnsavedChangesConfirmed={false}
      isSubmittedUnchanged
      submitButtonText='Create account'
      onSuccess={(res) => setRecoveryCodes(res?.recoveryCodes)}
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
      <NewPasswordInputs name='password' label='Password' />
    </>
  )
}
