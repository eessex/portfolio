import { fetchSiteSettings } from '@/lib/data'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { EditSettings } from '@/ui/form/edit-settings'
import { Loading } from '@/ui/loading'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard'
export const metadata: Metadata = { title }

export default async function DashboardPage () {
  const settings = await fetchSiteSettings()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        {settings && (
          <AccordionDropdown title='Edit site settings'>
            <EditSettings settings={settings} />
          </AccordionDropdown>
        )}
      </Suspense>
    </DashboardLayout>
  )
}
