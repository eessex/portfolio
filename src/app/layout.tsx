import '@/ui/globals.scss'

import clsx from 'clsx'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { auth } from '@/api/auth'
import { DeviceProvider } from '@/lib/device-context'
import { SessionProvider } from '@/lib/session-context'
import { fetchSiteSettings } from '@/lib/site-settings/data'
import { AdminSidebar } from '@/ui/admin-sidebar/admin-sidebar'
import {
  geistMono,
  geistSans
} from '@/ui/fonts'
import { Footer } from '@/ui/footer/footer'
import { Nav } from '@/ui/nav/nav'
import { ToastProvider } from '@/ui/toast/toast-context'

export async function generateMetadata (): Promise<Metadata> {
  const siteSettings = await fetchSiteSettings()
  const images = siteSettings?.coverImage
    ? [{
        url: siteSettings?.coverImage.url,
        width: 1200 * siteSettings?.coverImage.aspect,
        height: 1200,
        alt: siteSettings?.coverImage.alt || siteSettings?.coverImage.caption
      }]
    : []
  return {
    title: {
      template: `%s | ${siteSettings?.title ?? 'Site Title'}`,
      default: siteSettings?.title ?? 'Site Title'
    },
    description: siteSettings?.description ?? 'Site Description',
    openGraph: { images }
  }
}

export default async function RootLayout ({ children }: Readonly<{
  children: React.ReactNode
}>) {
  const [siteSettings, session, reqHeaders] = await Promise.all([
    fetchSiteSettings(),
    auth(),
    headers()
  ])
  const isLoggedIn = !!session?.user
  const userAgent = reqHeaders.get('user-agent') || ''
  const isMobileUA = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)

  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ToastProvider>
          <SessionProvider session={session}>
            <DeviceProvider initialIsMobile={isMobileUA}>
              <a
                className='button visible-focus-only'
                id='skip-to-content'
                href='#content'
              >
                Skip to content
              </a>

              <Nav title={siteSettings?.title} />

              <div className={clsx('body-container', isLoggedIn && 'admin')}>
                {isLoggedIn && <AdminSidebar />}
                <div>
                  <main>
                    <div id='content' />
                    {children}
                  </main>

                  <Footer />
                </div>
              </div>
            </DeviceProvider>
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
