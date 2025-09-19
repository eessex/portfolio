import { fetchSiteSettings } from '@/lib/site-settings/data'
import { AdminSidebar } from '@/ui/admin-sidebar/admin-sidebar'
import { geistMono, geistSans } from '@/ui/fonts'
import { Footer } from '@/ui/footer/footer'
import '@/ui/globals.scss'
import { Nav } from '@/ui/nav/nav'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { auth } from '../../auth'

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'Site Title'
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Site Description'

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteTitle}`,
    default: siteTitle,
  },
  description: siteDescription
}

export default async function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await fetchSiteSettings()
  const session = await auth()
  const isAdmin = !!session?.user

  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <a
          className='button visible-focus-only'
          id='skip-to-content'
          href='#content'
        >
          Skip to content
        </a>

        <Nav title={siteSettings?.title} />

        <div className={clsx('body-container', isAdmin && 'admin')}>
          {isAdmin && <AdminSidebar />}
          <div>
            <main>
              <div id='content' />
              {children}
            </main>

            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
