import type { Metadata } from 'next'

import { AcceptInviteForm } from '@/app/invite/accept-invite-form/accept-invite-form'
import { FormPageLayout } from '@/ui/form/form-page-layout'

const title = 'Accept invite'
export const metadata: Metadata = { title }

export default function InvitePage() {
  return (
    <FormPageLayout title={title}>
      <AcceptInviteForm />
    </FormPageLayout>
  )
}
