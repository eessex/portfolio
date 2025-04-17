import { fetchSiteSettings } from '@/lib/data'
import AccordionDropdown from '@/ui/accordion-dropdown/accordion-dropdown'
import EditSettings from '@/ui/edit-settings'
import { Metadata } from 'next'

const title = 'Dashboard'
export const metadata: Metadata = { title }

export default async function DashboardPage () {
  const [settings] = await Promise.all([
    fetchSiteSettings(),
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
        </div>
      )}
    </div>
  )
}
