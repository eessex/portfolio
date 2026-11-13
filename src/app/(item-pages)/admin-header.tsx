import { PencilIcon } from '@heroicons/react/24/outline'
import NextLink from 'next/link'
import { connection } from 'next/server'

import styles from '@/app/(item-pages)/admin-header.module.scss'
import { isAuthed } from '@/lib/auth/guard'

/** Admin actions above a page, e.g. "New event" or "Edit" */
export function AdminHeader({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={` ${styles['header']} ${className ?? ''}`}>
      {children}
    </div>
  )
}

export async function EditItemHeader({ href }: { href: string }) {
  // per request, so the session never reaches the shell
  await connection()
  if (!(await isAuthed())) return null

  return (
    <AdminHeader className={styles['edit-item-header']}>
      <NextLink href={href} className='button-outline'>
        <PencilIcon /> Edit
      </NextLink>
    </AdminHeader>
  )
}
