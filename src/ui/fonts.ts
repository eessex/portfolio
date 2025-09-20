import { Geist, Geist_Mono as GeistMono, Inter, Lusitana } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lusitana'
})

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

export const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})
