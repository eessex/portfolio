'use client'

import { useRouter } from 'next/navigation'

import { editLink } from '@/lib/links/actions'
import { Form } from '@/ui/form/form'
import { EditLink } from '@/ui/links/edit-link-form'

export function NewLinkForm () {
  const router = useRouter()

  async function handleSubmit (formData: FormData) {
    const res = await editLink(formData)
    if (res?.ok && res.res) {
      router.push('/dashboard/links')
    }
    return res
  }

  return (
    <Form
      action={handleSubmit}
      submitButtonClassName='button-lg button-primary'
    >
      <EditLink />
    </Form>
  )
}
