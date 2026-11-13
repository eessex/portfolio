'use client'

import { usePathname } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

function PathnameWatcher({ onChange }: { onChange: () => void }) {
  const pathname = usePathname()
  const lastPathname = useRef(pathname)

  useEffect(() => {
    if (pathname === lastPathname.current) return
    lastPathname.current = pathname
    onChange()
  }, [pathname, onChange])

  return null
}

/** Calls `onChange` on navigation; its own Suspense keeps the pathname from blocking prerender */
export function OnPathnameChange({
  onChange
}: {
  onChange: () => void
}) {
  return (
    <Suspense fallback={null}>
      <PathnameWatcher onChange={onChange} />
    </Suspense>
  )
}
