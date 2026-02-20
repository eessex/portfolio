'use client'

import { useRouter } from 'next/navigation'

import { editVenue } from '@/lib/venues/actions'
import { Form } from '@/ui/form/form'
import { EditVenue } from '@/ui/venues/edit-venue-form'

export function NewVenueForm () {
  const router = useRouter()

  async function handleSubmit (formData: FormData) {
    const res = await editVenue(formData)
    if (res?.ok && res.res) {
      router.push('/dashboard/venues')
    }
    return res
  }

  return (
    <Form
      action={handleSubmit}
      submitButtonClassName='button-lg button-primary'
    >
      <EditVenue />
    </Form>
  )
}
