import { Suspense } from 'react'

import { Loading } from '@/ui/loading'

export default function ListLayout({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h1 className='visually-hidden'>{title}</h1>

      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  )
}
