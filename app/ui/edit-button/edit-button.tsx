'use client'

import { PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const editablePaths = [
  'about',
  'events',
  'release'
]

export function EditButton ({ className }: { className?: string }) {
  const pathname = usePathname()
  const pathnameParts = pathname.split('/')
  const firstPart = pathnameParts[1]
  const isEditablePath = editablePaths.includes(firstPart)
  if (!isEditablePath || (pathnameParts.length === 2 && firstPart !== 'about')) return null
  if (!pathname) return null

  return (
    <li>
      <Link href={`${pathname}/edit`} className={`button ${className}`}>
        <PencilIcon /> Edit Page
      </Link>
    </li>
  )
}
