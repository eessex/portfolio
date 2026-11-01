'use client'

import { useFormErrors } from '@/ui/form/form'
import { Input } from '@/ui/form/input'

/** Re-checks the signed-in admin's password, under a Form */
export function CurrentPasswordInput() {
  const errors = useFormErrors()

  return (
    <Input
      label='Current password'
      errors={errors?.currentPassword}
      attributes={{
        type: 'password',
        name: 'currentPassword',
        required: true,
        autoComplete: 'current-password'
      }}
    />
  )
}
