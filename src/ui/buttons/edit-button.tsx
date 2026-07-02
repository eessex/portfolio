'use client'

import { PencilIcon } from '@heroicons/react/24/outline'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import { type PagePath, pagePaths } from '@/lib/schemas'

export function EditButton() {
  const pathname = usePathname()
  const pathnameParts = pathname.split('/')
  const firstPart = pathnameParts[1]
  const isEditablePath = pagePaths.includes(firstPart as PagePath)

  if (
    !isEditablePath ||
    (pathnameParts.length === 2 && firstPart !== 'about')
  )
    return null
  if (!pathname) return null

  return (
    <NextLink href={`${pathname}/edit`} className='button-primary'>
      <PencilIcon /> Edit page
    </NextLink>
  )
}
