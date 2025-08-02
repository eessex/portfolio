import { fetchEmbedCodes, fetchSiteSettings } from '@/lib/data'
import AccordionDropdown from '@/ui/accordion-dropdown/accordion-dropdown'
import { EmbedCodeDashboard } from '@/ui/embed-codes/embed-code-dashboard'
import EditSettings from '@/ui/form/edit-settings'
import Loading from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard'
export const metadata: Metadata = { title }

export default async function DashboardPage () {
  const [settings, embedCodes] = await Promise.all([
    fetchSiteSettings(),
    fetchEmbedCodes()
  ])

  return (
    <div>
      <h1 className='p-4'>
        {title}
      </h1>

      {settings && (
        <div className='p-4'>
          <AccordionDropdown title='Edit site settings'>
            <EditSettings settings={settings} />
          </AccordionDropdown>

          <Suspense fallback={<Loading />}>
            <AccordionDropdown title='Edit embed codes'>
              <EmbedCodeDashboard embedCodes={embedCodes} />
            </AccordionDropdown>
          </Suspense>
        </div>
      )}
    </div>
  )
}
