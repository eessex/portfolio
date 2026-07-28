import '@/ui/globals.scss'

import type { Metadata } from 'next'
import { Suspense } from 'react'

import { DeviceProvider } from '@/lib/device-context'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { AdminSidebar } from '@/ui/admin-sidebar/admin-sidebar'
import { geistMono, geistSans } from '@/ui/fonts'
import { Footer } from '@/ui/footer/footer'
import { Loading } from '@/ui/loading'
import { Nav } from '@/ui/nav/nav'
import { ToastProvider } from '@/ui/toast/toast-context'

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await fetchCachedSiteSettings()
  const images = siteSettings?.coverImage
    ? [
        {
          url: siteSettings?.coverImage.url,
          width: Math.round(1200 * siteSettings?.coverImage.aspect),
          height: 1200,
          alt:
            siteSettings?.coverImage.alt ||
            siteSettings?.coverImage.caption
        }
      ]
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

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ToastProvider>
          <a
            className='button-primary visible-focus-only'
            id='skip-to-content'
            href='#content'
          >
            Skip to content
          </a>

          <Nav />
          <DeviceProvider>
            <div className='body-container'>
              <Suspense fallback={null}>
                <AdminSidebar />
              </Suspense>

              <div>
                <main>
                  <div id='content' />
                  <Suspense fallback={<Loading />}>
                    {children}
                  </Suspense>
                </main>

                <Footer />
              </div>
            </div>
          </DeviceProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
