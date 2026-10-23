'use client'

import { PencilIcon } from '@heroicons/react/24/outline'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import { ABOUT_PATH, type PagePath, pagePaths } from '@/lib/schemas'
import { editUrl, isEditOrNewUrl } from '@/ui/util'

export function EditButton() {
  const pathname = usePathname()
  if (!pathname || isEditOrNewUrl(pathname)) return null

  const pathnameParts = pathname.split('/')
  const isItemPage =
    pathnameParts.length > 2 &&
    pagePaths.includes(pathnameParts[1] as PagePath)
  if (!isItemPage && pathname !== `/${ABOUT_PATH}`) return null

  return (
    <NextLink href={editUrl(pathname)} className='button-primary'>
      <PencilIcon /> Edit page
    </NextLink>
  )
}
