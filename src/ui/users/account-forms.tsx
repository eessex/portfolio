'use client'

import {
  changeEmail,
  changeName,
  changePassword
} from '@/lib/users/actions'
import { Form, useFormErrors } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { NewPasswordInputs } from '@/ui/users/new-password-inputs'

const OTHER_SESSIONS_NOTE =
  'Saving signs you out on every other device.'

export function NameForm({ name }: { name: string }) {
  return (
    <Form action={changeName}>
      <NameFields name={name} />
    </Form>
  )
}

export function EmailForm({ email }: { email: string }) {
  return (
    <Form action={changeEmail}>
      <EmailFields email={email} />
      <p className={styles['submit-note']}>{OTHER_SESSIONS_NOTE}</p>
    </Form>
  )
}

export function PasswordForm() {
  return (
    <Form action={changePassword} submitButtonText='Change password'>
      <PasswordFields />
      <p className={styles['submit-note']}>{OTHER_SESSIONS_NOTE}</p>
    </Form>
  )
}

// Separate components so useFormErrors() reads each Form's provider
function NameFields({ name }: { name: string }) {
  const errors = useFormErrors()

  return (
    <Input
      label='Name'
      defaultValue={name}
      errors={errors?.name}
      attributes={{
        name: 'name',
        required: true,
        autoComplete: 'name'
      }}
    />
  )
}

function EmailFields({ email }: { email: string }) {
  const errors = useFormErrors()

  return (
    <>
      <Input
        label='Email'
        defaultValue={email}
        errors={errors?.email}
        attributes={{
          type: 'email',
          name: 'email',
          required: true,
          autoComplete: 'email'
        }}
      />
      <CurrentPasswordInput errors={errors?.currentPassword} />
    </>
  )
}

function PasswordFields() {
  const errors = useFormErrors()

  return (
    <>
      <CurrentPasswordInput errors={errors?.currentPassword} />
      <NewPasswordInputs />
    </>
  )
}

function CurrentPasswordInput({ errors }: { errors?: string[] }) {
  return (
    <Input
      label='Current password'
      errors={errors}
      attributes={{
        type: 'password',
        name: 'currentPassword',
        required: true,
        autoComplete: 'current-password'
      }}
    />
  )
}
