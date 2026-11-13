import { connection } from 'next/server'
import { Suspense } from 'react'

import { AdminHeader } from '@/app/(item-pages)/admin-header'
import { isAuthed } from '@/lib/auth/guard'
import { isCreatable } from '@/lib/creatable'
import type { PagePath } from '@/lib/schemas'
import { CreateItemButton } from '@/ui/buttons/create-item-button'
import { Loading } from '@/ui/loading'
import { newUrl } from '@/ui/routes'

export default function ListLayout({
  title,
  itemType,
  children
}: {
  title: string
  /** Offers admins "New {type}" in the header */
  itemType?: PagePath
  children: React.ReactNode
}) {
  return (
    <div>
      <h1 className='visually-hidden'>{title}</h1>

      {itemType && (
        <Suspense fallback={null}>
          <CreateItemHeader itemType={itemType} />
        </Suspense>
      )}

      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  )
}

export async function CreateItemHeader({
  itemType
}: {
  itemType: PagePath
}) {
  // per request, so a fail-open isCreatable never reaches the shell
  await connection()
  // checked first: visitors never pay for isCreatable
  if (!(await isAuthed())) return null
  // like the nav, no link to a create form that can't succeed
  if (!(await isCreatable(itemType))) return null

  return (
    <AdminHeader>
      <CreateItemButton
        className='button-outline'
        itemType={itemType}
        href={newUrl(`/${itemType}`)}
      />
    </AdminHeader>
  )
}
