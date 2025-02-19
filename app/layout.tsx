import type { Metadata } from 'next'
import { geistSans, geistMono } from './ui/fonts'
import Nav from './ui/nav'
import './globals.css'

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
        <header className='p-4 md:2'>
          <Nav />
        </header>

        <main className='grow h-full'>
          {children}
        </main>

        <footer className='p-4 md:2'>
          <p>© {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  )
}
