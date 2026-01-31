'use client'

import { PencilIcon } from '@heroicons/react/24/outline'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

// FIXME: use pagePathType
const editablePaths = [
  'about',
  'events',
  'release'
]

export function EditButton () {
  const pathname = usePathname()
  const pathnameParts = pathname.split('/')
  const firstPart = pathnameParts[1]
  const isEditablePath = editablePaths.includes(firstPart)

  if (!isEditablePath || (pathnameParts.length === 2 && firstPart !== 'about')) return null
  if (!pathname) return null

  return (
    <NextLink
      href={`${pathname}/edit`}
      className='button-primary'
    >
      <PencilIcon /> Edit page
    </NextLink>
  )
}
