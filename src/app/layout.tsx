import '@/ui/globals.scss'

import type { Metadata } from 'next'
import { Suspense } from 'react'

import { fetchSiteSettings } from '@/lib/site-settings/data'
import { AuthLayout } from '@/ui/auth-layout'
import { DeviceLayout } from '@/ui/device-layout'
import { geistMono, geistSans } from '@/ui/fonts'
import { Footer } from '@/ui/footer/footer'
import { Nav } from '@/ui/nav/nav'
import { ToastProvider } from '@/ui/toast/toast-context'

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await fetchSiteSettings()
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
          <Suspense fallback={null}>
            <DeviceLayout>
              <a
                className='button-primary visible-focus-only'
                id='skip-to-content'
                href='#content'
              >
                Skip to content
              </a>

              <Nav />
              <AuthLayout>
                <div>
                  <main>
                    <div id='content' />
                    {children}
                  </main>

                  <Footer />
                </div>
              </AuthLayout>
            </DeviceLayout>
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  )
}
