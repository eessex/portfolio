import Nav from '@/ui/nav/nav'
import Footer from '@/ui/footer/footer'
import { AdminSidebar } from './ui/admin-sidebar/admin-sidebar'
import { auth } from '../auth'
import { fetchSiteSettings } from './lib/data'
import { geistSans, geistMono } from '@/ui/fonts'
import type { Metadata } from 'next'
import clsx from 'clsx'
import '@/globals.scss'

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
        <a className='button visible-focus-only' id='skip-to-content' href='#content'>Skip to content</a>

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
