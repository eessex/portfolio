'use client'

import { useRouter } from 'next/navigation'

import { editEmbedCode } from '@/lib/embed-codes/actions'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import { Form } from '@/ui/form/form'

export function NewEmbedCodeForm () {
  const router = useRouter()

  async function handleSubmit (formData: FormData) {
    const res = await editEmbedCode(formData)
    if (res?.ok && res.res) {
      router.push('/dashboard/embed_codes')
    }
    return res
  }

  return (
    <Form
      action={handleSubmit}
      submitButtonClassName='button-lg button-primary'
    >
      <EditEmbedCode />
    </Form>
  )
}
