import type { Metadata } from 'next'
import { geistSans, geistMono } from '@/ui/fonts'
import Nav from '@/ui/nav'
import Footer from '@/ui/footer/footer'
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

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <a className='button visible-focus-only' id='skip-to-content' href='#content'>Skip to content</a>

        <header className='p-4'>
          <Nav />
        </header>

        <main id='content'>
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
