import '@/ui/globals.scss'

import type { Metadata } from 'next'
import { Suspense } from 'react'

import { DeviceProvider } from '@/lib/device-context'
import { ogImage } from '@/lib/images/util'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { siteIconUrls } from '@/lib/site-settings/util'
import { AdminSidebar } from '@/ui/admin-sidebar/admin-sidebar'
import { Analytics, SpeedInsights } from '@/ui/analytics/analytics'
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
          ...ogImage(siteSettings.coverImage),
          alt:
            siteSettings?.coverImage.alt ||
            siteSettings?.coverImage.caption
        }
      ]
    : []
  const icons = siteIconUrls(siteSettings)
  return {
    title: {
      template: `%s | ${siteSettings?.title ?? 'Site Title'}`,
      default: siteSettings?.title ?? 'Site Title'
    },
    description: siteSettings?.description ?? 'Site Description',
    openGraph: { images },
    // no manifest: src/app/manifest.ts links itself
    icons: {
      icon: [
        { url: icons.icon32, type: 'image/png', sizes: '32x32' }
      ],
      apple: [{ url: icons.appleTouchIcon, sizes: '180x180' }]
    }
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
