'use client'

import { PencilIcon } from '@heroicons/react/24/outline'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import { type PagePath, pagePaths } from '@/lib/schemas'

export function EditButton() {
  const pathname = usePathname()
  if (!pathname) return null

  const pathnameParts = pathname.split('/')
  const lastPart = pathnameParts[pathnameParts.length - 1]
  if (lastPart === 'edit' || lastPart === 'new') return null

  const firstPart = pathnameParts[1]
  const isEditablePath = pagePaths.includes(firstPart as PagePath)
  if (
    !isEditablePath ||
    (pathnameParts.length === 2 && firstPart !== 'about')
  )
    return null

  return (
    <NextLink href={`${pathname}/edit`} className='button-primary'>
      <PencilIcon /> Edit page
    </NextLink>
  )
}
