import type { Metadata } from 'next'
import { Suspense } from 'react'

import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { EditSettings } from '@/ui/form/edit-settings'
import { Loading } from '@/ui/loading'

const title = 'Dashboard'
export const metadata: Metadata = { title }

export default async function DashboardPage() {
  const settings = await fetchCachedSiteSettings()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        {settings ? (
          <AccordionDropdown title='Edit site settings'>
            <EditSettings settings={settings} />
          </AccordionDropdown>
        ) : (
          <section>
            <EditSettings />
          </section>
        )}
      </Suspense>
    </DashboardLayout>
  )
}
